import type { DBBaseKey } from '@controller/dbController';
import type Store from 'electron-store';

export default class SimulatorDB {
  constructor(
    private db: Store<Record<string, unknown>>,
    private dbBaseKey: DBBaseKey
  ) {}

  get(dataPath?: string): any {
    if (dataPath) {
      return this.db.get(`${this.dbBaseKey}.${dataPath}`);
    }
    return this.db.get(`${this.dbBaseKey}`);
  }

  set(key: string, value: any) {
    const dbPath = key === '' ? this.dbBaseKey : `${this.dbBaseKey}.${key}`;
    return this.db.set(dbPath, value);
  }

  has(dataPath: string) {
    return this.db.has(`${this.dbBaseKey}.${dataPath}`);
  }

  delete(dataPath: string) {
    this.db.delete(`${this.dbBaseKey}.${dataPath}`);
  }

  getOrSet(dataPath: string, value: any) {
    if (this.has(dataPath)) return this.get(dataPath);
    this.set(dataPath, value);
    return value;
  }

  setOnDidChange({ key, handler }: { key?: string; handler: any }) {
    return this.db.onDidChange(
      key ? `${this.dbBaseKey}.${key}` : this.dbBaseKey,
      handler
    );
  }
}
