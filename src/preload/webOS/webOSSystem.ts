import { orientations } from '@share/structure/orientations';
import { ipcRenderer } from 'electron';
import appState from '../assistants/appState';
import { webOSEnv } from '../lib/appEnv';
import ApiKeys from '../lib/ApiKeys';
import { functionRunner } from '../lib/functionRunner';

export function getWebOSSystemApi() {
  const { appInfo, webOSSystemConf, settingsConf, launchEnv } = webOSEnv;

  const props = {
    identifier: () => appInfo.id,
    isKeyboardVisible: () => appState.isKeyboardVisible,
    deviceInfo: () => webOSSystemConf.deviceInfo,
    country: () => webOSSystemConf.country,
    timeZone: () => webOSSystemConf.timeZone,
    launchParams: () => launchEnv.launchParams,
    launchReason: () => launchEnv.launchReason,
    activityId: () => launchEnv.activityId,
    locale: () => settingsConf.locale,
    localeRegion: () => settingsConf.localeRegion,
    tvSystemInfo: () => settingsConf.tvSystemInfo,
    highContrast: () => settingsConf.highContrast,
    voiceControl: () => settingsConf.voiceControl,
    screenOrientation: () => appState.scrOrn,
    currentOrientation: () => appState.curOrn,
    isActivated: () => appState.isActivated,
    phoneRegion: () => '',
    timeFormat: () => '',
    isMinimal: () => true,
    cursor: {
      visibility: () => appState.cursorVisibility,
    },
  };

  const methods = {
    window: {
      setFocus: () => {
        checkArgsLength(['needFocus', 'true'], 2);
      },
      setProperty: (...args: any[]) => {
        checkArgsLength(args, 2);
      },
      setInputRegion: (...args: any[]) => {
        checkArgsLength(args, 2);
      },
    },
    cursor: {
      setCursor: (shape: string, x: number, y: number) =>
        methods.setCursor(shape, x, y),
      getCursorState: () => {
        return JSON.stringify({
          visibility: appState.cursorVisibility,
        });
      },
      hide: () => {},
    },
    activate: () => {},
    deactivate: () => {
      ipcRenderer.send('app-deactivate', appInfo.id);
    },
    hide: () => {
      methods.deactivate();
    },
    close: () => {
      ipcRenderer.send('close-app-by-id', appInfo.id);
    },
    getIdentifier: () => {
      return webOSEnv.appInfo.id;
    },
    setWindowOrientation: (...args: any[]) => {
      checkArgsLength(args, 1);
      const [screenOrientation] = args;
      if (orientations.includes(screenOrientation)) {
        ipcRenderer.send(
          'req-change-app-orn',
          webOSEnv.appInfo.id,
          screenOrientation
        );
        return true; // TODO: check return value
      }
      return undefined;
    },
    platformBack: () => {
      ipcRenderer.send('platform-back', appInfo.id);
    },
    setCursor: (shape: string, x: number, y: number) => {
      if (shape === 'default' || shape === '') {
        ipcRenderer.send('set-cursor', x, y);
        return true;
      }
      return false;
    },
    isWebViewLaunched: () => {
      return false;
    },
    setKeyMask: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    setLoadErrorPolicy: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    setWindowProperty: (...args: any[]) => {
      checkArgsLength(args, 2);
    },
    setInputRegion: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    click: () => {},
    createWebView: () => {},
    devicePixelRatio: () => {
      return window.devicePixelRatio;
    },
    editorFocused: () => {},
    getResource: (...args: any[]) => {
      checkArgsLength(args, 1);
      return '';
    },
    enableFullScreenMode: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    addBannerMessage: () => {},
    clearBannerMessages: () => {},
    removeBannerMessage: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    addNewContentIndicator: () => {},
    applyLaunchFeedback: () => {},
    copiedToClipboard: () => {},
    markFirstUseDone: () => {},
    removeNewContentIndicator: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    setManualKeyboardEnabled: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    simulateMouseClick: (...args: any[]) => {
      checkArgsLength(args, 3);
    },
    stagePreparing: () => {},
    stageReady: () => {},
    useSimulatedMouseClicks: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    containerReady: () => {},
    onCloseNotify: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    keepAlive: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    focusLayer: () => {},
    focusOwner: () => {},
    keyboardHide: () => {},
    keyboardShow: () => {},
    paste: () => {},
    pastedFromClipboard: () => {},
    PmLogInfoWithClock: () => {},
    PmLogString: () => {},
    PmTrace: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    PmTraceAfter: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    PmTraceBefore: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    PmTraceItem: (...args: any[]) => {
      checkArgsLength(args, 1);
    },
    reloadInjectionData: () => {},
    updateInjectionData: (...args: any[]) => {
      checkArgsLength(args, 2);
    },
    serviceCall: (...args: any[]) => {
      checkArgsLength(args, 2);
      return false;
    },
    closeWebView: () => {},
    ...(webOSEnv.simulatorInfo.webOSVersion === '6.0'
      ? {
          serviceEnable: (...args: any[]) => {
            checkArgsLength(args, 1);
          },
          isServiceRunning: () => {
            return false;
          },
        }
      : {}),
  };
  return { props, methods };
}

function checkArgsLength(args: any[], len: number) {
  if (args.length < len) {
    throw TypeError('Insufficient number of arguments.');
  }
  return true;
}

export function makeWebOSSystemInApp() {
  // [WARNING] Require local copy
  const RootKey = ApiKeys.Root;
  const WebOSSystemKey = ApiKeys.WebOSSystem;

  functionRunner(
    () => {
      function setProps(map: any, target: any, valueFunc: (v: any) => any) {
        Object.entries(map).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object') {
            if (!target[key]) {
              Object.defineProperty(target, key, { value: {} });
            }
            setProps(value, target[key], valueFunc);
            return;
          }
          Object.defineProperty(target, key, valueFunc(value));
        });
      }

      window.webOSSystem = {};

      setProps(
        window[RootKey][WebOSSystemKey].props,
        window.webOSSystem,
        (value: any) => {
          return {
            get() {
              return value();
            },
          };
        }
      );
      setProps(
        window[RootKey][WebOSSystemKey].methods,
        window.webOSSystem,
        (value: any) => {
          return {
            value,
          };
        }
      );

      Object.defineProperty(window, 'PalmSystem', {
        value: window.webOSSystem,
      });
      Object.defineProperty(window, 'webOSGetResource', {
        value: window.webOSSystem.getResource,
      });
      Object.defineProperty(window, 'webos', {
        value: {
          timezone: window.webOSSystem.timeZone,
        },
      });

      Object.preventExtensions(window.webOSSystem);
      Object.preventExtensions(window.webos);
    },
    { replace: { RootKey, WebOSSystemKey } }
  );
}
