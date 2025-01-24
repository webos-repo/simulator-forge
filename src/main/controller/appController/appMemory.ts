/* 앱에 대한 여러 데이터 관리 */
import type { AppInfo, AppInfoWithState } from '@share/structure/appInfo';
import type AppView from '@view/AppView';
import { emtApp } from '../../module/eventEmitters';
import { makeDB } from '../dbController';

const dbAppEntriesKey = 'appEntries';
const db = makeDB('internal');

class RunningApps {
  private appViews: AppView[] = [];
  private fgAppView?: AppView;
  public ornChangeRequestedApp?: AppView;

  get apps() {
    return this.appViews;
  }
  get fgApp() {
    return this.fgAppView;
  }

  setFgApp = (newApp: AppView) => {
    this.fgAppView = newApp;
  };

  resetFgApp = () => {
    this.fgAppView = undefined;
  };

  isFgApp = (args?: { appPath?: string; appId?: string }) => {
    if (!this.fgApp || !args) return false;
    const { appPath, appId } = args;
    return appPath && appId
      ? appPath === this.fgApp.appPath && appId === this.fgApp.appId
      : appPath === this.fgApp.appPath || appId === this.fgApp.appId;
  };

  add = (newApp: AppView) => {
    this.appViews.push(newApp);
  };

  reset = () => {
    this.appViews = [];
    this.fgAppView = undefined;
    this.ornChangeRequestedApp = undefined;
  };

  removeAppById = (targetAppId: string) => {
    this.appViews = this.appViews.filter(({ appId }) => appId !== targetAppId);
  };

  findById = (targetAppId: string) => {
    return this.appViews.find(({ appId }) => appId === targetAppId);
  };

  findByPath = (targetAppPath: string) => {
    return this.appViews.find(({ appPath }) => appPath === targetAppPath);
  };
}

class AppInfos {
  private appInfos: AppInfo[] = [];

  add = (appInfo: AppInfo, update = true) => {
    if (this.findByPath(appInfo.appPath)) return;
    this.appInfos.push(appInfo);
    if (update) this.update();
  };

  replace = (appInfos: AppInfo[], update = true) => {
    this.appInfos = appInfos;
    if (update) this.update();
  };

  removeByPath = (appPath: string, update = true) => {
    if (!appInfos.findByPath(appPath)) return;
    this.appInfos = this.appInfos.filter(
      (appinfo) => appinfo.appPath !== appPath
    );
    if (update) this.update();
  };

  removeById = (appId: string, update = true) => {
    if (!appInfos.findById(appId)) return;
    this.appInfos = this.appInfos.filter(({ id }) => id !== appId);
    if (update) this.update();
  };

  findByPath = (targetAppPath: string) => {
    return this.appInfos.find(({ appPath }) => appPath === targetAppPath);
  };

  findById = (targetAppId: string) => {
    return this.appInfos.find(({ id }) => id === targetAppId);
  };

  update = () => {
    this.saveToDB();
    this.broadcastAppInfo();
  };

  saveToDB = () => {
    db.set(
      dbAppEntriesKey,
      this.appInfos.map((appInfo) => appInfo.appPath)
    );
  };

  broadcastAppInfo = () => {
    const appInfoWithStateList: AppInfoWithState[] = this.appInfos.map(
      (appInfo) => {
        const target = runningApps.findByPath(appInfo.appPath);
        return {
          ...appInfo,
          appState: target ? target.state : 'notLaunched',
        };
      }
    );
    emtApp.emit('app-list-updated', JSON.stringify(appInfoWithStateList));
  };
}

const runningApps = new RunningApps();
const appInfos = new AppInfos();

export { runningApps, appInfos };
