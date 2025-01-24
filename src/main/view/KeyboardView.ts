import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { constStore } from '@share/store/constStore';
import type { RCUButtonEventType } from '@share/structure/events';
import type { Orientation2Way } from '@share/structure/orientations';
import _ from 'lodash';
import OverlayView from '@view/OverlayView';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import { emtDev, emtSetting, emtWindow } from '../module/eventEmitters';
import { VKBPriorityKeys } from '../lib/keyManager';

const KeyboardHeightRatio: {
  [key in Orientation2Way]: { [key2 in 'default' | 'number']: number };
} = {
  landscape: {
    default: 0.38,
    number: 0.1,
  },
  portrait: {
    default: 0.17,
    number: 0.05,
  },
};

const getKeyboardHeightRatio = (inputType: string, orn: Orientation2Way) => {
  const inputTypeFiltered =
    inputType === 'number' || inputType === 'tel' ? 'number' : 'default';
  return KeyboardHeightRatio[orn][inputTypeFiltered];
};

const getKeyboardHeight = (
  baseHeight: number,
  inputType: string,
  orn: Orientation2Way
) => {
  return _.toInteger(baseHeight * getKeyboardHeightRatio(inputType, orn));
};

class KeyboardView extends OverlayView {
  name = 'KeyboardView';
  isShowing = false;
  orn: Orientation2Way = 'landscape';
  vkbType: string;

  constructor(vkbType: 'default' | 'number') {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    this.vkbType = vkbType;

    this.webContents.loadURL(
      resolveHtmlPath('index.html', `keyboard/${vkbType}/${this.orn}`)
    );
    this.setEventHandler();
  }

  setEventHandler = () => {
    this.webContents.on('did-finish-load', () => {
      this.webContents.send('reloaded', this.orn);
    });

    emtWindow.on('main-window-orientation-changed', this.changeOrientation);

    emtSetting.on('change-zoomFactor', this.changeZoomFactor);

    emtDev.on(`open-devtools-vkb-${this.vkbType}`, () =>
      this.webContents.openDevTools({ mode: 'detach' })
    );
  };

  show = () => {
    const { width, height } = windowSetting.size;
    const keyboardHeight = getKeyboardHeight(height, this.vkbType, this.orn);
    this.setBounds({
      x: 0,
      y:
        (checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0) +
        height -
        keyboardHeight,
      width,
      height: keyboardHeight,
    });
    this.setAutoResize({ width: true, height: true });
    this.isShowing = true;
    // this.webContents.openDevTools({ mode: 'detach' });
  };

  hide = () => {
    this.isShowing = false;
    this.webContents.send('be-hidden');
    this.webContents.closeDevTools();
  };

  changeOrientation = (orn: Orientation2Way) => {
    this.orn = orn;
    if (this.isShowing) this.show();
    this.webContents.send('window-orientation-changed', orn);
  };

  handleRCUInput = (keyCode: string, eventType: RCUButtonEventType) => {
    if (eventType === 'down' || !_.includes(VKBPriorityKeys, keyCode)) return;
    this.webContents.send('rcu-pressed', keyCode);
  };

  changeZoomFactor = () => {
    this.webContents.zoomFactor = windowSetting.zoom;
    if (this.isShowing) this.show();
  };
}

export default KeyboardView;
