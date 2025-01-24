import { emtSetting } from '@main/module/eventEmitters';
import { tvNetwork } from '@tvSettings/index';
import { isJsonStrValid } from '@main/lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { EventEmitter } from 'events';
import type { LunaAdditionalData } from '../index';
import type { ConnectionStatusType } from './types';

const defaultConnectionStatus: ConnectionStatusType = {
  isInternetConnectionAvailable: false,
  wired: {
    state: 'disconnected',
    plugged: false,
  },
  wifi: {
    state: 'disconnected',
    tetheringEnabled: false,
  },
  wifiDirect: {
    state: 'disconnected',
  },
  wan: {
    connected: false,
    connectedContexts: [],
  },
  offlineMode: 'disabled',
  cellular: {
    enabled: false,
  },
  bluetooth: {
    state: 'disconnected',
    tetheringEnabled: false,
  },
};

const subscriptions: Map<string, EventEmitter> = new Map();

const cancelSubscription = (token: string) => {
  if (subscriptions.has(token)) {
    subscriptions.get(token)!.emit('subscribe-return', {
      ret: {},
      isSubscription: false,
    });
    subscriptions.delete(token);
  }
  return {
    returnValue: true,
  };
};

emtSetting.on('network-info-updated', () => {
  const { isWired, networkInfo } = tvNetwork.networkInfo;
  const isConnected = networkInfo.state === 'connected';
  const ret = {
    isInternetConnectionAvailable: isConnected,
    wired:
      isConnected && isWired
        ? {
            ...networkInfo,
            plugged: true,
            proxyInfo: {
              method: 'direct',
            },
            checkingInternet: false,
          }
        : {
            state: 'disconnected',
            plugged: false,
          },
    wifi:
      isConnected && !isWired
        ? { ...networkInfo, tetheringEnabled: false }
        : {
            state: 'disconnected',
            tetheringEnabled: false,
          },
    wifiDirect: {
      state: 'disconnected',
    },
  };

  subscriptions.forEach((emitter) => {
    emitter.emit('subscribe-return', {
      ret,
      isSubscription: true,
    });
  });
});

class ConnectionManager {
  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('ERROR_99', 'JSON format error.');
    }

    const { emitter, token, isCancel } = additionalData;

    if (isCancel) {
      cancelSubscription(token);
    }

    if (category === '') {
      switch (method) {
        case 'getStatus':
          return await this.getStatus(params, emitter, token);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  getStatus = async (params: string, emitter: EventEmitter, token: string) => {
    const { subscribe }: { subscribe: boolean } = JSON.parse(params);
    const { isWired, networkInfo } = tvNetwork.networkInfo;

    const connectionStatus = defaultConnectionStatus;

    if (networkInfo.state === 'connected') {
      connectionStatus.isInternetConnectionAvailable = true;
      if (isWired) {
        connectionStatus.wired = {
          ...networkInfo,
          plugged: true,
          proxyInfo: {
            method: 'direct',
          },
          checkingInternet: false,
        };
      } else {
        connectionStatus.wifi = {
          ...networkInfo,
          tetheringEnabled: false,
        };
      }
    }

    if (subscribe && !subscriptions.has(token)) {
      subscriptions.set(token, emitter);
    }

    return {
      ...connectionStatus,
      returnValue: true,
      subscribed: subscribe,
    };
  };
}
const connectionManager = new ConnectionManager();
export default connectionManager;
