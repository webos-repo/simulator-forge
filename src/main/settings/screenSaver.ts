import { runningApps } from '@controller/appController/appMemory';
import { ipcMain } from 'electron';
import { emtSetting } from '../module/eventEmitters';
import overlayController from '@controller/OverlayController';
import settingsDB from './settingsDB';

const DB_KEY = 'screen-saver' as const;

let isOn: boolean = settingsDB.getOrSet(`${DB_KEY}.isOn`, false);
let timeout: number = settingsDB.getOrSet(`${DB_KEY}.timeout-delay`, 120);
let timer: NodeJS.Timer | undefined;

emtSetting.on('prevent-screen-saver', resetScrSaver);
ipcMain.on('prevent-screen-saver-from-screen', resetScrSaver);

function isScrSaverOn() {
  return isOn;
}

function toggleScrSaverOnOff() {
  isOn = !isOn;
  settingsDB.set(`${DB_KEY}.isOn`, isOn);
  resetScrSaver();
}

function setScrSaverTimeout(newTimeout: number) {
  timeout = newTimeout;
  settingsDB.set(`${DB_KEY}.timeout-delay`, timeout);
  resetScrSaver();
}

function getScrSaverTimeout() {
  return timeout;
}

function resetScrSaverTimer() {
  clearScrSaverTimer();
  timer = setInterval(showScrSaver, timeout * 1000);
}

function clearScrSaverTimer() {
  if (!timer) return;
  clearTimeout(timer);
  timer = undefined;
}

function showScrSaver() {
  if (!isOn || !runningApps.fgApp) return;
  if (overlayController.checkShowingByName('screenSaver')) return;
  overlayController.showScreenSaver();
}

function hideScrSaver() {
  overlayController.hideScreenSaver();
}

function resetScrSaver() {
  hideScrSaver();
  resetScrSaverTimer();
}

export {
  isScrSaverOn,
  toggleScrSaverOnOff,
  setScrSaverTimeout,
  getScrSaverTimeout,
};
