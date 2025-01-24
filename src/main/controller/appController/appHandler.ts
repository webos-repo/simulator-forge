import { getTargetDirPath } from '@share/lib/paths';
import { ipcHandler, sleep } from '@share/lib/utils';
import type { RCUButtonEventType } from '@share/structure/events';
import type { RCU_Button, ShareFrameIdParam } from '@share/structure/ipcParams';
import type { Orientation } from '@share/structure/orientations';
import { ipcMain } from 'electron';
import type { IpcMainEvent } from 'electron';
import _ from 'lodash';
import path from 'path';
import { VKBPriorityKeys } from '../../lib/keyManager';
import {
  emtApp,
  emtSetting,
  emtView,
  emtWindow,
} from '../../module/eventEmitters';
import overlayController from '../OverlayController';
import { appInfos, runningApps } from './appMemory';
import {
  focusFgApp,
  invokeWheel,
  setMutedFgApp,
  preventCursorHide,
  sendToFgApp,
  setAppCurOrn,
  toggleFgAppInspector,
  toggleMuteFgApp,
  sendToAppById,
} from './appCommander';
import {
  closeAppById,
  closeAppByPath,
  closeFgApp,
  launchApp,
  launchAppByArgv,
  launchAppById,
  moveFgAppToBg,
  relaunchApp,
  reloadApp,
} from './appLancher';
import {
  callIfFgAppById,
  loadAppInfoFromDB,
  reqChangeWindowOrn,
  reqNotiCloseRotate,
  reqPreventScreenSaver,
} from './appLib';

export function listenAppEvent() {
  ipcMain
    .on('main-screen-loaded', ipcHandler(handleMainScreenReady))
    .on('rcu-button', ipcHandler(handleRCUInput))
    .on('platform-back', ipcHandler(callIfFgAppById(handlePlatformBack)))
    .on('req-change-app-orn', ipcHandler(handleChangeAppOrn))
    .on('vkb-key-pressed', ipcHandler(handleVKBInput))
    .on('blank-opened', handleBlankOpened)
    .on('find-video-rect-res', ipcHandler(handleFoundVideoRect))
    .on('prevent-cursor-hide', ipcHandler(preventCursorHide))
    .on('close-app-by-id', ipcHandler(closeAppById))
    .on('app-deactivate', ipcHandler(callIfFgAppById(moveFgAppToBg)))
    .on(
      'prevent-screen-saver-from-assistant',
      ipcHandler(reqPreventScreenSaver)
    )
    .on('share-frame-id', handleShareFrameId);
  ipcMain.handle('is-app-focused', () =>
    runningApps.fgApp?.webContents.isFocused()
  );
  emtApp
    .onWithIpcMain('launch-app', launchApp)
    .on('failed-to-launch-app', appInfos.removeByPath)
    .on('launch-app-by-id', launchAppById)
    .on('close-app-by-path', closeAppByPath)
    .onWithIpcMain('close-fg-app', closeFgApp)
    .onWithIpcMain('toggle-inspector', toggleFgAppInspector)
    .on('watcher-app-modified', reloadApp)
    .on('watcher-app-modified-appinfo', relaunchApp)
    .on('remove-app-from-list', handleAppRemoved)
    .onWithIpcMain('rcu-back', handleRCUBack)
    .on('call-home', handleHome)
    .on('invoke-wheel', invokeWheel)
    .on('video-paused', handleVideoPaused)
    .on('vkb-state-changed', handleVKBStateChanged)
    .on('send-to-fg-app', sendToFgApp)
    .on('send-to-app-by-id', sendToAppById)
    .on('fg-app-audio-mute-toggle', setMutedFgApp);
  emtWindow
    .on('main-window-ready-to-show', handleMainWindowReady)
    .on('main-window-focused', focusFgApp)
    .on('main-window-orientation-will-change', setAppCurOrn)
    .on('overlay-focused', focusFgApp);
  emtView.on('view-added', handleViewAdded);
  emtSetting
    .on('database-is-reset', loadAppInfoFromDB)
    .on('screen-orientation-changed', handleScrOrnChanged)
    .on('screen-saver-state-changed', handleScrSaverStateChanged);
}

function handleMainWindowReady() {
  loadAppInfoFromDB();
  appInfos.update();
}

function handleMainScreenReady() {
  if (process.env.NODE_ENV === 'production' && process.argv.length >= 2) {
    sleep(500).then(() => launchAppByArgv());
  }
}

function handleRCUInput(data: RCU_Button) {
  const { keyCode, rcuEventType, isTouchRemote } = data;
  reqPreventScreenSaver();
  if (!isTouchRemote) overlayController.hideTouchRemote();

  if (keyCode === 'Home') {
    handleHome(rcuEventType);
    return;
  }
  if (keyCode === 'Mute') {
    handleRCUMuteAudio(rcuEventType);
    return;
  }
  if (overlayController.checkShowingByName('appExit')) {
    // FIXME: send key to appExitView and move focus
    return;
  }
  if (_.includes(VKBPriorityKeys, keyCode)) {
    const vkb = overlayController.getShowingVKB();
    if (vkb) {
      vkb.handleRCUInput(keyCode, rcuEventType);
      return;
    }
  }
  runningApps.fgApp?.hideCursor();
  runningApps.fgApp?.handleRCUInput(keyCode, rcuEventType);
}

function handleRCUBack(isTouchRemote?: boolean) {
  if (overlayController.hideOverlayByBack() || !runningApps.fgApp) return;
  if (runningApps.fgApp.disableBackHistoryAPI) {
    handleRCUInput({
      keyCode: 'Back',
      rcuEventType: 'down',
      isTouchRemote,
    });
    handleRCUInput({
      keyCode: 'Back',
      rcuEventType: 'up',
      isTouchRemote,
    });
    return;
  }
  if (runningApps.fgApp.webContents.canGoBack()) {
    runningApps.fgApp.webContents.goBack();
    return;
  }
  handlePlatformBack();
}

function handlePlatformBack() {
  overlayController.showExit();
}

function handleVKBInput(key: string) {
  const fgApp = runningApps.fgApp;
  if (!fgApp) return;
  if (key === 'ClearAll') {
    fgApp.sendToFrames({ channel: 'clear-input' });
    return;
  }
  if (key === 'Enter') {
    fgApp.webContents.focus();
  }
  fgApp.sendKeyEvent('keydown', key);
  if (key !== 'Shift' && key !== 'Enter') {
    fgApp.sendKeyEvent('keypress', key);
  }
  fgApp.sendKeyEvent('keyup', key);
}

function handleVKBStateChanged(visibility: boolean) {
  if (!runningApps.fgApp) return;
  runningApps.fgApp.invokeWebOSEvent('keyboardStateChange', {
    detail: { visibility },
  });
  runningApps.fgApp.sendToFrames({
    channel: 'vkb-state-changed',
    args: [visibility],
  });
}

function handleHome(rcuEventType: RCUButtonEventType) {
  if (rcuEventType === 'down') return;
  overlayController.hideAllOverlay();
  moveFgAppToBg();
}

function handleRCUMuteAudio(eventType: RCUButtonEventType) {
  if (eventType === 'down' || !runningApps.fgApp) return;
  toggleMuteFgApp();
}

function handleVideoPaused(appPath: string) {
  if (!runningApps.isFgApp({ appPath })) return;
  emtApp.emit('video-paused-fg-app');
}

function handleChangeAppOrn(appId: string, orientation: Orientation) {
  const requester = runningApps.findById(appId);
  if (!requester) return;
  runningApps.ornChangeRequestedApp = requester;
  reqChangeWindowOrn(orientation);
}

function handleFoundVideoRect(appPath: string, rect: Electron.Rectangle) {
  runningApps.findByPath(appPath)?.storeVideoRect(rect);
  if (runningApps.isFgApp({ appPath })) runningApps.fgApp!.emitVideoRect();
}

function handleAppRemoved(appId: string) {
  closeAppById(appId);
  appInfos.removeById(appId);
}

function handleBlankOpened() {
  const fgApp = runningApps.fgApp;
  if (!fgApp) return;
  fgApp.webContents.loadURL(
    `file://${path.resolve(getTargetDirPath('assets'), 'blank.html')}`
  );
  fgApp.webContents.once('did-finish-load', () => {
    fgApp.insertCSS('body { background-color: black }');
  });
}

function handleViewAdded(_view: unknown, isOverlay: boolean) {
  if (!isOverlay || !runningApps.fgApp) return;
  runningApps.fgApp.hideCursor();
  runningApps.fgApp.leaveMouse();
  runningApps.fgApp.sendToFrames({ channel: 'overlay-appear' });
}

function handleScrOrnChanged(screenOrientation: Orientation) {
  if (!runningApps.fgApp) return;
  if (
    screenOrientation !== 'landscape' &&
    runningApps.fgApp.appInfo.closeOnRotation
  ) {
    moveFgAppToBg();
    reqNotiCloseRotate();
    return;
  }
  runningApps.fgApp.changedScrOrn(screenOrientation);
}

function handleScrSaverStateChanged(state: boolean) {
  if (state) {
    runningApps.fgApp?.hideCursor();
  } else {
    runningApps.fgApp?.showCursor();
  }
}

function handleShareFrameId(e: IpcMainEvent, { appId }: ShareFrameIdParam) {
  runningApps.findById(appId)?.addFrameId(e.frameId);
}
