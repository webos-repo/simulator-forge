import { ipcMain } from 'electron';
import TouchView from '@view/TouchView';
import {
  emtApp,
  emtSetting,
  emtView,
  emtWindow,
} from '../module/eventEmitters';
import { runningApps } from './appController/appMemory';

let isTouchViewSet = false;
let touchView!: TouchView;

ipcMain.once('main-screen-loaded', initialize);
emtView
  .on('set-touch-view', setTouchView)
  .on('unset-touch-view', unsetTouchView);
emtSetting.on('touch-mode-changed', handleTouchModeChanged);

function initialize() {
  touchView = new TouchView();
}

function setTouchView() {
  if (isTouchViewSet || !runningApps.fgApp) return;
  emtApp.emit('send-to-fg-app', {
    channel: 'touch-mode-toggled',
    args: [true],
  });
  emtWindow.emit('add-view', touchView);
  touchView.preset();
  isTouchViewSet = true;
}

function unsetTouchView() {
  if (!isTouchViewSet) return;
  emtApp.emit('send-to-fg-app', {
    channel: 'touch-mode-toggled',
    args: [false],
  });
  emtWindow.emit('remove-view', touchView);
  isTouchViewSet = false;
}

function handleTouchModeChanged(touchMode: boolean) {
  if (touchMode) setTouchView();
  else unsetTouchView();
}
