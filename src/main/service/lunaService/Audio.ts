import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import { emtWindow } from '../../module/eventEmitters';
import type { LunaAdditionalData } from './index';

class AudioService {
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
      switch (params) {
        case 'setMuted':
          return await this.setMuted(params);
        case 'volumeUp':
          return await this.volumeUp();
        case 'volumeDown':
          return await this.volumeDown();
        default:
      }
    }
    return methodNotFound(category, method);
  };

  setMuted = async (params: string) => {
    const { muted } = JSON.parse(params);

    emtWindow.emit('toggle-mute', muted);
    return {
      returnValue: true,
    };
  };

  volumeDown = async () => {
    return {
      returnValue: true,
    };
  };

  volumeUp = async () => {
    return {
      returnValue: true,
    };
  };
}

const audioService = new AudioService();
export default audioService;
