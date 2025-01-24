import { makeDB } from '@controller/dbController';
import type {
  ToastParams,
  VersionToastProps,
} from '@renderer/lib/toastManager';
import { SDKAPIWorkerURL } from '@share/constant/urls';
import { ipcHandler } from '@share/lib/utils';
import axios from 'axios';
import { ipcMain } from 'electron';
import semver from 'semver';
import { version } from 'package.json';
import { pushMemories } from './memories';

const simulInfoDB = makeDB('simulatorInfo');

ipcMain.on(
  'clicked-skip-this-version',
  ipcHandler((skipVersion: string) => {
    simulInfoDB.set('updateSkipVersion', skipVersion);
  })
);

export const checkVersion = async () => {
  try {
    const res = await axios.get(
      `${SDKAPIWorkerURL}/?target=simulator&key=latestVersion`
    );
    const latestVersion = res.data;
    const updateSkipVersion = simulInfoDB.get('updateSkipVersion');

    if (!semver.valid(latestVersion)) {
      throw new Error('Server version is not valid');
    }

    if (
      semver.gt(latestVersion, version) &&
      (!updateSkipVersion || semver.gt(latestVersion, updateSkipVersion))
    ) {
      pushMemories('toast', {
        category: 'version',
        props: {
          currentVersion: version,
          latestVersion,
        } as VersionToastProps,
      } as ToastParams);
    }
  } catch {
    // pass
  }
};
