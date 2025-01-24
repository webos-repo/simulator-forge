import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import { tvInfo } from '@tvSettings/index';
import type { LunaAdditionalData } from './index';

type ErrorType = {
  errorCode: string;
  errorText: string;
};
type IdListType = {
  idType: string;
  idValue: string;
};

class DeviceUniqueId {
  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('ERROR_99', 'JSON format error.');
    }

    if (category === 'deviceid')
      switch (method) {
        case 'getIDs':
          return await this.getIDs(params);
        default:
      }
    return methodNotFound(category, method);
  };

  getIDs = async (params: string) => {
    const { idType }: { idType?: string[] } = JSON.parse(params);
    if (!idType || idType.length === 0) {
      return methodError('ERR.001', 'Invalid Parameters');
    }

    const idList: (IdListType | ErrorType)[] = [];
    idType.forEach((id) => {
      if (id === 'LGUDID') {
        idList.push({
          idType: id,
          idValue: tvInfo.LGUDID,
        });
      } else {
        idList.push({
          errorCode: 'ERR.801',
          errorText: 'Unsupported Device ID Type',
        });
      }
    });
    return {
      returnValue: true,
      idList,
    };
  };
}
const deviceUniqueId = new DeviceUniqueId();
export default deviceUniqueId;
