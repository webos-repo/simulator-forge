import type { ShareFrameIdParam } from '@share/structure/ipcParams';
import { contextBridge, ipcRenderer, webFrame } from 'electron';
import { loadLGFont } from './assistants/fontLoader';
import { getTestApi } from './assistants/devAssistant';
import ApiKeys from './lib/ApiKeys';
import { webOSEnv } from './lib/appEnv';
import { wrapWindowApis } from './lib/windowWrapper';
import { getWebOSServiceBridgeApi } from './webOS/webOSServiceBridgePrivate';
import { makeWebOSServiceBridgeInApp } from './webOS/webOSServiceBridge';
import { getWebOSSystemApi, makeWebOSSystemInApp } from './webOS/webOSSystem';
import * as eventDispatcher from './assistants/eventDispatcher';
import * as isolationAssistant from './assistants/isolationAssistant';
import * as inAppRunner from './assistants/inAppRunner';
import * as devAssistant from './assistants/devAssistant';

declare global {
  interface Window {
    webOSSystem: any;
    PalmSystem: any;
    WebOSServiceBridge: any;
    PalmServiceBridge: any;
    webOSGetResource: (...args: any[]) => void;
    webos: {
      readonly timezone: string;
    };
    [ApiKeys.Root]: SimulatorExposed;
  }
}

interface SimulatorExposed {
  [ApiKeys.WebOSSystem]: any;
  [ApiKeys.WebOSServiceBridge]: any;
  [ApiKeys.IsolateBridge]: any;
  [ApiKeys.SimulTest]: any;
}

function exposeApiInApp() {
  contextBridge.exposeInMainWorld(ApiKeys.Root, {
    [ApiKeys.WebOSSystem]: getWebOSSystemApi(),
    [ApiKeys.WebOSServiceBridge]: getWebOSServiceBridgeApi(),
    [ApiKeys.IsolateBridge]: isolationAssistant.getExposeApi(),
    [ApiKeys.SimulTest]: getTestApi(),
  } as SimulatorExposed);
}

function makeObjectsInApp() {
  makeWebOSSystemInApp();
  makeWebOSServiceBridgeInApp();
}

function setIpcListener() {
  eventDispatcher.setIpcListener();
  isolationAssistant.setIpcListener();
  devAssistant.setIpcListener();
}

function setWindowListener() {
  isolationAssistant.setWindowListener();
  inAppRunner.setAppWindowListener();
}

ipcRenderer.send('share-frame-id', {
  appId: webOSEnv.appInfo.id,
} as ShareFrameIdParam);

exposeApiInApp();
makeObjectsInApp();
setIpcListener();
setWindowListener();
wrapWindowApis();
loadLGFont();
