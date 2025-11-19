import { includes, toInteger } from "lodash-es";
import { checkMacViewPositionBug } from "@/main/lib/bugVersionChecker";
import { VKBPriorityKeys } from "@/main/lib/keyManager";
import { getPreloadPath } from "@/main/lib/pathResolver";
import { loadView } from "@/main/lib/windowHelper";
import { emtDev, emtSetting, emtWindow } from "@/main/module/eventEmitters";
import windowSetting from "@/main/settings/windowSetting";
import OverlayView from "@/main/view/overlayView";
import { constStore } from "@/share/store/constStore";
import { RCUButtonEventType } from "@/share/structure/events";
import { Orientation2Way } from "@/share/structure/orientations";

const VKB_HEIGHT_RATIO = {
  landscape: {
    default: 0.38,
    number: 0.1,
  },
  portrait: {
    default: 0.17,
    number: 0.05,
  },
} as const;

class VkbView extends OverlayView {
  name = "VkbView";
  isShowing = false;
  orn: Orientation2Way = "landscape";
  vkbType: string;

  constructor(vkbType: "default" | "number") {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        nodeIntegration: true,
        contextIsolation: true,
        preload: getPreloadPath(),
      },
    });
    this.vkbType = vkbType;
    loadView(this, `vkb/${vkbType}`);
    this.setEventHandler();
  }

  setEventHandler = () => {
    this.webContents.on("did-finish-load", () => {
      this.webContents.send("reloaded", this.orn);
    });

    emtWindow.on("main-window-orientation-changed", this.changeOrientation);

    emtSetting.on("change-zoomFactor", this.changeZoomFactor);

    emtDev.on(`open-devtools-vkb-${this.vkbType}`, () =>
      this.webContents.openDevTools({ mode: "detach" }),
    );
  };

  show = () => {
    const { width, height } = windowSetting.size;
    const vkbHeight = this.getVkbHeight(height, this.vkbType, this.orn);
    this.setBounds({
      x: 0,
      y:
        (checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0) +
        height -
        vkbHeight,
      width,
      height: vkbHeight,
    });
    this.setAutoResize({ width: true, height: true });
    this.isShowing = true;
    // this.webContents.openDevTools({ mode: 'detach' });
  };

  hide = () => {
    this.isShowing = false;
    this.webContents.send("be-hidden");
    this.webContents.closeDevTools();
  };

  changeOrientation = (orn: Orientation2Way) => {
    this.orn = orn;
    if (this.isShowing) this.show();
    this.webContents.send("window-orientation-changed", orn);
  };

  handleRCUInput = (keyCode: string, eventType: RCUButtonEventType) => {
    if (eventType === "down" || !includes(VKBPriorityKeys, keyCode)) return;
    this.webContents.send("rcu-pressed", keyCode);
  };

  changeZoomFactor = () => {
    this.webContents.zoomFactor = windowSetting.zoom;
    if (this.isShowing) this.show();
  };

  private getVkbHeight = (
    baseHeight: number,
    inputType: string,
    orn: Orientation2Way,
  ) => {
    const inputTypeFiltered =
      inputType === "number" || inputType === "tel" ? "number" : "default";
    const heightRatio = VKB_HEIGHT_RATIO[orn][inputTypeFiltered];
    return toInteger(baseHeight * heightRatio);
  };
}

export default VkbView;
