import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { constStore } from '@share/store/constStore';
import _ from 'lodash';
import OverlayView from '@view/OverlayView';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtSetting } from '../module/eventEmitters';

const TouchRemoteSize = {
  width: 236,
  height: 172,
};

class TouchRemoteView extends OverlayView {
  name = 'TouchRemoteView';
  isShowing = false;
  private backupPos?: { x?: number; y?: number };

  constructor() {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    this.webContents.loadURL(resolveHtmlPath('index.html', 'touch_remote'));
    this.setEventHandler();
  }

  private setEventHandler = () => {
    emtSetting.on('change-zoomFactor', this.handleChangeZoom);
  };

  show = ({ x, y }: { x?: number; y?: number }) => {
    this.backupPos = { x, y };
    const { width: baseWidth, height: baseHeight } = windowSetting.baseSize;
    const [minX, maxX] = [50, baseWidth - 280];
    const [minY, maxY] = [30, baseHeight - 200];
    const zoom = windowSetting.zoom;

    const positionX = Math.round(
      (_.isUndefined(x) || x > baseWidth / 2 ? maxX : minX) * zoom
    );
    const positionY = Math.round(
      (_.isUndefined(y) || y > baseHeight / 2 ? maxY : minY) * zoom
    );
    const width = Math.round(TouchRemoteSize.width * zoom);
    const height = Math.round(TouchRemoteSize.height * zoom);

    this.setBounds({
      x: positionX,
      y:
        (checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0) +
        positionY,
      width,
      height,
    });
    this.setAutoResize({ width: true, height: true });
    this.isShowing = true;
    this.webContents.focus();
    // this.webContents.openDevTools({ mode: 'detach' });
  };

  hide = () => {
    this.isShowing = false;
  };

  private handleChangeZoom = () => {
    this.webContents.zoomFactor = windowSetting.zoom;
    if (this.isShowing && this.backupPos) this.show(this.backupPos);
  };
}

export default TouchRemoteView;
