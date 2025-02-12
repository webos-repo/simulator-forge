export const ipcSender = (channel: string) => {
  return () => window.ipcRenderer.send(channel);
};
