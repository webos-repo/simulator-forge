import settingsDB from './settingsDB';

const DBKey = 'auto-inspector' as const;
let autoLaunch = settingsDB.getOrSet(DBKey, false);

export function toggleAutoInspector() {
  autoLaunch = !autoLaunch;
  settingsDB.set(DBKey, autoLaunch);
}

export function isAutoInspectorOn() {
  return autoLaunch;
}
