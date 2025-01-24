import _ from 'lodash';
import { tvInfo } from '@tvSettings/index';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { EventEmitter } from 'events';
import type { LunaAdditionalData } from './index';

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

const getSystemInfoFromSettings = (keys: string[]) => {
  const systemInfo = tvInfo.systemInfo;
  return keys.reduce((pre: { [key: string]: string }, cur) => {
    return _.has(systemInfo, cur)
      ? _.set(pre, cur, _.get(systemInfo, cur))
      : pre;
  }, {});
};

class TVDeviceInformation {
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

    if (method === 'getSystemInfo') {
      return await this.getSystemInfo(params, emitter, token);
    }
    return methodNotFound(category, method);
  };

  getSystemInfo = async (
    params: string,
    emitter: EventEmitter,
    token: string
  ) => {
    const { keys, subscribe }: { keys?: string[]; subscribe?: boolean } =
      JSON.parse(params);

    if (!keys || _.isEmpty(keys)) {
      return methodError('ERROR_06', 'Invalid argument.');
    }

    if (subscribe && !subscriptions.has(token)) {
      subscriptions.set(token, { emitter, keys });
    }

    const ret = getSystemInfoFromSettings(keys);
    if (_.isEmpty(ret)) {
      return methodError('ERROR_06', 'Invalid argument.');
    }

    return {
      ...ret,
      returnValue: true,
    };
  };
}

const tvDeviceInformation = new TVDeviceInformation();
export default tvDeviceInformation;
