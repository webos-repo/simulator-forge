import { makeDB } from '@controller/dbController';
import { emtApp } from '../../../module/eventEmitters';
import { generateHash } from '../../../lib/hash';
import _ from 'lodash';
import R from 'ramda';
import type * as DBServiceTypes from './types';

export default class DBServiceController {
  db = makeDB('db8');
  revId: number;

  constructor() {
    this.revId = this.db.has('revId') ? this.db.get('revId') : 0;
    this.setListener();
  }

  private setListener = () => {
    emtApp.on('remove-app-from-list', this.handleAppRemoved);
  };

  private handleAppRemoved = (appId: string) => {
    const data = this.db.get();
    _.toPairs(data).forEach(([kind, { private: prvt, owner }]: any) => {
      if (prvt && owner === appId) {
        this.deleteKind(kind);
      }
    });
  };

  private hasPermission = (
    operation: DBServiceTypes.Operation,
    kind: string,
    appId: string
  ) => {
    const accessibleList = this.db.get(`${escapeDot(kind)}.accessible`);
    if (!accessibleList) return false;
    if (!_.has(accessibleList, appId)) return false;
    return !!accessibleList[appId].find((op: string) => op === operation);
  };

  private canRead = R.curry(this.hasPermission)('read');

  private canCreate = R.curry(this.hasPermission)('create');

  private canUpdate = R.curry(this.hasPermission)('update');

  private canDelete = R.curry(this.hasPermission)('delete');

  // -3: other error
  // -2: access denied
  // -1 : not registered
  // 1 : OK
  deleteData = (appId: string, kindOrigin: string, dataId?: string) => {
    const kind = escapeDot(kindOrigin);
    if (!this.db.has(kind)) return -1;
    if (!this.canDelete(kind, appId)) return -2;
    if (dataId) {
      this.deleteId(kind, dataId);
    } else {
      this.deleteKind(kind);
    }
    return 1;
  };

  deleteDataById = (appId: string, dataId: string) => {
    const kind = this.db.get(`mappingIdKind.${dataId}`);
    if (!kind) return -1;
    return this.deleteData(appId, kind, dataId);
  };

  private deleteKind = (kind: string) => {
    this.db.delete(kind);
    this.removeMappingIdKindByKind(kind);
  };

  private deleteId = (kind: string, dataId: string) => {
    this.db.delete(`${kind}.data.${dataId}`);
    this.removeMappingIdKindById(dataId);
  };

  deleteDataByQuery = (appId: string, query: DBServiceTypes.Query) => {
    const { filteredData, code } = this.getDataByQuery(appId, query);

    if (code < 0 || !filteredData) return -1;
    let count = 0;
    Object.values(filteredData).forEach((d: any) => {
      if (this.deleteDataById(appId, d['_id']) > 0) count += 1;
    });
    return count;
  };

  private getMappingIdKind = () => {
    return this.db.get('mappingIdKind') || {};
  };

  private removeMappingIdKindByKind = (kind: string) => {
    const newRM = _.pickBy(this.getMappingIdKind(), (v) => v === kind);
    this.db.set('mappingIdKind', newRM);
  };

  private removeMappingIdKindById = (id: string) => {
    this.db.set('mappingIdKind', _.omit(this.getMappingIdKind(), id));
  };

  getDataById = (appId: string, id: string) => {
    const kindOrigin = this.db.get(`mappingIdKind.${id}`) as string | undefined;
    if (!kindOrigin) return undefined;

    const kind = escapeDot(kindOrigin);

    if (!this.canRead(kind, appId)) return undefined;

    return this.db.get(`${kind}.data.${id}`);
  };

  getDataByQuery = (
    appId: string,
    query: DBServiceTypes.Query,
    isSearch = true
  ) => {
    const { from, where, filter, select } = query; // FIXME
    const kind = escapeDot(from);
    if (!this.db.get(kind)) {
      return {
        filteredData: [],
        code: -3970,
      };
    }

    if (!this.canRead(kind, appId)) {
      return {
        filteredData: [],
        code: -3963,
      };
    }

    const dbData = this.db.get(`${kind}.data`) || [];
    const queryFilters = where || filter;

    // eslint-disable-next-line prefer-const
    let [filteredData, code] = this.filterData(
      Object.values(dbData),
      queryFilters,
      isSearch
    );
    if (select) filteredData = this.filterDataBySelect(filteredData, select);
    return {
      filteredData,
      code,
    };
  };

  private filterData = (
    originData: any[],
    queryFilters: DBServiceTypes.WhereClause[] | undefined,
    isSearch: boolean
  ): [any[], number] => {
    let code = 1;
    return [
      !queryFilters
        ? originData
        : originData.filter((data: any) => {
            return queryFilters.every((flt) => {
              if (flt?.op === '%%') {
                code = -1;
                return false;
              }
              if (flt?.op === '?' && !isSearch) {
                code = -2;
                return false;
              }
              if (!data) return false;
              return this.filterDataByOp(data, flt);
            });
          }),
      code,
    ];
  };

  private filterDataByOp = (
    dataObjects: any,
    where: DBServiceTypes.WhereClause
  ) => {
    const { prop, op, val } = where;

    //  <, <=, =, >=, >, !=, ?, %, %%
    switch (op) {
      case '=':
        return dataObjects[prop] === val;
      case '!=':
        return dataObjects[prop] !== val;
      case '<':
        return dataObjects[prop] < val;
      case '<=':
        return dataObjects[prop] <= val;
      case '>':
        return dataObjects[prop] > val;
      case '>=':
        return dataObjects[prop] >= val;
      case '%':
      case '?':
        return (
          typeof dataObjects[prop] === 'string' &&
          dataObjects[prop].startsWith(val)
        );
      default:
    }
    return false;
  };

  private filterDataBySelect = (originData: any[], select: string[]) => {
    return originData.map((data) => _.pick(data, select));
  };

  putData = (appId: string, kindOrigin: string, data: any) => {
    const kind = escapeDot(kindOrigin);
    if (!this.canCreate(kind, appId)) return undefined;

    const id = generateHash();
    this.db.set(`${kind}.data.${id}`, {
      ...data,
      _rev: this.upRevId(),
      _id: id,
    });
    this.db.set(`mappingIdKind.${id}`, kindOrigin);
    return id;
  };

  putPermissions = (
    appId: string,
    target: string,
    keyOrigin: string,
    operations: string[]
  ) => {
    const key = escapeDot(keyOrigin);
    if (!this.canUpdate(key, appId)) return false;

    const accessibleList = this.db.get(`${key}.accessible`);
    let permissions: Array<string>;
    if (_.has(accessibleList, target)) {
      permissions = accessibleList[target];
    } else {
      permissions = [];
    }

    operations.forEach((op) => {
      if (!_.has(permissions, op)) permissions.push(op);
    });
    accessibleList[target] = permissions;
    this.db.set(`${key}.accessible`, accessibleList);
    return true;
  };

  checkKind = (kind: string) => {
    return this.db.has(escapeDot(kind));
  };

  makeKind = (params: DBServiceTypes.PutKindParams) => {
    const { id, owner, private: prvt } = params;
    const kind = escapeDot(id);
    if (this.db.has(kind)) return false;

    this.db.set(kind, {
      owner,
      private: prvt || false,
      accessible: {
        [owner]: ['read', 'create', 'update', 'delete'],
      },
    });
    return true;
  };

  getRevId = () => {
    return this.revId;
  };

  upRevId = () => {
    this.revId += 1;
    this.db.set('revId', this.revId);
    return this.revId;
  };

  update = (keyOrigin: string, id: string, data: any) => {
    const key = escapeDot(keyOrigin);
    const originData = this.db.get(`${key}.data.${id}`);
    if (!originData) return false;
    this.db.set(`${key}.data.${id}`, {
      ...originData,
      ...data,
      _rev: this.upRevId(),
    });
    return true;
  };

  updateById = (appId: string, id: string, data: any) => {
    const kind = this.db.get(`mappingIdKind.${id}`);
    if (!kind || !this.canUpdate(kind, appId)) {
      return false;
    }
    this.update(kind, id, data);
    return { id, rev: this.getRevId() };
  };

  updateByQuery = (appId: string, query: DBServiceTypes.Query, props: any) => {
    const { filteredData, code } = this.getDataByQuery(appId, query);
    if (code < 0) return [-1, code];

    let isAllHavePermission = true;
    filteredData.some((data: any) => {
      const { _kind: kind } = data;
      if (!this.canUpdate(kind, appId)) {
        isAllHavePermission = false;
        return true;
      }
      return false;
    });
    if (!isAllHavePermission) return [-1, -3963];

    let count = 0;
    filteredData.forEach((data: any) => {
      const { _kind: kind, _id: id } = data;
      if (this.update(kind, id, props)) count += 1;
    });
    return [count, code];
  };

  setWatcher = (handler: any) => {
    return this.db.setOnDidChange({ handler });
  };
}

function escapeDot(origin: string) {
  return origin.replace(/\./g, '-');
}
