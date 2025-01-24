import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { LunaAdditionalData } from './index';

class DRMService {
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
        case 'load':
          return await this.load(params);
        case 'unload':
          return await this.unload(params);
        case 'isLoaded':
          return await this.isLoaded(params);
        case 'sendDrmMessage':
          return await this.sendDrmMessage(params);
        case 'getRightsError':
          return await this.getRightsError(params);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  load = async (params: string) => {
    return methodError(999, 'Simulator does not support DRM');
  };

  unload = async (params: string) => {
    return methodError(999, 'Simulator does not support DRM');
  };

  isLoaded = async (params: string) => {
    return methodError(999, 'Simulator does not support DRM');
  };

  sendDrmMessage = async (params: string) => {
    return methodError(999, 'Simulator does not support DRM');
  };

  getRightsError = async (params: string) => {
    return methodError(999, 'Simulator does not support DRM');
  };
}

const drmService = new DRMService();
export default drmService;
