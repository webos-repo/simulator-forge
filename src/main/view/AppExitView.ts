import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { constStore } from '@share/store/constStore';
import type { Orientation2Way } from '@share/structure/orientations';
import _ from 'lodash';
import OverlayView from '@view/OverlayView';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtSetting, emtWindow } from '../module/eventEmitters';

const Bounds: { [key in Orientation2Way]: Electron.Rectangle } = {
  landscape: { x: 280, y: 480, width: 700, height: 128 },
  portrait: { x: 48, y: 1024, width: 620, height: 128 },
};

class AppExitView extends OverlayView {
  name = 'AppExitView';
  isShowing = false;

  constructor() {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    this.webContents.loadURL(resolveHtmlPath('index.html', 'app_exit'));

    emtWindow.on('main-window-orientation-changed', this.changeOrientation);

    emtSetting.on('change-zoomFactor', this.handleChangeZoom);
  }

  show = () => {
    this.setBounds(this.calcBounds());
    this.setAutoResize({ width: true, height: true });
    this.isShowing = true;
    this.webContents.focus();
    // this.webContents.openDevTools({ mode: 'detach' });
  };

  hide = () => {
    this.isShowing = false;
    this.webContents.send('be-hidden');
  };

  changeOrientation = (orn: Orientation2Way) => {
    if (this.isShowing) {
      this.show();
    }
    this.webContents.send('window-orientation-changed', orn);
  };

  private handleChangeZoom = () => {
    this.webContents.zoomFactor = windowSetting.zoom;
    if (this.isShowing) this.show();
  };

  private getAppExitBounds = (key: Orientation2Way): Electron.Rectangle => {
    return {
      ...Bounds[key],
      y:
        (checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0) +
        Bounds[key].y,
    };
  };

  private calcBounds = () => {
    return _.mapValues(
      this.getAppExitBounds(windowSetting.orn2Way),
      (v) => v * windowSetting.zoom
    );
  };
}

export default AppExitView;
