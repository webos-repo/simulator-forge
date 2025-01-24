import { BrowserWindow } from 'electron';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';

class TvSettingWindow extends BrowserWindow {
  constructor() {
    super({
      x: windowSetting.pos.x + 100,
      y: windowSetting.pos.y + 100,
      width: 800, // TODO: set a proper width
      height: 600, // TODO: set a proper height
      useContentSize: true,
      title: 'TV Settings',
      modal: true,
      show: false,
      resizable: false,
      frame: false,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.initialize(resolveHtmlPath('index.html', 'tv_setting'));
    this.setEventHandler();
    this.setMenuBarVisibility(false);
  }

  initialize = (url: string) => {
    this.loadURL(url);
  };

  setEventHandler = () => {
    // file deepcode ignore AttrAccessOnNull: <please specify a reason of ignoring this>
    this.on('close', this.justHide);
  };

  terminate = () => {
    this.removeListener('close', this.justHide);
    this.close();
  };

  justHide = (e: Electron.Event) => {
    this.hide();
    e.preventDefault();
  };
}

export default TvSettingWindow;
