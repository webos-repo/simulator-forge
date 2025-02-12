import { BrowserWindow } from "electron";
import windowSetting from "@/main/settings/windowSetting";
import { getPreloadPath } from "../lib/pathResolver";
import { loadWindow } from "@/main/lib/windowHelper";

class TvSettingWindow extends BrowserWindow {
  constructor() {
    super({
      x: windowSetting.pos.x + 100,
      y: windowSetting.pos.y + 100,
      width: 800,
      height: 600,
      useContentSize: true,
      title: "TV Settings",
      modal: true,
      show: false,
      resizable: false,
      frame: false,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: getPreloadPath(),
      },
    });
    loadWindow(this, "tvSetting");
    this.setEventHandler();
    this.setMenuBarVisibility(false);
  }

  setEventHandler = () => {
    // file deepcode ignore AttrAccessOnNull: <please specify a reason of ignoring this>
    this.on("close", this.justHide);
  };

  terminate = () => {
    this.removeListener("close", this.justHide);
    this.close();
  };

  justHide = (e: Electron.Event) => {
    this.hide();
    e.preventDefault();
  };
}

export default TvSettingWindow;
