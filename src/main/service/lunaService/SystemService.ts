import moment from 'moment-timezone';
import { tvLocation } from '@tvSettings/index';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { EventEmitter } from 'events';
import type { LunaAdditionalData } from './index';

const subscriptions: Map<string, EventEmitter> = new Map();

const getSystemTime = () => {
  try {
    const tz = tvLocation.timeZone;
    const mnt = moment().tz(tz);
    return {
      utc: mnt.valueOf(),
      localtime: {
        year: Number(mnt.format('Y')),
        month: Number(mnt.format('M')),
        day: Number(mnt.format('D')),
        hour: Number(mnt.format('H')), // h: 0~11, H: 0~23
        minute: Number(mnt.format('m')),
        second: Number(mnt.format('s')),
      },
      timezone: tz,
      TZ: tvLocation.timeZoneAbbr,
      offset: mnt.utcOffset(),
      timeZoneFile: '', // In simulator, not be used.
      NITZValid: false, // deprecated
    };
  } catch (e) {
    return undefined;
  }
};

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

const getSystemTimeSubsHandler = () => {
  subscriptions.forEach((emitter) => {
    emitter.emit('subscribe-return', {
      ret: {
        ...getSystemTime(),
        NITZValidTime: '',
        NITZValidZone: '',
      },
      isSubscription: true,
    });
  });
};

class SystemService {
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

    if (category === 'time') {
      switch (method) {
        case 'getSystemTime':
          return await this.getSystemTime(params, emitter, token);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  getSystemTime = async (
    params: string,
    emitter: EventEmitter,
    token: string
  ) => {
    const { subscribe }: { subscribe?: boolean } = JSON.parse(params);
    const ret = getSystemTime();

    if (!ret) {
      return {
        returnValue: false,
      };
    }

    if (subscribe && !subscriptions.has(token)) {
      subscriptions.set(token, emitter);
    }

    return {
      ...ret,
      ...(subscribe === undefined ? {} : { subscribed: subscribe }),
    };
  };
}

const systemService = new SystemService();
export default systemService;
