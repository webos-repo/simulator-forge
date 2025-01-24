import { emtSetting } from '../module/eventEmitters';
import settingsDB from '@settings/settingsDB';

const DB_KEY = 'auto-reload';

let isAutoReload = settingsDB.getOrSet(DB_KEY, true);

export function toggleAutoReload() {
  isAutoReload = !isAutoReload;
  settingsDB.set(DB_KEY, isAutoReload);
  emtSetting.emit('auto-reload-toggled', isAutoReload);
}

export function IsAutoReloadOn() {
  return isAutoReload;
}
