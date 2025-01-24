/* eslint-disable no-fallthrough */

import { isWebOSVersionGte } from '@main/lib/simulInfo';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { LunaAdditionalData } from './index';
import type { EventEmitter } from 'events';

const subscriptions: Map<string, { emitter: EventEmitter; keys: string[] }> =
  new Map();

const cancelSubscription = (token: string) => {
  if (subscriptions.has(token)) {
    subscriptions.get(token)!.emitter.emit('subscribe-return', {
      ret: {},
      isSubscription: false,
    });
    subscriptions.delete(token);
  }
  return {
    returnValue: true,
  };
};

class BleGattService {
  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('101', 'Invalid JSON format.');
    }

    const { emitter, token, isCancel } = additionalData;

    if (isCancel) {
      return cancelSubscription(token);
    }

    switch (category) {
      case '':
        switch (method) {
          case 'isEnabled':
          // return await this.isEnabled();
          case 'startScan':
          // return await this.startScan();
          case 'stopScan':
          // return await this.stopScan();
          case 'getState':
          // return await this.getState();
          case 'pair':
          // return await this.pair();
          case 'unpair':
            // return await this.unpair();
            if (!isWebOSVersionGte('24')) break;
            return this.retNotSupport();
          default:
        }
        break;
      case 'client':
        switch (method) {
          case 'connect':
          // return await this.client_connect();
          case 'disconnect':
          // return await this.client_disconnect();
          case 'getServices':
          // return await this.client_getServices();
          case 'discoverServices':
          // return await this.client_discoverServices();
          case 'setCharacteristicNotification':
          // return await this.client_setCharacteristicNotification();
          case 'readCharacteristic':
          // return await this.client_readCharacteristic();
          case 'readDescriptor':
          // return await this.client_readDescriptor();
          case 'writeCharacteristic':
          // return await this.client_writeCharacteristic();
          case 'writeDescriptor':
            // return await this.client_writeDescriptor();
            if (!isWebOSVersionGte('24')) break;
            return this.retNotSupport();
          default:
        }
        break;
      default:
    }
    return methodNotFound(category, method);
  };

  retNotSupport = () => {
    return methodError(-1, 'Not supported API in simulator');
  };

  // isEnabled = async () => {};
  // startScan = async () => {};
  // stopScan = async () => {};
  // getState = async () => {};
  // pair = async () => {};
  // unpair = async () => {};
  // client_connect = async () => {};
  // client_disconnect = async () => {};
  // client_discoverServices = async () => {};
  // client_getServices = async () => {};
  // client_setCharacteristicNotification = async () => {};
  // client_readCharacteristic = async () => {};
  // client_readDescriptor = async () => {};
  // client_writeCharacteristic = async () => {};
  // client_writeDescriptor = async () => {};
}

const bleGattService = new BleGattService();
export default bleGattService;
