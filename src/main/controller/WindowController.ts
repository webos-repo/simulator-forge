import { constStore } from "@share/store/constStore";
import type { ToastParams } from "@renderer/lib/toastManager";
import type { Orientation } from "@share/structure/orientations";
import _ from "lodash";
import { getMemories, pushMemories, resetMemories } from "../lib/memories";
import { dialog, ipcMain } from "electron";
import {
  emtApp,
  emtSetting,
  emtView,
  emtWindow,
} from "../module/eventEmitters";
import type { BrowserView, BrowserWindow } from "electron";
import RcuWindow from "@window/RcuWindow";
import AppListWindow from "@window/AppListWindow";
import JSServiceWindow from "@window/JSServiceWindow";
import TvSettingWindow from "@window/TvSettingWindow";
import MainWindow from "@window/MainWindow";

type Windows =
  | MainWindow
  | RcuWindow
  | AppListWindow
  | JSServiceWindow
  | TvSettingWindow;

type WindowNames = "main" | "rcu" | "appList" | "jsService" | "tvSetting";

class WindowController {
  private allWindows!: { [key in WindowNames]: Windows };
  private mainWindow!: MainWindow;
  private rcuWindow!: RcuWindow;
  private appListWindow!: AppListWindow;
  private jsServiceWindow!: JSServiceWindow;
  private tvSettingWindow!: TvSettingWindow;

  initialize = async () => {
    this.mainWindow = new MainWindow();
    while (!this.mainWindow) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    constStore.setMainWindowYDiff(
      this.mainWindow.getContentBounds().y - this.mainWindow.getBounds().y,
    );

    this.rcuWindow = new RcuWindow(this.mainWindow.getContentBounds());
    this.rcuWindow.setParentWindow(this.mainWindow);

    this.appListWindow = new AppListWindow();
    this.jsServiceWindow = new JSServiceWindow();
    this.tvSettingWindow = new TvSettingWindow();
    this.allWindows = {
      main: this.mainWindow,
      rcu: this.rcuWindow,
      appList: this.appListWindow,
      jsService: this.jsServiceWindow,
      tvSetting: this.tvSettingWindow,
    };

    this.setEventHandler();
    if (process.platform === "linux") this.focusControlLinux();
  };

  isMainWindowExist = () => {
    return !!this.mainWindow;
  };

  private focusControlLinux = () => {
    _.values(this.allWindows).forEach((window) => {
      window
        .on("blur", () => {
          if (this.checkAllWindowBlur()) {
            this.rcuWindow?.hide();
          }
        })
        .on("focus", () => {
          this.rcuWindow?.show();
        });
    });
  };

  setEventHandler = () => {
    this.mainWindow
      .on("move", this.rcuFollowToMain)
      .on("resize", this.rcuFollowToMain)
      .on("restore", this.rcuFollowToMain)
      .on("close", this.clearAllWindow)
      .on("focus", emtWindow.wrapEmit("main-window-focused"));

    ipcMain
      .on("main-screen-loaded", this.showToastStack)
      .on("main-window-mouseenter", this.handleMouseEnter)
      .on("tv-setting", this.showTVSettings)
      .on("setting-cancel", this.hideTVSettings)
      .on("setting-save", this.hideTVSettings);

    emtWindow
      .on("add-view", this.addView)
      .on("set-view", this.setView)
      .on("remove-view", this.removeView)
      .on("toggle-mute", this.setMuted)
      .on("alert-message", this.alertMessage)
      .on("send", this.sendToWebContents)
      .on("set-callback-listener", this.setCallbackListener)
      .on("change-window-orientation", this.changeOrientation)
      .on("js-service-window-open", this.showJSServiceList)
      .on("show-toast", this.showToast)
      .on("show-noti-close-rotate", () =>
        this.mainWindow.webContents.send("show-noti-close-rotate"),
      )
      .on("set-spinner", this.mainWindow.setSpinner)
      .on("clear-main-screen", () =>
        this.mainWindow.webContents.send("clear-main-screen"),
      );

    emtSetting.on("screen-orientation-changed", this.handleScrOrnChanged);
  };

  private sendMessageToAll = (channel: string, ...data: any[]) => {
    _.values(this.allWindows).forEach((window) => {
      window.webContents.send(channel, ...data);
    });
  };

  getWindowByName = (name: string) => {
    if (!(name in this.allWindows)) return null;
    return this.allWindows[name as WindowNames];
  };

  private sendToWebContents = ({
    windowName,
    channel,
    data,
  }: {
    windowName: string;
    channel: string;
    data?: any;
  }) => {
    this.getWindowByName(windowName)?.webContents.send(channel, data);
  };

  private addView = (view: BrowserView, isOverlay = false) => {
    this.mainWindow.addBrowserView(view);
    emtView.emit("view-added", view, isOverlay);
  };

  private setView = (view: BrowserView, isOverlay = false) => {
    this.mainWindow.setBrowserView(view);
    emtView.emit("view-added", view, isOverlay);
  };

  private removeView = (view: BrowserView, isOverlay = false) => {
    this.mainWindow.removeBrowserView(view);
    emtView.emit("view-removed", isOverlay);
    if (this.mainWindow.getBrowserViews().length === 0) {
      this.mainWindow.setOrientation("landscape");
    }
  };

  setCallbackListener = (
    windowName: string,
    event: string,
    callback: () => void,
  ) => {
    this.getWindowByName(windowName)?.once(event as any, callback);
  };

  private clearAllWindow = () => {
    this.rcuWindow?.close();
    this.appListWindow?.terminate();
    this.jsServiceWindow?.terminate();
    this.tvSettingWindow?.terminate();
  };

  checkAllWindowBlur = (): boolean => {
    return _.values(this.allWindows).every((window) => !window.isFocused());
  };

  setMuted = (muted: boolean) => {
    emtApp.emit("fg-app-audio-mute-toggle", muted);
  };

  alertMessage = async (options: Electron.MessageBoxOptions) => {
    await dialog.showMessageBox(this.mainWindow as BrowserWindow, options);
  };

  isVisibleAppList = () => {
    return !!this.appListWindow?.isVisible();
  };

  showAppList = () => {
    if (
      !this.appListWindow ||
      this.appListWindow.isDestroyed() ||
      this.appListWindow.isVisible()
    ) {
      return;
    }
    if (this.rcuWindow && this.jsServiceWindow) {
      const { x: rcuX, y: rcuY, width: rcuW } = this.rcuWindow.getBounds();
      const { height: jsH } = this.jsServiceWindow?.getBounds();
      this.appListWindow.setPosition(rcuX + rcuW, rcuY + jsH);
    }
    this.appListWindow.show();
    this.appListWindow.moveTop();
    this.appListWindow.focus();
  };

  hideAppList = () => {
    if (
      !this.appListWindow ||
      this.appListWindow.isDestroyed() ||
      !this.appListWindow.isVisible()
    ) {
      return;
    }
    this.appListWindow.hide();
  };

  isVisibleJSServiceList = () => {
    return !!this.jsServiceWindow?.isVisible();
  };

  showJSServiceList = () => {
    if (
      !this.jsServiceWindow ||
      this.jsServiceWindow.isDestroyed() ||
      this.jsServiceWindow.isVisible()
    ) {
      return;
    }
    if (this.rcuWindow) {
      const { x: rcuX, y: rcuY, width: rcuW } = this.rcuWindow.getBounds();
      this.jsServiceWindow.setPosition(rcuX + rcuW, rcuY);
    }
    this.jsServiceWindow.show();
    this.jsServiceWindow.moveTop();
    this.jsServiceWindow.focus();
  };

  hideJSServiceList = () => {
    if (
      !this.jsServiceWindow ||
      this.jsServiceWindow.isDestroyed() ||
      !this.jsServiceWindow.isVisible()
    ) {
      return;
    }
    this.jsServiceWindow.hide();
  };

  showTVSettings = () => {
    this.tvSettingWindow?.show();
  };

  hideTVSettings = () => {
    this.tvSettingWindow?.hide();
  };

  private rcuFollowToMain = () => {
    const { x, y, width } = this.mainWindow.getContentBounds();
    this.rcuWindow?.fixContentBounds({
      x: x + width,
      y,
    });
  };

  isSimulatorFocused = () => {
    return (
      this.mainWindow?.isFocused() ||
      this.rcuWindow?.isFocused() ||
      this.appListWindow?.isFocused() ||
      this.jsServiceWindow?.isFocused() ||
      this.tvSettingWindow?.isFocused()
    );
  };

  private handleMouseEnter = () => {
    if (this.isSimulatorFocused() && !this.mainWindow?.isDialogOpened) {
      this.mainWindow?.focus();
    }
  };

  private handleScrOrnChanged = (screenOrientation: Orientation) => {
    this.sendMessageToAll("screen-orientation-changed", screenOrientation);
  };

  private changeOrientation = (orientation: Orientation) => {
    this.mainWindow.setOrientation(orientation);
  };

  private sendShowToast = (params: ToastParams) => {
    this.mainWindow.webContents.send("show-toast", params);
  };

  private showToast = (params: ToastParams) => {
    if (!this.mainWindow.isRendererLoaded) {
      pushMemories("toast", params);
      return;
    }
    this.sendShowToast(params);
  };

  private showToastStack = () => {
    setTimeout(() => {
      getMemories("toast")?.forEach((params) => {
        this.sendShowToast(params);
      });
      resetMemories("toast");
    }, 1000);
  };
}

const windowController = new WindowController();
export default windowController;
