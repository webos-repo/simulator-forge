// mandatory fields of appinfo.json
type Mandatory = {
  id: string;
  title: string;
  type: string;
  main: string;
  icon: string;
  version: string;
};

// optional fields of appinfo.json
type OptionalInfo = {
  largeIcon?: string;
  vendor?: string;
  bgColor?: string;
  iconColor?: string;
  appDescription?: string;
  disableBackHistoryAPI?: boolean;
  resolution?: '1920x1080' | '1280x720';
  supportTouchMode?: 'full' | 'virtual' | 'none';
  virtualTouch?: {
    verticalThreshold?: number;
    horizontalThreshold?: number;
    positionEventOnPress?: boolean;
    shortTouchThreshold?: number;
  };
  supportPortraitMode?: boolean;
  splashFitModeOnPortrait?: boolean;
  closeOnRotation?: boolean;
  splashColor?: string;
};

type AppInfoJson = Mandatory & OptionalInfo;
type AppInfo = AppInfoJson & {
  appPath: string;
};
type AppInfoWithState = AppInfo & {
  appState: 'foreground' | 'background' | 'notLaunched';
};
type AppInfoJsonMandatory = Mandatory;

const AppInfoRequirements: (keyof AppInfoJsonMandatory)[] = [
  'id',
  'title',
  'type',
  'main',
  'icon',
  'version',
];

export type { AppInfoJson, AppInfo, AppInfoJsonMandatory, AppInfoWithState };
export { AppInfoRequirements };
