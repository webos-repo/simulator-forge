import { ipcRenderer } from "electron";

export const ipcSender = (channel: string) => {
  return () => ipcRenderer.send(channel);
};
