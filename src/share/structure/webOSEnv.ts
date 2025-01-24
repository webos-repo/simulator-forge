import type { WebOSSystemConf } from '@main/lib/WebOSSystemConfigs';
import type { AppInfo } from './appInfo';
import type { Orientation } from './orientations';

type WebOSEnv = {
  appInfo: Required<Pick<AppInfo, 'id' | 'resolution' | 'appPath'>>;
  webOSSystemConf: WebOSSystemConf;
  settingsConf: SettingsConf;
  launchEnv: LaunchEnv;
  isTouchMode: boolean;
  simulatorInfo: SimulatorInfo;
};

type SettingsConf = {
  locale: string;
  localeRegion: string;
  screenOrientation: Orientation;
  currentOrientation: Orientation;
  tvSystemInfo: {
    countryGroup: string;
    tvSystemName: string;
  };
  highContrast: string;
  voiceControl: string;
};

type LaunchEnv = {
  launchParams: string;
  launchReason: string;
  activityId: string;
};

type SimulatorInfo = {
  webOSVersion: string;
};

export type { WebOSEnv };
