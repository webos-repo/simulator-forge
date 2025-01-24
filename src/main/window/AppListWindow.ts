import { BrowserWindow, ipcMain, Menu } from 'electron';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtApp, emtWindow } from '../module/eventEmitters';
import { ipcHandler } from '@share/lib/utils';

class AppListWindow extends BrowserWindow {
  private backupAppList?: string;

  constructor() {
    super({
      width: 240,
      height: 375,
      minWidth: 220,
      minHeight: 100,
      useContentSize: true,
      title: 'App List',
      acceptFirstMouse: true,
      show: false,
      resizable: true,
      fullscreen: false,
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.loadURL(resolveHtmlPath('index.html', 'app_list'));
    this.setMenuBarVisibility(false);
    this.setEventHandler();
  }

  private setEventHandler = () => {
    this.on('close', this.justHide)
      .on('show', () => emtWindow.emit('app-list-window-show'))
      .on('hide', () => emtWindow.emit('app-list-window-hide'))
      .on('resize', () => {
        this.webContents.send('resized');
      });

    ipcMain
      .once('app-list-screen-loaded', this.afterFinishLoad)
      .on('app-list-right-click', ipcHandler(this.openAppListContextMenu));

    emtApp.on('app-list-updated', this.sendUpdatedAppList);
  };

  private afterFinishLoad = () => {
    if (this.backupAppList) this.sendUpdatedAppList(this.backupAppList);
  };

  terminate = () => {
    this.removeListener('close', this.justHide);
    this.close();
  };

  private justHide = (e: Electron.Event) => {
    this.hide();
    e.preventDefault();
  };

  private sendUpdatedAppList = (appListDataStr: string) => {
    if (!appListDataStr) return;
    this.webContents?.send('app-list-updated', appListDataStr);
    this.backupAppList = appListDataStr;
  };

  private openAppListContextMenu = (appPath: string, appId: string) => {
    Menu.buildFromTemplate([
      {
        label: 'Launch',
        click: () => {
          emtApp.emit('launch-app', { appPath });
        },
      },
      {
        label: 'Close',
        click: () => {
          emtApp.emit('close-app-by-path', appPath);
        },
      },
      {
        label: 'Remove',
        click: () => {
          emtApp.emit('remove-app-from-list', appId);
        },
      },
    ]).popup({ window: this });
  };
}

export default AppListWindow;
