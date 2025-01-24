import { ipcRenderer, webFrame } from 'electron';
import type { ServiceData } from '@service/Service';
import { webOSEnv } from '../lib/appEnv';

const bridgeMap: { [key: number]: WebOSServiceBridgePrivate } = {};

class WebOSServiceBridgePrivate {
  onservicecallback?: any;
  private static count = 0;
  private url?: string;
  private channel?: string;
  private token?: string;
  private callbackHandler?: (_none: any, res: any) => boolean;

  constructor(callback?: any) {
    this.onservicecallback = callback;
  }

  cancel() {
    if (!this.url) return;
    ipcRenderer.send('call-service', {
      url: this.url,
      params: JSON.stringify({ subscribe: true }),
      token: this.token,
      isCalledFromApp: true,
      isCancel: true,
      frameId: webFrame.routingId,
    } as ServiceData);
    if (this.channel && this.callbackHandler) {
      ipcRenderer.removeListener(this.channel, this.callbackHandler);
    }
  }

  async call(url: string, params: string) {
    WebOSServiceBridgePrivate.count += 1;
    const appId = webOSEnv.appInfo.id;
    this.token = `${appId}.${WebOSServiceBridgePrivate.count}`;
    this.url = url;
    this.channel = `return-service-${this.token}`;

    this.callbackHandler = (_none, res) => {
      if (Object.keys(res).length === 0) {
        return false;
      }
      if (this.onservicecallback) {
        this.onservicecallback(JSON.stringify(res));
      }
      return true;
    };
    ipcRenderer.on(this.channel, this.callbackHandler);

    ipcRenderer.send('call-service', {
      url: this.url,
      params,
      token: this.token,
      isCalledFromApp: true,
      isCancel: false,
      frameId: webFrame.routingId,
    } as ServiceData);
  }
}

export function getWebOSServiceBridgeApi() {
  return {
    call: (
      bridgeKey: number,
      url: string,
      params: string,
      onservicecallback?: any
    ) => {
      if (!bridgeMap[bridgeKey]) {
        bridgeMap[bridgeKey] = new WebOSServiceBridgePrivate(onservicecallback);
      }
      bridgeMap[bridgeKey].call(url, params);
    },
    cancel: (bridgeKey: number) => {
      bridgeMap[bridgeKey].cancel();
      delete bridgeMap[bridgeKey];
    },
  };
}
