import { ipcMain } from "electron";
import { emtSetting } from "../module/eventEmitters";

let isTouchMode = false;

ipcMain.on("rcu-touch-mode-clicked", toggleTouchMode);

export function toggleTouchMode() {
  isTouchMode = !isTouchMode;
  emtSetting.emit("touch-mode-changed", isTouchMode);
}

export function getTouchMode() {
  return isTouchMode;
}
