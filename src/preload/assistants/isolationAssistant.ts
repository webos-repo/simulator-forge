import { ipcRenderer, webFrame } from 'electron';
import { ipcHandler } from '@share/lib/utils';
import _ from 'lodash';
import { webOSEnv } from '../lib/appEnv';
import {
  checkElementNeedVKB,
  convertInputToKeyboardType,
  NotPreventKeys,
} from '../lib/keyHelper';
import appState from './appState';
import {
  handlePauseEvent,
  handlePlayEvent,
  pauseMediaWhenBg,
  resumeMediaWhenFg,
} from './mediaController';

const insertedCSS: { [key: string]: string } = {};
let mouseMoveHandler: any;

export function setIpcListener() {
  ipcRenderer
    .on('go-foreground', handleGoFg)
    .on('go-background', handleGoBg)
    .on('vkb-state-changed', ipcHandler(handleKbdStateChanged))
    .on('touch-mode-toggled', ipcHandler(handleTouchModeChanged))
    .on('get-mouse-move-fast-on', turnOnGetSensorData)
    .on('get-mouse-move-fast-off', turnOffGetSensorData)
    .on('overlay-appear', checkAppClick)
    .on('clear-input', clearInput)
    .on('insert-css', ipcHandler(handleInsertCSS))
    .on('remove-css', ipcHandler(handleRemoveCSS))
    .on('find-video-rect', findVideoRect);

  setMouseMoveListener();
}

export function setWindowListener() {
  const listenerArgs: [string, any, any?][] = [
    ['focus', handleFocus, true],
    ['blur', handleBlur, true],
    ['mouseenter', handleMouseEnter, true],
    ['mouseleave', handleMouseLeave, true],
    ['mousedown', handleMouse, true],
    ['mouseup', handleMouse, true],
    ['mousemove', handleMouse, true],
    ['wheel', handleTouchEvent],
    ['keydown', handleKeyEvent, true],
    ['keyup', handleKeyEvent, true],
    ['keypress', handleKeyEvent, true],
    ['play', handlePlayEvent, true],
    ['pause', handlePauseEvent, true],
  ];
  listenerArgs.forEach((data) => {
    window.addEventListener(...data);
  });
}

export function getExposeApi() {
  return {
    windowOpen: (...args: any[]) => {
      const [url, target] = args;
      if (url === 'about:blank' && target === '_self') {
        ipcRenderer.send('blank-opened');
        return true;
      }
      return false;
    },
  };
}

function handleGoFg() {
  resumeMediaWhenFg();
  appState.isActivated = true;
}

function handleGoBg() {
  pauseMediaWhenBg();
  appState.isActivated = false;
}

function handleMouseEnter() {
  ipcRenderer.send('main-window-mouseenter');
}

function handleMouseLeave() {
  ipcRenderer.send('assistant-mouseleave');
}

function handleKeyboardHidden() {
  appState.curInputElm = null;
  if (
    appState.isTouchMode &&
    document.activeElement instanceof HTMLInputElement
  ) {
    document.activeElement.blur();
  }
}

function handleTouchEvent(e: Event) {
  if (appState.isTouchMode) e.stopPropagation();
}

function handleKbdStateChanged(visibility: boolean) {
  appState.isKeyboardVisible = visibility;
  if (!visibility) handleKeyboardHidden();
}

function handleTouchModeChanged(isTouchMode: boolean) {
  appState.isTouchMode = isTouchMode;
}

function handleMouse() {
  preventCursorHide();
  preventScreenSaver();
}

function handleKeyEvent(e: any) {
  preventScreenSaver();
  preventKeyEvent(e);
}

function preventCursorHide() {
  ipcRenderer.send('prevent-cursor-hide', {
    appPath: webOSEnv.appInfo.appPath,
  });
}

function preventScreenSaver() {
  ipcRenderer.send('prevent-screen-saver-from-assistant', {
    appPath: webOSEnv.appInfo.appPath,
  });
}

async function handleFocus(e: FocusEvent) {
  if (checkElementNeedVKB(e.target)) {
    return;
  }
  const target = e.target as HTMLInputElement;
  if (appState.curInputElm === target) {
    e.stopPropagation();
    return;
  }
  if (appState.curInputElm) {
    appState.preInputElms.push(appState.curInputElm);
  }
  appState.curInputElm = target;
  ipcRenderer.send('input-focused', target.type);
}

async function handleBlur(e: FocusEvent) {
  if (checkElementNeedVKB(e.target)) {
    return;
  }
  const target = e.target as HTMLInputElement;
  const isAppFocused = await ipcRenderer.invoke('is-app-focused');
  if (isAppFocused) {
    if (appState.curInputElm === target) {
      ipcRenderer.send('input-blurred', target.type);
      appState.curInputElm = null;
      appState.preInputElms = [];
    } else if (appState.preInputElms.includes(target)) {
      appState.preInputElms = appState.preInputElms.filter(
        (elm) => elm !== target
      );
    }
  }
}

function handleInsertCSS(css: string, force = false) {
  if (insertedCSS[css] && !force) return;
  insertedCSS[css] = webFrame.insertCSS(css);
}

function handleRemoveCSS(css: string) {
  if (!insertedCSS[css]) return;
  webFrame.removeInsertedCSS(insertedCSS[css]);
  delete insertedCSS[css];
}

function setMouseMoveListener() {
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler, true);
  }
  mouseMoveHandler = _.throttle(
    (e: MouseEvent) => {
      ipcRenderer.send('assistant-mousemove', e.clientX, e.clientY);
    },
    appState.getMouseMoveDataFast ? 50 : 500
  );
  window.addEventListener('mousemove', mouseMoveHandler, true);
}

function clearInput() {
  if (appState.curInputElm) {
    appState.curInputElm.value = '';
    appState.curInputElm.dispatchEvent(new Event('input'));
  }
}

function turnOnGetSensorData() {
  if (appState.getSensorDataOnCnt === 0) {
    appState.getMouseMoveDataFast = true;
    setMouseMoveListener();
  }
  appState.getSensorDataOnCnt += 1;
}

function turnOffGetSensorData() {
  if (appState.getSensorDataOnCnt <= 0) return;
  appState.getSensorDataOnCnt -= 1;
  if (appState.getSensorDataOnCnt === 0) {
    appState.getMouseMoveDataFast = false;
    setMouseMoveListener();
  }
}

function checkAppClick() {
  window.addEventListener(
    'mousedown',
    (e) => {
      if (
        e.target &&
        e.target instanceof HTMLInputElement &&
        appState.curInputElm &&
        convertInputToKeyboardType(e.target.type) ===
          convertInputToKeyboardType(appState.curInputElm.type)
      ) {
        return;
      }
      ipcRenderer.send('app-view-clicked');
    },
    { once: true, capture: true }
  );
}

function preventKeyEvent(e: any) {
  if (appState.isKeyboardVisible && !NotPreventKeys.includes(e.key)) {
    e.stopPropagation();
  }
}

function findVideoRect() {
  const videoTags = document.getElementsByTagName('video');

  Array.from(videoTags).some((video) => {
    if (video.paused) return false;
    const { left, top, width, height } = video.getBoundingClientRect();
    ipcRenderer.send('find-video-rect-res', webOSEnv.appInfo.appPath, {
      x: left,
      y: top,
      width,
      height,
    } as Electron.Rectangle);
    return true;
  });
}
