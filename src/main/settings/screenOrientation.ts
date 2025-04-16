import { orientations } from "@/share/structure/orientations";
import type { Orientation } from "@/share/structure/orientations";
import { ipcMain } from "electron";
import { emtSetting } from "../module/eventEmitters";

let scrOrn: Orientation = "landscape";

export function toggleScrOrn() {
  setScrOrn(scrOrn === "landscape" ? "portrait" : "landscape");
}

export function getScrOrn() {
  return scrOrn;
}

export function setScrOrn(newScrOrn: Orientation) {
  if (!orientations.includes(newScrOrn) || scrOrn === newScrOrn) {
    return false;
  }
  scrOrn = newScrOrn;
  emitScrOrnChanged();
  return true;
}

function emitScrOrnChanged() {
  emtSetting.emit("screen-orientation-changed", scrOrn);
}

ipcMain.on("rcu-portrait-clicked", toggleScrOrn);
