import { getScrOrn } from '@settings/screenOrientation';
import { getTouchMode } from '@settings/touchMode';
import { AppInfoRequirements } from '@share/structure/appInfo';
import type { AppInfo } from '@share/structure/appInfo';
import type { Orientation } from '@share/structure/orientations';
import type { WebOSEnv } from '@share/structure/webOSEnv';
import { tvInfo, tvLocation } from '@tvSettings/index';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import LogMessage from '../../lib/logMessage';
import { readAppInfo } from '../../lib/metaFileReader';
import { getWebOSVersion } from '../../lib/simulInfo';
import webOSSystemConfigs from '../../lib/WebOSSystemConfigs';
import { emtSetting, emtWindow } from '../../module/eventEmitters';
import { makeDB } from '../dbController';
import { appInfos, runningApps } from './appMemory';

const dbAppEntriesKey = 'appEntries';
const db = makeDB('internal');

const callIfFgAppById = _.curry(
  (func: any, appId: string, ...params: any[]) => {
    if (runningApps.fgApp?.appId !== appId) return;
    func(params);
  }
);

const callIfFgAppExist = _.curry((func: any, ...params: any[]) => {
  if (!runningApps.fgApp) return;
  func(...params);
});

function loadAppInfoFromDB() {
  const appPaths = db.get(dbAppEntriesKey) as string[] | undefined;
  if (!appPaths) return;
  const newAppInfos: AppInfo[] = [];
  appPaths.forEach((appPath) => {
    try {
      const appInfo = readAppInfo(appPath);
      checkAppInfoRequirements(appInfo);
      newAppInfos.push(appInfo);
    } catch (_e) {
      // pass
    }
  });
  appInfos.replace(newAppInfos, true);
}

function checkAppInfoRequirements(appInfo: AppInfo) {
  const notInclude = AppInfoRequirements.filter(
    (field) => !_.has(appInfo, field)
  );
  if (notInclude.length) {
    const s = notInclude.length >= 2 ? 's' : '';
    throw new LogMessage(
      'error',
      `Missing field${s} in appinfo.json`,
      `[${notInclude.join(', ')}] field${s} is required`
    );
  }
  const notExists = getNotExistFilesInAppInfo(appInfo);
  if (notExists.length) {
    const s = notExists.length >= 2 ? 's' : '';
    throw new LogMessage(
      'error',
      'Cannot found files',
      `[${notExists.join(', ')}] file${s} is not found`
    );
  }
}

function getNotExistFilesInAppInfo(appInfo: AppInfo) {
  const pickedFields = _.pick(appInfo, ['main', 'icon', 'largeIcon']);
  return _.values(pickedFields)
    .map((fileName) => path.resolve(appInfo.appPath, fileName))
    .reduce((notExists: string[], name) => {
      if (name && !fs.existsSync(path.resolve(appInfo.appPath, name))) {
        notExists.push(name);
      }
      return notExists;
    }, []);
}

function checkCloseOnRotation({ closeOnRotation }: AppInfo) {
  return closeOnRotation && getScrOrn() !== 'landscape';
}

function checkIsAlreadyRunning({ id }: AppInfo) {
  return !!runningApps.findById(id);
}

function reqNotiCloseRotate() {
  emtWindow.emit('show-noti-close-rotate');
}

function reqChangeWindowOrn(orientation: Orientation) {
  emtWindow.emit('change-window-orientation', orientation);
}

function reqPreventScreenSaver() {
  emtSetting.emit('prevent-screen-saver');
}

function makeWebosEnv(appInfo: AppInfo, launchParams?: string): WebOSEnv {
  return {
    appInfo: {
      id: appInfo.id,
      resolution: appInfo.resolution || '1920x1080',
      appPath: appInfo.appPath,
    },
    webOSSystemConf: webOSSystemConfigs.getInjectionString(),
    settingsConf: {
      locale: tvLocation.locale,
      localeRegion: tvLocation.localeRegion,
      screenOrientation: getScrOrn(),
      currentOrientation: 'landscape',
      tvSystemInfo: tvInfo.tvSystemInfo,
      highContrast: tvInfo.highContrast,
      voiceControl: tvInfo.voiceControl,
    },
    launchEnv: {
      launchParams: launchParams || '',
      launchReason: 'launcher',
      activityId: '0',
    },
    isTouchMode: getTouchMode(),
    simulatorInfo: {
      webOSVersion: getWebOSVersion(),
    },
  };
}

export {
  callIfFgAppById,
  callIfFgAppExist,
  loadAppInfoFromDB,
  checkAppInfoRequirements,
  checkCloseOnRotation,
  checkIsAlreadyRunning,
  reqNotiCloseRotate,
  reqChangeWindowOrn,
  reqPreventScreenSaver,
  makeWebosEnv,
};
