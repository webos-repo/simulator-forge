import { Pos } from '@share/structure/positions';
import { BrowserWindow } from 'electron';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtSetting } from '../module/eventEmitters';

class RcuWindow extends BrowserWindow {
  constructor(mainWndBound: Readonly<Electron.Rectangle>) {
    super({
      x: mainWndBound.x + mainWndBound.width,
      y: mainWndBound.y,
      width: windowSetting.rcuSize.width,
      height: windowSetting.rcuSize.height,
      useContentSize: true,
      title: 'RCU',
      show: false,
      resizable: false,
      frame: false,
      acceptFirstMouse: true,
      focusable: false,
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.loadURL(resolveHtmlPath('index.html', 'rcu'));
    this.setMenuBarVisibility(false);
    this.setEventHandler();
  }

  private setEventHandler = () => {
    this.once('ready-to-show', this.handleReadyToShow);
    emtSetting.on('touch-mode-changed', this.sendTouchModeState);
  };

  private handleReadyToShow = () => {
    if (process.env.START_MINIMIZED) {
      this.minimize();
    } else {
      setTimeout(() => {
        this.fixContentBounds(this.getContentBounds());
        this.show();
        // this.webContents.openDevTools({ mode: 'detach' });
      }, 500);
    }
  };

  private sendTouchModeState = (isTouchMode: boolean) => {
    this.webContents.send('touch-mode-changed', isTouchMode);
  };

  fixContentBounds = ({ x, y }: Pos) => {
    this.setContentBounds({
      x,
      y,
      ...windowSetting.rcuSize,
    });
  };
}

export default RcuWindow;
