export const ipcHandler = (callback: any) => {
  return (_event: Electron.Event, ...data: any[]) => callback(...data);
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
