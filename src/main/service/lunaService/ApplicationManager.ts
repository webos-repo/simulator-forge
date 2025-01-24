import { appInfos } from '@controller/appController/appMemory';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import { emtApp } from '../../module/eventEmitters';
import type { LunaAdditionalData } from './index';

class ApplicationManager {
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
        case 'launch':
          return await this.launch(params);
        case 'getAppLoadStatus':
          return await this.getAppLoadStatus(params);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  launch = async (params: string) => {
    const {
      id,
      params: launchParams,
    }: { id: string; params: { [key: string]: any } } = JSON.parse(params);
    if (!appInfos.findById(id)) {
      return methodError(-101, 'The app was not found.');
    }
    emtApp.emit('launch-app-by-id', {
      appId: id,
      launchParams,
    });
    return {
      returnValue: true,
    };
  };

  getAppLoadStatus = async (params: string) => {
    const { appId } = JSON.parse(params);
    if (!appInfos.findById(appId)) {
      return methodError(
        1,
        'Invalid appId specified. This error is returned when the appId parameter is empty.'
      );
    }
    return {
      returnValue: true,
      exist: true,
    };
  };
}

const applicationManager = new ApplicationManager();

export default applicationManager;
