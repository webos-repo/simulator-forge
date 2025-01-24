import { convertTo2Way } from '@share/structure/orientations';
import { resolveHtmlPath } from '../lib/pathResolver';
import { getWebOSVersion } from '../lib/simulInfo';
import { getTouchMode, toggleTouchMode } from '@settings/touchMode';
import { getTargetFilePath } from '@share/lib/paths';
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import windowSetting from '@settings/windowSetting';
import {
  emtApp,
  emtDev,
  emtService,
  emtSetting,
  emtWindow,
} from '../module/eventEmitters';
import LogMessage, { showErrorBox } from '../lib/logMessage';
import { productName } from 'package.json';
import { ipcHandler } from '@share/lib/utils';
import type { Orientation } from '@share/structure/orientations';

class MainWindow extends BrowserWindow {
  private backupAppList?: string;
  isDialogOpened = false;
  isRendererLoaded = false;

  constructor() {
    super({
      ...windowSetting.bound,
      useContentSize: true,
      autoHideMenuBar: false,
      title: productName,
      icon: getTargetFilePath('assets', 'icon.png'),
      show: false,
      acceptFirstMouse: true,
      resizable: false,
      fullscreen: false,
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.setEventHandler();
    this.initialize(resolveHtmlPath('index.html'));
  }

  private initialize = (url: string) => {
    this.once('ready-to-show', () => {
      this.fixContentSize();
      this.show();
      this.webContents.zoomFactor = windowSetting.zoom;
      emtWindow.emit('main-window-ready-to-show');
    });

    this.loadURL(url);
    this.setAutoHideMenuBar(false);
  };

  private setEventHandler = () => {
    ipcMain
      .once('main-screen-loaded', this.afterFinishLoad)
      .on('app-icon-right-click', ipcHandler(this.openAppIconContextMenu));

    emtWindow
      .onWithIpcMain('open-app-dialog', this.openDialogApp)
      .onWithIpcMain('open-service-dialog', this.openDialogService);

    emtApp.on('app-list-updated', this.sendUpdatedAppList);

    emtSetting.on('change-zoomFactor', this.changeZoomFactor);

    emtDev.on('open-devtools-main', () =>
      this.webContents?.openDevTools({ mode: 'detach' })
    );
  };

  private afterFinishLoad = () => {
    if (this.backupAppList) this.sendUpdatedAppList(this.backupAppList);
    this.isRendererLoaded = true;
  };

  private sendUpdatedAppList = (appListDataStr: string) => {
    if (!appListDataStr) return;
    this.webContents?.send('app-list-updated', appListDataStr);
    this.backupAppList = appListDataStr;
  };

  private fixContentSize = () => {
    const { width, height } = windowSetting.size;
    this.setContentSize(width, height);
    const { width: realWidth, height: realHeight } = this.getContentBounds();
    const diffWidth = width - realWidth;
    const diffHeight = height - realHeight;
    if (diffWidth || diffHeight) {
      this.setContentSize(width + diffWidth, height + diffHeight);
    }
  };

  private openDialogApp = async () => {
    if (this.isDialogOpened) return;
    this.isDialogOpened = true;
    try {
      const result = await dialog.showOpenDialog({
        defaultPath: app.getPath('home'),
        properties: ['openDirectory'],
      });
      if (result.canceled) return;
      if (result.filePaths.length > 1) {
        throw new LogMessage(
          'error',
          'App launch error',
          'Select only one app directory.'
        );
      }
      emtApp.emit('launch-app', { appPath: result.filePaths[0] });
    } catch (e: any) {
      showErrorBox(e);
    } finally {
      this.isDialogOpened = false;
    }
  };

  private openDialogService = async () => {
    if (this.isDialogOpened) return;
    this.isDialogOpened = true;
    try {
      const result = await dialog.showOpenDialog({
        defaultPath: app.getPath('home'),
        properties: ['openDirectory'],
      });
      if (result.canceled) return;
      if (result.filePaths.length > 1) {
        throw new LogMessage(
          'error',
          'Service add error',
          'Select only one service directory.'
        );
      }
      emtService.emit(
        'add-js-service',
        [{ dirPath: result.filePaths[0], isActive: true }],
        { isFromUser: true }
      );
      emtWindow.emit('js-service-window-open');
    } catch (e: any) {
      showErrorBox(e);
    } finally {
      this.isDialogOpened = false;
    }
  };

  private openAppIconContextMenu = (appId: string) => {
    Menu.buildFromTemplate([
      {
        label: 'Remove',
        click: () => {
          emtApp.emit('remove-app-from-list', appId);
        },
      },
    ]).popup({ window: this });
  };

  setOrientation = (newOrn: Orientation) => {
    if (windowSetting.orn === newOrn) {
      emtWindow.emit('change-window-orientation-done');
      return false;
    }
    const newOrn2Way = convertTo2Way(newOrn);
    emtWindow.emit('main-window-orientation-will-change', newOrn);
    this.once('resize', () => {
      windowSetting.setOrn(newOrn);
      emtWindow.emit('change-window-orientation-done');
      emtWindow.emit('main-window-orientation-changed', windowSetting.orn2Way);
    });
    if (process.platform === 'win32' && getWebOSVersion() === '6.0') {
      this.preventWhiteScreenByTouchView();
    }
    if (newOrn2Way === 'landscape') this.setLandscape();
    else if (newOrn2Way === 'portrait') this.setPortrait();
    return true;
  };

  private setLandscape = () => {
    windowSetting.setOrn2Way('landscape');
    this.fixContentSize();
  };

  private setPortrait = () => {
    windowSetting.setOrn2Way('portrait');
    this.fixContentSize();
  };

  private changeZoomFactor = (zoomFactor: number) => {
    this.webContents.zoomFactor = zoomFactor;
    this.fixContentSize();
  };

  private preventWhiteScreenByTouchView = () => {
    if (!getTouchMode()) return;
    toggleTouchMode();
    emtWindow.once('change-window-orientation-done', () => {
      setTimeout(() => toggleTouchMode(), 1);
    });
  };

  setSpinner = (isShow: boolean) => {
    this.webContents.send('set-spinner', isShow);
  };
}

export default MainWindow;
