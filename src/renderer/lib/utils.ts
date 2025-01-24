import { ipcRenderer } from 'electron';

export const ipcSender = (channel: string) => {
  return (...data: any[]) => ipcRenderer.send(channel);
};
