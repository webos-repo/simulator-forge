import { BrowserWindow, ipcMain, Menu } from 'electron';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtService, emtWindow } from '../module/eventEmitters';
import { ipcHandler } from '@share/lib/utils';

class JSServiceWindow extends BrowserWindow {
  constructor() {
    super({
      width: 240,
      height: 375,
      minWidth: 220,
      minHeight: 100,
      useContentSize: true,
      title: 'JS Service',
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
    this.setEventHandler();
    this.loadURL(resolveHtmlPath('index.html', 'js_service'));
    this.setMenuBarVisibility(false);
  }

  private setEventHandler() {
    this.on('close', this.justHide)
      .on('show', () => {
        emtWindow.emit('js-service-window-show');
        // this.webContents.openDevTools({ mode: 'detach' });
      })
      .on('hide', emtWindow.wrapEmit('js-service-window-hide'))
      .on('resize', () => {
        this.webContents.send('resized');
      });

    ipcMain.on(
      'js-service-right-click',
      ipcHandler(this.openJSServiceContextMenu)
    );
  }

  terminate = () => {
    this.removeListener('close', this.justHide);
    this.close();
  };

  private justHide = (e: Electron.Event) => {
    this.hide();
    e.preventDefault();
  };

  private openJSServiceContextMenu = (jsServiceId: string) => {
    Menu.buildFromTemplate([
      {
        label: 'Remove',
        click: () => {
          emtService.emit('remove-js-service-from-list', jsServiceId);
        },
      },
    ]).popup({ window: this });
  };
}

export default JSServiceWindow;
