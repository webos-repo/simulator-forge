import { contextBridge, ipcRenderer, shell } from "electron";

declare global {
  interface Window {
    ipcRenderer: {
      send: typeof ipcRenderer.send;
      on: typeof ipcRenderer.on;
    };
    shell: {
      openExternal: typeof shell.openExternal;
    };
  }
}

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: ipcRenderer.send,
  on: ipcRenderer.on,
});
contextBridge.exposeInMainWorld("shell", {
  openExternal: shell.openExternal,
});
