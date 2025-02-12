import { checkMacViewPositionBug } from "@/main/lib/bugVersionChecker";
import { constStore } from "@/share/store/constStore";
import OverlayView from "@/main/view/overlayView";
import windowSetting from "@/main/settings/windowSetting";
import { getPreloadPath } from "../lib/pathResolver";
import { emtSetting } from "../module/eventEmitters";
import { loadView } from "@/main/lib/windowHelper";
import { isUndefined } from "es-toolkit/compat";

const TouchRemoteSize = {
  width: 236,
  height: 172,
};

export default class TouchRemoteView extends OverlayView {
  name = "TouchRemoteView";
  isShowing = false;
  private backupPos?: { x?: number; y?: number };

  constructor() {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        nodeIntegration: true,
        contextIsolation: true,
        preload: getPreloadPath(),
      },
    });
    loadView(this, "touchRemote");
    this.setEventHandler();
  }

  private setEventHandler = () => {
    emtSetting.on("change-zoomFactor", this.handleChangeZoom);
  };

  show = ({ x, y }: { x?: number; y?: number }) => {
    this.backupPos = { x, y };
    const { width: baseWidth, height: baseHeight } = windowSetting.baseSize;
    const [minX, maxX] = [50, baseWidth - 280];
    const [minY, maxY] = [30, baseHeight - 200];
    const zoom = windowSetting.zoom;

    const positionX = Math.round(
      (isUndefined(x) || x > baseWidth / 2 ? maxX : minX) * zoom,
    );
    const positionY = Math.round(
      (isUndefined(y) || y > baseHeight / 2 ? maxY : minY) * zoom,
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
