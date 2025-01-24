import type { Orientation } from '@share/structure/orientations';
import type { MovePos } from '@share/structure/positions';
import type { SendToFramesParam } from '@view/AppView';
import overlayController from '../OverlayController';
import { runningApps } from './appMemory';

const mouseHideDelay = 6000;
let mouseHideTimerId: NodeJS.Timeout | null = null;

function setMutedFgApp(muted: boolean) {
  runningApps.fgApp?.webContents.setAudioMuted(muted);
}

function toggleMuteFgApp() {
  setMutedFgApp(!runningApps.fgApp?.webContents.isAudioMuted());
}

function focusFgApp() {
  runningApps.fgApp?.webContents.focus();
}

function setAppCurOrn(orientation: Orientation) {
  if (!runningApps.ornChangeRequestedApp) return;
  const requester = runningApps.ornChangeRequestedApp;
  runningApps.ornChangeRequestedApp = undefined;

  requester.curOrientation = orientation;
  requester.sendToFrames({
    channel: 'current-orientation-changed',
    args: [orientation],
  });
}

function toggleFgAppInspector() {
  if (runningApps.fgApp?.webContents.isDevToolsOpened()) {
    runningApps.fgApp?.webContents.closeDevTools();
  } else {
    runningApps.fgApp?.webContents.openDevTools({ mode: 'detach' });
  }
}

function preventCursorHide({ appPath }: { appPath: string }) {
  if (!runningApps.isFgApp({ appPath })) return;
  if (mouseHideTimerId) {
    clearTimeout(mouseHideTimerId);
    mouseHideTimerId = null;
  }
  runningApps.fgApp?.showCursor();
  if (!overlayController.isAnyShowing()) {
    runningApps.fgApp?.enterMouse();
  }
  mouseHideTimerId = setTimeout(
    () => runningApps.fgApp?.hideCursor(),
    mouseHideDelay
  );
}

function invokeWheel(eventData: MovePos) {
  const { x, y, movementX: deltaX, movementY: deltaY } = eventData;
  runningApps.fgApp?.webContents.sendInputEvent({
    type: 'mouseWheel',
    x,
    y,
    deltaX,
    deltaY,
    canScroll: true,
  });
}

function sendToFgApp(params: SendToFramesParam) {
  runningApps.fgApp?.sendToFrames(params);
}

function sendToAppById(appId: string, params: SendToFramesParam) {
  runningApps.findById(appId)?.sendToFrames(params);
}

export {
  setMutedFgApp,
  toggleMuteFgApp,
  focusFgApp,
  setAppCurOrn,
  preventCursorHide,
  toggleFgAppInspector,
  invokeWheel,
  sendToFgApp,
  sendToAppById,
};
