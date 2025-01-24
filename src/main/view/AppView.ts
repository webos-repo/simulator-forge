import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { constStore } from '@share/store/constStore';
import type { AppInfo } from '@share/structure/appInfo';
import type {
  MouseEventType,
  RCUButtonEventType,
  TouchEventType,
} from '@share/structure/events';
import type { Direction, Orientation } from '@share/structure/orientations';
import type { WebOSEnv } from '@share/structure/webOSEnv';
import {
  convertKey,
  convertKeyType,
  isCustomKey,
  isRequirePress,
} from '../lib/keyManager';
import { getElectronVersion } from '../lib/simulInfo';
import { DefaultRect } from '@share/constant/defaults';
import { ipcHandler } from '@share/lib/utils';
import { app, BrowserView } from 'electron';
import path from 'path';
import _ from 'lodash';
import watcherManger from '../module/watcher';
import { emtApp, emtSetting } from '../module/eventEmitters';
import { isAutoInspectorOn } from '@settings/autoInspector';
import windowSetting from '@settings/windowSetting';
import type chokidar from 'chokidar';

type AppViewConstructorParams = {
  appInfo: AppInfo;
  appEntry: string;
  launchParams?: string;
  webOSEnv: WebOSEnv;
  userAgent: string;
  backgroundLaunched?: boolean;
};

type SendToFramesParam = {
  channel: string;
  args?: any[];
  frameId?: number;
};

const CSSLikeTV = `
  html { user-select: none; overflow: hidden; }
  * { cursor: default; font-family: "LG Display-Regular"; font-weight: 400 !important; }
`;
const CSSCursorHide = '* { cursor: none }';
const PropsAffectedByZoom: Readonly<string[]> = [
  'x',
  'y',
  'movementX',
  'movementY',
];

const calcMouseWithWindowZoom = (mouseEvent: MouseEventType) => {
  const windowZoom = windowSetting.zoom;
  return _.mapValues(mouseEvent, (value, prop) => {
    if (_.includes(PropsAffectedByZoom, prop)) {
      return (value as number) * windowZoom;
    }
    return value;
  });
};

class AppView extends BrowserView {
  name = 'AppView';
  appInfo: AppInfo;
  appId: string;
  appPath: string;
  appEntry: string;
  launchParams?: string;
  disableBackHistoryAPI: boolean;
  state: 'background' | 'foreground';
  curOrientation: Orientation = 'landscape';
  private readonly userAgent: string;
  private readonly resolution: string;
  private watcher: chokidar.FSWatcher | null | undefined;
  private isCursorShowing = true;
  private keyDownTimer?: NodeJS.Timeout;
  private videoRect = DefaultRect;
  private isMouseEntered = false;
  private frameIds: number[] = [];

  constructor({
    appInfo,
    appEntry,
    launchParams,
    webOSEnv,
    userAgent,
    backgroundLaunched = false,
  }: AppViewConstructorParams) {
    super({
      webPreferences: {
        additionalArguments: [`--webos-env=${JSON.stringify(webOSEnv)}`],
        contextIsolation: true,
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webSecurity: false,
        // deprecated in electron 18
        ...(getElectronVersion().major <= 18 ? { nativeWindowOpen: true } : {}),
        ...(getElectronVersion().major <= 12
          ? { worldSafeExecuteJavaScript: true }
          : {}),
        defaultFontFamily: {
          // TODO: serif, sans-serif check
          standard: 'LG Display-Regular',
          sansSerif: 'LG Display-Regular',
          serif: 'LG Display-Regular',
        },
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../../.erb/dll/preload.js'),
      },
    });

    this.appInfo = appInfo;
    this.appId = appInfo.id;
    this.appPath = appInfo.appPath;
    this.appEntry = appEntry;
    this.disableBackHistoryAPI = !!appInfo.disableBackHistoryAPI;
    this.resolution = appInfo.resolution || '1920x1080';
    this.launchParams = launchParams;
    this.userAgent = userAgent;
    this.state = backgroundLaunched ? 'background' : 'foreground';

    this.setEventHandler();
    this.preventNewWindow();
  }

  load = () => {
    this.webContents.loadURL(`file://${this.appEntry}`, {
      userAgent: this.userAgent,
    });
  };

  clear = () => {
    if (this.keyDownTimer) {
      clearTimeout(this.keyDownTimer);
    }
    this.webContents.closeDevTools();
    this.removeWatcher();
    this.removeExternalEventHandler();
  };

  private setEventHandler = () => {
    this.webContents
      .on('did-frame-finish-load', ipcHandler(this.handleFrameLoaded))
      .on('media-started-playing', this.handleMediaStart)
      .on('media-paused', this.handleMediaPaused);

    emtSetting.on('change-zoomFactor', this.fitZoomFactor);
  };

  private removeExternalEventHandler = () => {
    emtSetting.removeListener('change-zoomFactor', this.fitZoomFactor);
  };

  afterLoad = () => {
    this.invokeWebOSEvent('webOSLaunch');
    this.fitSize();
    this.fitZoomFactor();
    this.insertCSS(CSSLikeTV, true);
    this.hideCursor();
    this.webContents.focus();
    this.sendToFrames({ channel: 'wrap-window-api' });
  };

  private preventNewWindow = () => {
    if (getElectronVersion().major < 12) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        if (url) this.webContents.loadURL(url);
      });
    } else {
      (this.webContents as any).setWindowOpenHandler((details: any) => {
        if (details.url) this.webContents.loadURL(details.url);
        return { action: 'deny' };
      });
    }
  };

  private setSize = (width: number, height: number) => {
    this.setBounds({
      x: 0,
      y: checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0,
      width,
      height,
    });
    this.setAutoResize({ width: true, height: true });
  };

  private fitSize = () => {
    const { width, height } = windowSetting.size;
    this.setSize(width, height);
  };

  private fitZoomFactor = () => {
    const appWidth = this.resolution === '1280x720' ? 1280 : 1920;
    this.webContents.zoomFactor = windowSetting.getLongSide() / appWidth;
  };

  private setWatcher = async () => {
    // Check already watching other files
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.watcher = watcherManger.getWatcher(this.appPath, this.appId);
  };

  private removeWatcher = () => {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  };

  insertCSS = (css: string, force = false) => {
    this.sendToFrames({ channel: 'insert-css', args: [css, force] });
  };

  private removeCSS = (css: string) => {
    this.sendToFrames({ channel: 'remove-css', args: [css] });
  };

  sendToFrames = ({
    channel,
    args,
    frameId: specificFrameId,
  }: SendToFramesParam) => {
    if (specificFrameId) {
      this.webContents.sendToFrame(specificFrameId, channel, ...(args || []));
      return;
    }
    this.frameIds.forEach((frameId) => {
      this.webContents.sendToFrame(frameId, channel, ...(args || []));
    });
  };

  sendKeyEvent = (type: 'keydown' | 'keyup' | 'keypress', keyCode: string) => {
    if (isCustomKey(keyCode)) {
      this.sendToFrames({
        channel: 'invoke-custom-key',
        args: [type, keyCode],
      });
      return;
    }

    this.webContents.sendInputEvent({
      type: convertKeyType(type),
      keyCode: convertKey(keyCode),
    });
  };

  invokeEventsByTouch = (touchEvent: TouchEventType, isShortHold: boolean) => {
    this.sendToFrames({
      channel: 'invoke-event-by-touch',
      args: [touchEvent, isShortHold],
    });
  };

  sendMouseEvent = (mouseEvent: MouseEventType) => {
    const mouseEventCalc = calcMouseWithWindowZoom(mouseEvent);
    if (mouseEventCalc.type === 'click') {
      this.sendToFrames({
        channel: 'invoke-mouse-click',
        args: [mouseEventCalc],
      });
      return;
    }
    this.webContents.sendInputEvent(mouseEventCalc as any);
  };

  sendSwipeEvent = (direction: Direction) => {
    this.sendKeyEvent('keydown', direction);
    this.sendKeyEvent('keyup', direction);
  };

  handleRCUInput = (keyCode: string, eventType: RCUButtonEventType) => {
    if (this.keyDownTimer) {
      clearTimeout(this.keyDownTimer);
      this.keyDownTimer = undefined;
    }

    if (eventType === 'down') {
      // keydown & keypress
      this.sendKeyEvent('keydown', keyCode);
      if (isRequirePress(keyCode)) {
        this.sendKeyEvent('keypress', keyCode);
      } else {
        this.keyDownTimer = setTimeout(() => {
          this.keyDownTimer = setInterval(() => {
            this.sendKeyEvent('keydown', keyCode);
          }, 100);
        }, 500);
      }
    } else if (eventType === 'up') {
      this.sendKeyEvent('keyup', keyCode);
    } else {
      this.sendKeyEvent('keypress', keyCode);
    }
  };

  private handleMediaStart = () => {
    this.sendToFrames({ channel: 'find-video-rect' });
  };

  private handleMediaPaused = () => {
    emtApp.emit('video-paused', this.appPath);
  };

  invokeWebOSEvent = (type: string, props?: CustomEventInit) => {
    this.sendToFrames({ channel: 'invoke-webos-event', args: [type, props] });
  };

  handleForeground = () => {
    this.state = 'foreground';
    this.setWatcher();
    this.sendToFrames({ channel: 'go-foreground' });
    this.emitVideoRect();
    this.resumeByDebugger();

    if (isAutoInspectorOn()) {
      // this.webContents.once('devtools-focused', this.webContents.focus);
      this.webContents.openDevTools({ mode: 'detach' });
    }
  };

  emitVideoRect = () => {
    emtApp.emit(
      'video-rect',
      _.mapValues(this.videoRect, (p) =>
        _.round(p * this.webContents.zoomFactor)
      )
    );
  };

  handleBackground = () => {
    this.state = 'background';
    this.webContents.closeDevTools();
    this.removeWatcher();
    this.hideCursor();
    this.leaveMouse();
    this.sendToFrames({ channel: 'go-background' });
    this.pauseByDebugger();
    this.storeVideoRect(DefaultRect);
  };

  private pauseByDebugger = () => {
    if (!this.webContents.debugger.isAttached()) {
      this.webContents.debugger.attach('1.1');
      this.webContents.debugger.sendCommand('Debugger.enable');
    }

    this.webContents.debugger.sendCommand('Debugger.pause');
  };

  private resumeByDebugger = () => {
    if (!this.webContents.debugger.isAttached()) return;
    this.webContents.debugger.sendCommand('Debugger.resume');
  };

  enterMouse = () => {
    if (this.isMouseEntered) return;
    this.isMouseEntered = true;
    this.invokeWebOSEvent('webOSMouse', { detail: { type: 'Enter' } });
  };

  leaveMouse = () => {
    if (!this.isMouseEntered) return;
    this.isMouseEntered = false;
    this.invokeWebOSEvent('webOSMouse', { detail: { type: 'Leave' } });
  };

  showCursor = () => {
    if (this.isCursorShowing) return;
    this.isCursorShowing = true;
    this.removeCSS(CSSCursorHide);
    this.invokeCursorStateChange(true);
  };

  hideCursor = () => {
    if (!this.isCursorShowing) return;
    this.isCursorShowing = false;
    this.insertCSS(CSSCursorHide);
    this.invokeCursorStateChange(false);
  };

  changedScrOrn = (screenOrientation: Orientation) => {
    this.sendToFrames({
      channel: 'screen-orientation-changed',
      args: [screenOrientation],
    });
    this.invokeWebOSEvent('screenOrientationChange', {
      detail: { screenOrientation },
    });
  };

  private invokeCursorStateChange = (visibility: boolean) => {
    this.invokeWebOSEvent('cursorStateChange', {
      detail: { visibility },
    });
  };

  private handleFrameLoaded = (
    _isMainFrame: boolean,
    _frameProcessId: number,
    frameRoutingId: number
  ) => {
    this.addFrameId(frameRoutingId);
  };

  addFrameId = (frameId: number) => {
    if (this.frameIds.includes(frameId)) return;
    this.frameIds.push(frameId);
  };

  storeVideoRect = (newVideoRect: Electron.Rectangle) => {
    this.videoRect = { ...newVideoRect };
  };
}

export type { SendToFramesParam };
export default AppView;
