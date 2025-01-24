import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { DefaultRect } from '@share/constant/defaults';
import { constStore } from '@share/store/constStore';
import { emtApp, emtSetting } from '../module/eventEmitters';
import { resolveHtmlPath } from '../lib/pathResolver';
import windowSetting from '@settings/windowSetting';
import OverlayView from './OverlayView';

export default class ScreenSaverView extends OverlayView {
  name = 'ScreenSaverView';
  isShowing = false;
  videoRect: Electron.Rectangle = DefaultRect;

  constructor() {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    this.webContents.loadURL(resolveHtmlPath('index.html', 'screen_saver'));
    this.setEventHandler();
  }

  private setEventHandler = () => {
    emtSetting.on('change-zoomFactor', this.handleChangeZoom);

    emtApp
      .on('video-rect', this.setVideoRect)
      .on('video-paused-fg-app', this.resetVideoRect);
  };

  show = () => {
    this.isShowing = true;
    this.resetSize();
    this.sendVideoRect();
    this.webContents.send('is-shown');
  };

  hide = () => {
    this.isShowing = false;
    this.webContents.send('is-hidden');
  };

  private handleChangeZoom = () => {
    this.webContents.zoomFactor = windowSetting.zoom;
    if (this.isShowing) this.show();
  };

  private resetSize = (
    width = windowSetting.size.width,
    height = windowSetting.size.height
  ) => {
    this.setAutoResize({ width: true, height: true });
    this.setBounds({
      x: 0,
      y: checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0,
      width: width - 1,
      height,
    });
  };

  private setVideoRect = (newVideoRect: Electron.Rectangle) => {
    this.videoRect = newVideoRect;
    this.sendVideoRect();
  };

  private resetVideoRect = () => {
    this.videoRect = DefaultRect;
    this.sendVideoRect();
  };

  private sendVideoRect = () => {
    this.webContents.send('video-rect', this.videoRect);
  };
}
