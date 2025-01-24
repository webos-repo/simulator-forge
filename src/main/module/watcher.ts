import chokidar from 'chokidar';
import { emtApp, emtSetting } from './eventEmitters';
import { IsAutoReloadOn } from '@settings/autoReload';

const WatchingEvents = ['add', 'change', 'unlink'];
let isDuplication = false;
let isAutoReloadCache = false;

const preventDuplication = () => {
  if (isDuplication) return false;
  isDuplication = true;
  setTimeout(() => {
    isDuplication = false;
  }, 1000);
  return true;
};

const setWatcherEventHandler = (watcher: chokidar.FSWatcher, appId: string) => {
  watcher.on('all', (event: string, filePath: string) => {
    if (isAutoReloadCache && WatchingEvents.indexOf(event)) {
      if (preventDuplication()) {
        if (filePath.endsWith('appinfo.json')) {
          emtApp.emit('watcher-app-modified-appinfo', appId);
        } else {
          emtApp.emit('watcher-app-modified', appId);
        }
      }
    }
  });
};

class WatcherManger {
  constructor() {
    isAutoReloadCache = IsAutoReloadOn();
    emtSetting.on('auto-reload-toggled', (isAutoReload) => {
      isAutoReloadCache = isAutoReload;
    });
  }

  getWatcher = (dir: string, appId: string): chokidar.FSWatcher => {
    const watcher = chokidar.watch(dir, {
      ignoreInitial: true,
    });
    setWatcherEventHandler(watcher, appId);
    return watcher;
  };
}

const watcherManger = new WatcherManger();
export default watcherManger;
