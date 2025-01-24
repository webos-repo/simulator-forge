import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { ipcHandler } from '@share/lib/utils';

class CustomEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
  onWithIpcMain = (channel: string, listener: (...args: any[]) => void) => {
    this.on(channel, listener);
    ipcMain.on(channel, ipcHandler(listener));
    return this;
  };

  wrapEmit = (channel: string, ...args: any[]) => {
    return () => this.emit(channel, ...args);
  };
}

const emtWindow = new CustomEventEmitter();
const emtView = new CustomEventEmitter();
const emtApp = new CustomEventEmitter();
const emtService = new CustomEventEmitter();
const emtSetting = new CustomEventEmitter();
const emtDev = new CustomEventEmitter();
ipcMain.setMaxListeners(200);

export { emtWindow, emtView, emtApp, emtService, emtSetting, emtDev };
