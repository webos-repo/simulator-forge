import { runningApps } from '@controller/appController/appMemory';
import overlayController from '@controller/OverlayController';
import windowController from '@controller/WindowController';
import { ipcHandler } from '@share/lib/utils';
import { emtDev } from '../module/eventEmitters';

function setDevListener() {
  emtDev
    .onWithIpcMain(
      'dev-test1',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test2',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test3',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test4',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test5',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test6',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-test7',
      ipcHandler(async (...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-preload-test1',
      ipcHandler((...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-preload-test2',
      ipcHandler((...data: any[]) => {})
    )
    .onWithIpcMain(
      'dev-preload-test3',
      ipcHandler((...data: any[]) => {})
    );
}

function setDevtoolsOpenListener() {
  emtDev.on('open-devtools', (name: string) => {
    if (name === 'fgApp') {
      runningApps.fgApp?.webContents.openDevTools({ mode: 'detach' });
      return;
    }
    const targetWindow = windowController.getWindowByName(name);
    if (targetWindow) {
      targetWindow.webContents.openDevTools({ mode: 'detach' });
      return;
    }
    const targetOverlay = overlayController.getOverlayByName(name);
    if (targetOverlay) {
      targetOverlay.webContents.openDevTools({ mode: 'detach' });
    }
  });
}

function turnOnDevMode() {
  setDevListener();
  setDevtoolsOpenListener();
}

export { turnOnDevMode };
