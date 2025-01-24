type WhereClause = {
  prop: string;
  op: string;
  val: any;
  collate?: string;
};

type Operation = 'read' | 'create' | 'update' | 'delete';

type Query = {
  from: string;
  select?: Array<string>;
  where?: Array<WhereClause>;
  orderBy?: string;
  desc?: boolean;
  incDel?: boolean;
  limit?: number;
  page?: string;
  filter?: Array<WhereClause>;
};

type PutPermissionsParams = {
  type: string;
  object: string;
  caller: string;
  operations: { [key: string]: string };
};

type BatchParams = {
  operations: Array<any>;
};

type GetParams = {
  ids: Array<string>;
};

type PutParams = {
  objects: Array<{ [key: string]: unknown }>;
};

type PutKindParams = {
  id: string;
  owner: string;
  schema?: any;
  sync?: boolean;
  private?: boolean;
  extends?: Array<string>;
  indexes?: any;
  revsets?: Array<any>;
};

type FindParams = {
  query: Query;
  count?: boolean;
  watch?: boolean;
};

type DelParams = {
  ids?: Array<string>;
  query?: Query;
  purge?: boolean;
};
type DelKindParams = {
  id: string;
};

type MergeParams = {
  objects?: Array<{ [key: string]: unknown }>;
  query?: Query;
  props?: { [key: string]: unknown };
};

type ReserveIdsParams = {
  count: number;
};

type WatchParams = {
  query: Query;
};

export {
  BatchParams,
  DelParams,
  DelKindParams,
  FindParams,
  GetParams,
  MergeParams,
  PutParams,
  PutKindParams,
  PutPermissionsParams,
  ReserveIdsParams,
  WatchParams,
  Query,
  WhereClause,
  Operation,
};
