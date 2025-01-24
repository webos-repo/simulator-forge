import { tvLocation } from '@tvSettings/index';
import { emtSetting } from '../../module/eventEmitters';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';

import type { EventEmitter } from 'events';
import type { LunaAdditionalData } from './index';

type SettingsType = {
  localeInfo?: {
    locales: {
      UI: string;
      TV: string;
      FMT: string;
      NLP: string;
      STT: string;
      AUD: string;
      AUD2: string;
    };
    clock: string;
    keyboards: string[];
    timezone: string;
  };
  smartServiceCountryCode2?: string; // alpha-2
  country?: string; // alpha-3
  audioGuidance?: string;
  captionEnable?: string;
};

const optionKeys = ['country', 'smartServiceCountryCode2', 'audioGuidance'];
const subscriptions: Map<
  string,
  {
    emitter: EventEmitter;
    category?: string;
    method: string;
    keys?: string[];
    key?: string;
  }
> = new Map();

const getLocaleInfo = () => {
  return {
    locales: {
      UI: 'en-US',
      TV: 'en-US',
      FMT: 'en-US',
      NLP: 'en-US',
      STT: 'en-US',
      AUD: 'en-US',
      AUD2: 'en-US',
    },
    clock: 'locale',
    keyboards: ['en'],
    timezone: tvLocation.timeZone,
  };
};

const getSettingValue = (key: string | undefined) => {
  if (key === 'country') return { country: tvLocation.country };
  if (key === 'smartServiceCountryCode2')
    return { smartServiceCountryCode2: tvLocation.countryAlpha2 };
  if (key === 'audioGuidance') return { audioGuidance: 'off' };
  return undefined;
};

const getSettings = (
  key?: string,
  keys?: string[]
): SettingsType | undefined => {
  if (key && keys) return undefined;

  if (key) return getSettingValue(key);

  if (
    !keys ||
    keys.length === 0 ||
    !keys.every((k) => optionKeys.includes(k))
  ) {
    return undefined;
  }
  return {
    ...(keys.includes('country') ? getSettingValue('country') : null),
    ...(keys.includes('smartServiceCountryCode2')
      ? getSettingValue('smartServiceCountryCode2')
      : null),
    ...(keys.includes('audioGuidance')
      ? getSettingValue('audioGuidance')
      : null),
  };
};

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

emtSetting.on('settings-updated', () => {
  subscriptions.forEach(({ emitter, category, method, keys, key }) => {
    let ret;
    if (!category) {
      if (
        (!keys && key === 'localeInfo') ||
        (!key && keys && keys.length === 1 && keys[0] === 'localeInfo')
      ) {
        ret = {
          returnValue: true,
          method,
          settings: {
            localeInfo: getLocaleInfo(),
          },
        };
      }
    } else if (category === 'option') {
      const settings = getSettings(key, keys);
      ret = {
        returnValue: true,
        category,
        method,
        settings,
      };
    } else if (category === 'caption') {
      ret = {
        returnValue: true,
        category,
        method,
        settings: {
          captionEnable: 'off',
        },
      };
    }
    if (ret) {
      emitter.emit('subscribe-return', { ret, isSubscription: true });
    }
  });
});

class SettingsService {
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
        case 'getSystemSettings':
          return await this.getSystemSettings(params, emitter, token);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  getSystemSettings = async (
    params: string,
    emitter: EventEmitter,
    token: string
  ) => {
    const { category, keys, key, subscribe } = JSON.parse(params);
    const method = 'getSystemSettings';
    const retError = {
      method,
      returnValue: false,
      errorText: 'There is no matched result from DB',
    };

    if (subscribe && !subscriptions.has(token)) {
      subscriptions.set(token, { category, method, keys, key, emitter });
    }

    let settings;
    if (!category) {
      if (
        (!keys && key === 'localeInfo') ||
        (!key && keys && keys.length === 1 && keys[0] === 'localeInfo')
      ) {
        settings = {
          localeInfo: getLocaleInfo(),
        };
      }
    } else if (category === 'option') {
      settings = getSettings(key, keys);
    } else if (category === 'caption') {
      settings = {
        captionEnable: 'off',
      };
    }

    if (!settings) return retError;
    return {
      subscribed: !!subscribe,
      category,
      method,
      settings,
      returnValue: true,
    };
  };
}

const settingsService = new SettingsService();
export default settingsService;
