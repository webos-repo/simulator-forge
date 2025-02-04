import { ipcRenderer } from "electron";

export function getTestApi() {
  return {
    api1: () => {
      console.log("expose", document);
    },
  };
}

export function setIpcListener() {
  ipcRenderer
    .on("preload-test1", () => {})
    .on("preload-test2", () => {})
    .on("preload-test3", () => {});
}
