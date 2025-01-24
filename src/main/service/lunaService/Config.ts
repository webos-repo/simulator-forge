import _ from 'lodash';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import { tvInfo } from '@tvSettings/index';
import type { LunaAdditionalData } from './index';

class ConfigService {
  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('ERROR_99', 'JSON format error.');
    }

    if (category === '') {
      switch (method) {
        case 'getConfigs':
          return await this.getConfigs(params);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  getConfigs = async (params: string) => {
    const { configNames }: { configNames: string[] } = JSON.parse(params);
    const missingConfigs: string[] = [];
    const tvInfoConfigs = tvInfo.configs;

    if (!configNames) {
      return methodError(-2, 'Invalid parameter error', { subscribed: false });
    }

    const configs = configNames?.reduce((pre: any, cur) => {
      if (_.has(tvInfoConfigs, cur)) {
        pre[cur] = _.get(tvInfoConfigs, cur);
      } else {
        missingConfigs.push(cur);
      }
      return pre;
    }, {});

    return {
      subscribed: false,
      returnValue: true,
      ...(_.isEmpty(configs) ? {} : { configs }),
      ...(_.isEmpty(missingConfigs) ? {} : { missingConfigs }),
    };
  };
}

const configService = new ConfigService();
export default configService;
