import { ipcHandler } from '@share/lib/utils';
import type { Orientation } from '@share/structure/orientations';
import { webOSEnv } from '../lib/appEnv';
import { webFrame, ipcRenderer } from 'electron';

class AppState {
  getMouseMoveDataFast = false;
  getSensorDataOnCnt = 0;
  curInputElm: HTMLInputElement | null = null;
  preInputElms: HTMLElement[] = [];
  isActivated = true;
  isTouchMode = webOSEnv.isTouchMode;
  cursorVisibility: boolean = true;
  scrOrn: Orientation = webOSEnv.settingsConf.screenOrientation;
  curOrn: Orientation = webOSEnv.settingsConf.currentOrientation;
  isKeyboardVisible = false;
  isMainFrame = !webFrame.parent;
  screenSaver = false;

  constructor() {
    this.setEventHandler();
  }

  setEventHandler = () => {
    ipcRenderer
      .on(
        'screen-orientation-changed',
        ipcHandler((scrOrn: Orientation) => {
          this.scrOrn = scrOrn;
        })
      )
      .on(
        'current-orientation-changed',
        ipcHandler((curOrn: Orientation) => {
          this.curOrn = curOrn;
        })
      )
      .on(
        'screen-saver-toggled',
        ipcHandler((screenSaver: boolean) => {
          this.screenSaver = screenSaver;
        })
      );

    window.addEventListener('cursorStateChange', (e: any) => {
      this.cursorVisibility = e.detail.visibility;
    });
  };
}

const appState = new AppState();
export default appState;
