/* eslint-disable @typescript-eslint/naming-convention */

import type { EventEmitter } from 'events';
import { generateHash } from '../../../lib/hash';
import { isJsonStrValid } from '../../../lib/jsonChecker';
import { extractIdFromToken } from '../../../lib/pathResolver';
import { methodError, methodNotFound } from '@service/ServiceError';
import DBServiceController from './controller';
import type { LunaAdditionalData } from '@service/lunaService';
import type * as DBServiceTypes from './types';

const existPermissions = ['read', 'create', 'update', 'delete'];
const errorKindNotRegistered = (kind?: string) =>
  `kind not registered${kind ? `: '${kind}'` : ''}`;
const errorPermissionDenied = 'db: permission denied';

const cancelSubscription = (token: string) => {
  return {
    returnValue: true,
  };
};

let watchSubscriptions: [DBServiceTypes.Query, EventEmitter][] = [];
let onDidChangeUnsubscribe: any;

class DatabaseService {
  dbController: DBServiceController;
  constructor() {
    this.dbController = new DBServiceController();
  }

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
      return cancelSubscription(token);
    }

    if (category === '') {
      switch (method) {
        case 'batch':
          return await this.batch(params, token);
        case 'del':
          return await this.del(params, token);
        case 'delKind':
          return await this.delKind(params, token);
        case 'find':
          return await this.find(params, token);
        case 'get':
          return await this.get(params, token);
        case 'merge':
          return await this.merge(params, token);
        case 'put':
          return await this.put(params, token);
        case 'putKind':
          return await this.putKind(params, token);
        case 'putPermissions':
          return await this.putPermissions(params, token);
        case 'reserveIds':
          return await this.reserveIds(params);
        case 'search':
          return await this.search(params, token);
        case 'watch':
          return await this.watch(params, additionalData);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  batch = async (params: string, token: string) => {
    const { operations }: DBServiceTypes.BatchParams = JSON.parse(params);

    const res: Array<any> = [];
    operations.forEach((operation: any) => {
      const { method, params: subParams } = operation;
      if (!method) {
        res.push(methodError(-3984, 'No required key: "method"'));
      } else if (!subParams) {
        res.push(methodError(-3984, 'No required key: "params"'));
      }
      res.push(
        this.call('', method, JSON.stringify(subParams), { token } as any)
      );
    });
    const responses = await Promise.all(res);
    // 한개라도 에러나면 다 에러처리
    for (let i = 0; i < responses.length; i += 1) {
      const { returnValue } = responses[i];
      if (!returnValue) {
        return responses[i];
      }
    }

    return {
      returnValue: true,
      responses,
    };
  };

  del = async (params: string, token: string) => {
    const { ids, query, purge }: DBServiceTypes.DelParams = JSON.parse(params);
    const appId = extractIdFromToken(token);

    const results: Array<{ [key: string]: any }> = [];

    if (ids) {
      ids.forEach((id) => {
        const res = this.dbController.deleteDataById(appId, id);
        if (res > 0) results.push({ id });
      });
      return {
        returnValue: true,
        results,
      };
    }
    if (query) {
      const count = this.dbController.deleteDataByQuery(appId, query);
      // TODO: Check TV's real return value
      if (count <= 0) {
        return methodError(-3965, 'db: no index for query');
      }
      return {
        returnValue: true,
        count,
      };
    }

    // FIXME
    return methodError(-999, 'ids, query is empty');
  };

  delKind = async (params: string, token: string) => {
    const { id: kind }: DBServiceTypes.DelKindParams = JSON.parse(params);
    const appId = extractIdFromToken(token);

    const ret = this.dbController.deleteData(appId, kind);

    // FIXME
    if (ret === -1) {
      return methodError(-3970, errorKindNotRegistered(kind));
    }
    if (ret === -2) {
      return methodError(-3999, 'db: access denied');
    }

    return {
      returnValue: true,
    };
  };

  find = async (params: string, token: string, isSearch = false) => {
    const { query, count, watch }: DBServiceTypes.FindParams =
      JSON.parse(params);

    const appId = extractIdFromToken(token);
    const { filteredData, code } = this.dbController.getDataByQuery(
      appId,
      query,
      isSearch
    );

    // '%%' operation
    if (code < 0) {
      if (code === -1) {
        return methodError(
          22,
          `invalid parameters: caller='${appId}' error='invalid enum value for property 'op' for property 'where' for property 'query''`
        );
      }
      // '?' operation
      if (code === -2 || !filteredData) {
        return methodError(-3978, 'db: search operator not allowed in find');
      }
      if (code === -3970) {
        return methodError(code, errorKindNotRegistered(query.from));
      }
    }
    return {
      returnValue: true,
      results: filteredData,
      ...(isSearch ? { count: filteredData.length } : {}),
    };
  };

  search = async (params: string, token: string) => {
    return this.find(params, token, true);
  };

  get = async (params: string, token: string) => {
    const { ids }: DBServiceTypes.GetParams = JSON.parse(params);
    if (!ids) {
      return methodError(-999, ''); // FIXME
    }
    const results: Array<{ [key: string]: any }> = [];
    const appId = extractIdFromToken(token);
    ids.forEach((id: string) => {
      const res = this.dbController.getDataById(appId, id);
      if (res) results.push(res as any);
    });

    return {
      returnValue: true,
      results,
    };
  };

  merge = async (params: string, token: string) => {
    const { objects, query, props }: DBServiceTypes.MergeParams =
      JSON.parse(params);

    if (objects && query) {
      return methodError(
        22,
        'db: cannot have both an objects param and a query param'
      );
    }
    if (!objects && !query) {
      return methodError(
        22,
        'db: either objects or query param required for merge'
      );
    }

    const appId = extractIdFromToken(token);

    if (objects) {
      let isAllIdExist = true;
      objects.some((obj) => {
        const { _id } = obj;
        if (
          !_id ||
          !(typeof _id === 'string') ||
          !this.dbController.getDataById(appId, _id)
        ) {
          isAllIdExist = false;
          return true;
        }
        return false;
      });
      if (!isAllIdExist) {
        return methodError(-3969, 'db: kind not specified');
      }

      let isAllUpdated = true;
      const results: Array<{ id: string; rev: number }> = [];

      objects.some((obj) => {
        const { _id, ...data } = obj;
        const ret = this.dbController.updateById(appId, _id as string, data);
        if (!ret) {
          isAllUpdated = false;
          return true;
        }
        results.push(ret);
        return false;
      });
      if (!isAllUpdated) {
        return methodError(3978, 'db: search operator not allowed in find');
      }
      return {
        returnValue: true,
        results,
      };
    }

    if (query) {
      // Only query without props
      if (!props) {
        return methodError(-986, "required prop not found: 'props'");
      }

      const [count, code] = this.dbController.updateByQuery(
        appId,
        query,
        props
      );

      // Error
      if (count < 0) {
        if (code === -1) {
          return methodError(
            22,
            `invalid parameters: caller='${appId}' error='invalid enum value for property 'method' for property 'operations''`
          );
        }
        if (code === -2) {
          return methodError(-3978, 'db: search operator not allowed in find');
        }
        if (code === -3963) {
          return methodError(-3963, errorPermissionDenied); // TODO: check
        }
      }
      return {
        returnValue: true,
        count,
      };
    }
    return methodError(-9999, 'unknown error');
  };

  put = async (params: string, token: string) => {
    const { objects }: DBServiceTypes.PutParams = JSON.parse(params);
    if (!objects) {
      return methodError(-986, "required prop not found: 'objects'");
    }

    const appId = extractIdFromToken(token);
    const results: Array<{ id: string; rev: number }> = [];
    let error: any;

    objects.some((obj: any) => {
      const { _kind: kind } = obj;
      if (!kind) {
        error = methodError(-3969, 'db: kind not specified');
        return true;
      }
      if (!this.dbController.checkKind(kind)) {
        error = methodError(-3670, errorKindNotRegistered(kind));
        return true;
      }
      const id = this.dbController.putData(appId, kind, obj);
      if (!id) {
        error = methodError(-3963, errorPermissionDenied);
        return true;
      }

      results.push({
        id,
        rev: this.dbController.getRevId(),
      });
      return false;
    });

    if (error) return error;

    return {
      returnValue: true,
      results,
    };
  };

  putKind = async (params: string, token: string) => {
    const parsedParams: DBServiceTypes.PutKindParams = JSON.parse(params);
    const { id, owner } = parsedParams;

    if (!id) return methodError(-986, "required prop not found: 'id'");
    if (!owner) return methodError(-986, "required prop not found: 'owner'");

    const appId = extractIdFromToken(token);
    if (owner !== appId) {
      return methodError(-3963, errorPermissionDenied);
    }

    this.dbController.makeKind(parsedParams);
    return {
      returnValue: true,
    };
  };

  putPermissions = async (params: string, token: string) => {
    const { permissions } = JSON.parse(params);
    let error;
    permissions.some(
      ({
        type,
        object,
        caller,
        operations,
      }: DBServiceTypes.PutPermissionsParams) => {
        const appId = extractIdFromToken(token);
        const filteredOperations = Object.keys(operations).filter((op) =>
          existPermissions.includes(op)
        );
        if (
          !this.dbController.putPermissions(
            appId,
            caller,
            object,
            filteredOperations
          )
        ) {
          error = methodError(-3999, 'db: access denied');
          return true;
        }
        return false;
      }
    );

    if (error) return error;

    return {
      returnValue: true,
    };
  };

  // I don't know what this method is for
  reserveIds = async (params: string) => {
    const { count }: DBServiceTypes.ReserveIdsParams = JSON.parse(params);
    const ids = [];

    for (let i = 0; i < count; i += 1) {
      ids.push(generateHash());
    }

    return {
      returnValue: true,
      ids,
    };
  };

  watch = async (
    params: string,
    { token, isCalledFromApp, frameId, callback, emitter }: LunaAdditionalData
  ) => {
    const { subscribe }: { subscribe: boolean } = JSON.parse(params);
    const { query }: DBServiceTypes.WatchParams = JSON.parse(params);
    const appId = extractIdFromToken(token);
    const { filteredData, code } = this.dbController.getDataByQuery(
      appId,
      query,
      false
    );

    if (code === -3970) {
      return methodError(code, errorKindNotRegistered(query.from));
    }
    if (code === -3963) {
      return methodError(code, errorPermissionDenied);
    }
    if (code < 0) {
      return methodError(-999, ''); // FIXME
    }

    if (filteredData.length) {
      return {
        returnValue: true,
        fired: true,
        subscribe,
      };
    }

    if (!subscribe) {
      return {
        returnValue: true,
      };
    }

    if (!watchSubscriptions.length) {
      onDidChangeUnsubscribe = this.dbController.setWatcher(
        this.watchCallback(appId)
      );
    }
    watchSubscriptions = [...watchSubscriptions, [query, emitter]];

    return {
      returnValue: true,
    };
  };

  private watchCallback = (appId: string) => () => {
    watchSubscriptions = watchSubscriptions.filter(([q, emt], i) => {
      const { filteredData: callbackFilteredData, code: callbackCode } =
        this.dbController.getDataByQuery(appId, q);

      if (!callbackFilteredData || callbackCode < 0) return true;

      emt.emit('subscribe-return', {
        ret: {
          returnValue: true,
          subscribe: true,
          fired: true,
        },
        isSubscription: false,
      });
      return false;
    });
    if (!watchSubscriptions.length) onDidChangeUnsubscribe();
  };
}

const databaseService = new DatabaseService();
export default databaseService;
