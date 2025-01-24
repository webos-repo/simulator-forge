import type {
  GeneralToastProps,
  ToastParams,
} from '@renderer/lib/toastManager';
import { ReleaseNotesURL } from '@share/constant/urls';
import Store from 'electron-store';
import semver from 'semver';
import { pushMemories } from '../lib/memories';
import { emtSetting } from '../module/eventEmitters';
import { webOSTVVersion, version as simulVer } from 'package.json';
import SimulatorDB from '../module/SimulatorDB';

type DBBaseKey =
  | 'internal'
  | 'db8'
  | 'settings'
  | 'tvSettings'
  | 'simulatorInfo'
  | 'analytics';

const dbName =
  process.env.NODE_ENV === 'development'
    ? `webos-tv-simulator-dev`
    : `webos-tv-simulator-${webOSTVVersion}`;
const db = new Store({ name: dbName });
const defaultResetBaseKeys: DBBaseKey[] = ['internal', 'db8', 'settings'];

function dbInit() {
  resetDBWhenLaunch([]);
  setListener();
}

function setListener() {
  emtSetting.on(
    'reset-database',
    (keys: DBBaseKey[] = defaultResetBaseKeys) => {
      keys.forEach((key) => db?.delete(key));
      emtSetting.emit('database-is-reset', keys);
    }
  );
}

function resetDBWhenLaunch(NeedResetDBs: string[]) {
  if (!NeedResetDBs.length) return;
  const simulVerInDB = db.get('simulatorInfo.simulatorVersion');
  if (!simulVerInDB || semver.gt(simulVer, simulVerInDB as string)) {
    NeedResetDBs.forEach((baseKey) => {
      if (!db.has(baseKey)) return;
      db.delete(baseKey);
      if (baseKey === 'external' || baseKey === 'db8') {
        pushMemories('toast', {
          category: 'general',
          props: {
            title: 'DB8 is reset',
            content: 'Click to see release notes for more details.',
            linkUrl: ReleaseNotesURL,
          } as GeneralToastProps,
        } as ToastParams);
      }
    });
  }
}

function makeDB(dbBaseKey: DBBaseKey) {
  return new SimulatorDB(db, dbBaseKey);
}

export type { DBBaseKey };
export { dbInit, makeDB };
