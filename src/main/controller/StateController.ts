import { ipcHandler } from '@share/lib/utils';
import { ipcMain } from 'electron';
import _ from 'lodash';

class StateController {
  mainScreenLoaded = false;

  constructor() {
    this.setEventHandler();
  }

  private setEventHandler = () => {
    ipcMain.once(
      'main-screen-loaded',
      ipcHandler(() => this.setState('mainScreenLoaded')(true))
    );
  };

  private setState = _.curry((prop: keyof this, value: any) => {
    this[prop] = value;
  });
}

const stateController = new StateController();
export default stateController;
