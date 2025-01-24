import _ from 'lodash';
import LogMessage, { showErrorBox } from '../lib/logMessage';
import { ipcMain } from 'electron';
import { emtService, emtSetting, emtWindow } from '../module/eventEmitters';
import { readServiceEntry, readServiceJson } from '../lib/metaFileReader';
import JSService from '@service/JSService';
import { ipcHandler } from '@share/lib/utils';
import { makeDB } from './dbController';

type JSServiceInfos = {
  dirPath: string;
  isActive: boolean;
};

const JSServiceDBPath = 'jsServices';

class JSServiceController {
  jsServices: JSService[] = [];
  db = makeDB('internal');

  constructor() {
    this.setEventListener();
  }

  initialize = () => {
    this.loadJSServicesFromDB();
  };

  private setEventListener = () => {
    ipcMain
      .on('js-service-toggle', ipcHandler(this.toggleActivate))
      .on('js-service-screen-loaded', this.sendInitialData);

    emtService
      .on('remove-js-service-from-list', this.removeJSServicesById)
      .on('add-js-service', this.addJSServices);

    emtSetting.on('database-is-reset', this.loadJSServicesFromDB);
  };

  private sendInitialData = () => {
    const jsServiceDataList = this.jsServices.map((js) => {
      return { id: js.id, isActive: js.isActive, dirPath: js.dirPath };
    });
    emtWindow.emit('send', {
      windowName: 'jsService',
      channel: 'update-js-service-list',
      data: JSON.stringify(jsServiceDataList),
    });
  };

  private loadJSServicesFromDB = () => {
    const jsServicesFromDB: JSServiceInfos[] | undefined =
      this.db.get(JSServiceDBPath);
    if (!jsServicesFromDB) return;
    const filteredJSServices = jsServicesFromDB.filter(({ dirPath }) => {
      try {
        readServiceJson(dirPath);
        return true;
      } catch {
        return false;
      }
    });
    this.addJSServices(filteredJSServices, { isFromUser: false });
  };

  private updateJSServices = (newJSServices?: JSService[]) => {
    if (newJSServices) this.jsServices = newJSServices;

    emtWindow.emit('send', {
      windowName: 'jsService',
      channel: 'update-js-service-list',
      data: JSON.stringify(this.jsServices),
    });
    this.db.set(
      JSServiceDBPath,
      this.jsServices.map(({ dirPath, isActive }) => {
        return { dirPath, isActive };
      })
    );
  };

  getJSService = (id: string) => {
    return this.jsServices.find((jsService) => jsService.id === id);
  };

  isAdded = (serviceId: string) => {
    return !!this.jsServices.find(({ id }) => {
      return id === serviceId;
    });
  };

  private getPropFromServiceJson = (dirPath: string, prop: string) => {
    const serviceJson = readServiceJson(dirPath) as any;
    if (!_.has(serviceJson, prop)) {
      throw new LogMessage(
        'error',
        'Service add error',
        `Can not found 'services.json' in ${dirPath}`
      );
    }
    return serviceJson[prop];
  };

  private addJSServices = (
    serviceInfos: JSServiceInfos[],
    option: { isFromUser: boolean }
  ) => {
    const newJSServices: JSService[] = [];
    serviceInfos.forEach(({ dirPath, isActive }) => {
      try {
        const id = this.getPropFromServiceJson(dirPath, 'id');
        if (this.isAdded(id)) {
          throw new LogMessage(
            'info',
            'Service add error',
            'Service is already added'
          );
        }
        const entry = readServiceEntry(dirPath);
        const newJSService = new JSService(id, dirPath, entry);
        newJSServices.push(newJSService);
        if (isActive) newJSService.activate();
      } catch (e: any) {
        if (option.isFromUser) showErrorBox(e);
      }
    });
    this.updateJSServices([...this.jsServices, ...newJSServices]);
    return true;
  };

  private removeJSServicesById = (targetId: string) => {
    const newJSServices = this.jsServices.filter((jsService) => {
      const { id } = jsService;
      if (id === targetId) {
        jsService.deactivate();
        return false;
      }
      return true;
    });
    this.updateJSServices(newJSServices);
  };

  toggleActivate = (serviceId: string) => {
    this.getJSService(serviceId)?.toggleActive();
    this.updateJSServices();
  };
}

const jsServiceController = new JSServiceController();
export default jsServiceController;
export type { JSServiceInfos };
