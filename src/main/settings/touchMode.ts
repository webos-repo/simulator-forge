import { emtSetting } from '../module/eventEmitters';
import { ipcMain } from 'electron';

let isTouchMode = false;

ipcMain.on('rcu-touch-mode-clicked', toggleTouchMode);

export function toggleTouchMode() {
  isTouchMode = !isTouchMode;
  emtSetting.emit('touch-mode-changed', isTouchMode);
}

export function getTouchMode() {
  return isTouchMode;
}
