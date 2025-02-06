import { contextBridge, ipcRenderer, shell } from "electron";

declare global {
  interface Window {
    ipcRenderer: {
      send: typeof ipcRenderer.send;
      on: (evt: string, cb: any) => void;
    };
    shell: {
      openExternal: typeof shell.openExternal;
    };
  }
}

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: ipcRenderer.send,
  on: (evt: string, cb: any) => {
    ipcRenderer.on(evt, cb);
  },
});
contextBridge.exposeInMainWorld("shell", {
  openExternal: shell.openExternal,
});
