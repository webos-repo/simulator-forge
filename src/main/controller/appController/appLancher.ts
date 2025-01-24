import { getTouchMode } from '@settings/touchMode';
import type { AppInfo } from '@share/structure/appInfo';
import AppView from '@view/AppView';
import { showErrorBox } from '../../lib/logMessage';
import { readAppEntry, readAppInfo } from '../../lib/metaFileReader';
import Mutex from '../../lib/mutex';
import { getUserAgents } from '../../lib/userAgents';
import { emtApp, emtView, emtWindow } from '../../module/eventEmitters';
import overlayController from '../OverlayController';
import {
  checkAppInfoRequirements,
  checkCloseOnRotation,
  checkIsAlreadyRunning,
  makeWebosEnv,
  reqChangeWindowOrn,
  reqNotiCloseRotate,
  reqPreventScreenSaver,
} from './appLib';
import { appInfos, runningApps } from './appMemory';

const launchMutex = new Mutex();

function launchApp({
  appPath,
  launchParams,
}: {
  appPath: string;
  launchParams?: string;
}) {
  if (launchMutex.isLockOrLock(2000)) return;

  let appInfo: AppInfo;
  let newAppView: AppView | undefined;

  try {
    appInfo = readAppInfo(appPath);
    if (checkIsAlreadyRunning(appInfo)) {
      switchApp(appInfo);
      return;
    }
    checkAppInfoRequirements(appInfo);
    if (checkCloseOnRotation(appInfo)) {
      reqNotiCloseRotate();
      return;
    }
    moveFgAppToBg();
    emtWindow.emit('set-spinner', true);
    newAppView = makeAppView(appInfo, launchParams);
    setAfterFirstLoadHandler(newAppView);
    newAppView.load();
    runningApps.add(newAppView);
  } catch (err) {
    if (newAppView) runningApps.removeAppById(newAppView.appId);
    emtWindow.emit('set-spinner', false);
    emtApp.emit('failed-to-launch-app', appPath);
    showErrorBox(err);
  }
}

function launchAppByArgv() {
  launchApp({
    appPath: process.argv[1],
    launchParams: process.argv.length > 2 ? process.argv[2] : undefined,
  });
}

function launchAppById({
  appId,
  launchParams,
}: {
  appId: string;
  launchParams?: string;
}) {
  const appInfo = appInfos.findById(appId);
  if (!appInfo) return;
  launchApp({ appPath: appInfo.appPath, launchParams });
}

function makeAppView(appInfo: AppInfo, launchParams?: string) {
  return new AppView({
    appInfo,
    appEntry: readAppEntry(appInfo.appPath),
    launchParams,
    webOSEnv: makeWebosEnv(appInfo, launchParams),
    userAgent: getUserAgents(),
    backgroundLaunched: false,
  });
}

function relaunchApp(appId: string) {
  const appView = runningApps.findById(appId);
  if (!appView) return;
  const { appPath, launchParams } = appView;
  closeFgApp();
  launchApp({ appPath, launchParams });
}

function reloadApp(appId: string) {
  const appView = runningApps.findById(appId);
  if (!appView) return;
  if (appView.webContents.getURL() !== `file://${appView.appEntry}`) {
    appView.load();
    return;
  }
  appView.webContents.reload();
}

function closeFgApp() {
  return closeApp(runningApps.fgApp);
}

function closeAppById(appId: string) {
  closeApp(runningApps.findById(appId));
}

function closeAppByPath(appPath: string) {
  closeApp(runningApps.findById(appPath));
}

function closeApp(appView?: AppView) {
  if (!appView) return;
  if (appView === runningApps.fgApp) {
    overlayController.hideAllOverlay();
    emtView.emit('unset-touch-view');
    runningApps.resetFgApp();
  }
  emtWindow.emit('remove-view', appView);
  appView.clear();
  (appView.webContents as any)?.destroy();
  runningApps.removeAppById(appView.appId);
  emtWindow.emit('set-landscape');
  appInfos.update();
}

function clearAllApp() {
  closeFgApp();
  runningApps.apps.forEach((appView) => {
    appView.clear();
    emtWindow.emit('remove-view', appView);
  });
  runningApps.reset();
  appInfos.update();
}

function setAfterFirstLoadHandler(appView: AppView) {
  appView.webContents
    .once('did-finish-load', () => {
      moveAppToFg(appView);
      appInfos.add(appView.appInfo);
    })
    .on('did-finish-load', appView.afterLoad);
}

function moveAppToFg(appView: AppView) {
  emtWindow.once('change-window-orientation-done', () => {
    appView.handleForeground();
    emtWindow.emit('set-view', appView);
    runningApps.setFgApp(appView);
    emtApp.emit('fg-app-changed', appView);
    if (getTouchMode()) emtView.emit('set-touch-view');
    appInfos.update();
    reqPreventScreenSaver();
    emtWindow.emit('clear-main-screen');
  });
  reqChangeWindowOrn(appView.curOrientation);
}

function moveFgAppToBg() {
  const fgApp = runningApps.fgApp;
  if (!fgApp) return;
  runningApps.resetFgApp();
  overlayController.hideAllOverlay();
  emtWindow.emit('remove-view', fgApp);
  fgApp.handleBackground();
  emtApp.emit('fg-app-removed');
  emtView.emit('unset-touch-view');
  appInfos.update();
}

function switchApp(appInfo: AppInfo) {
  const appView = runningApps.findById(appInfo.id);
  if (!appView) return;
  if (runningApps.fgApp) {
    if (runningApps.fgApp === appView) return;
    moveFgAppToBg();
  }
  emtWindow.emit('set-spinner', true);
  setTimeout(() => {
    moveAppToFg(appView);
    appView.invokeWebOSEvent('webOSRelaunch');
  }, 500);
}

export {
  launchApp,
  launchAppByArgv,
  launchAppById,
  reloadApp,
  relaunchApp,
  closeFgApp,
  closeApp,
  closeAppById,
  closeAppByPath,
  clearAllApp,
  moveFgAppToBg,
};
