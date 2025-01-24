import { ipcMain } from 'electron';
import _ from 'lodash';
import {
  emtApp,
  emtSetting,
  emtView,
  emtWindow,
} from '../module/eventEmitters';
import { ipcHandler } from '@share/lib/utils';
import VKBController from './VKBController';
import AppExitView from '@view/AppExitView';
import TouchRemoteView from '@view/TouchRemoteView';
import ScreenSaverView from '@view/ScreenSaverView';
import type OverlayView from '@view/OverlayView';
import type KeyboardView from '@view/KeyboardView';

export type OverlayViewNames =
  | 'touchRemote'
  | 'appExit'
  | 'vkbDefault'
  | 'vkbNumber'
  | 'screenSaver';

let canVBKShow = true;

const setVKBShowThrottle = () => {
  canVBKShow = false;
  setTimeout(() => {
    canVBKShow = true;
  }, 100);
};

class OverlayController {
  private allOverlays!: OverlayView[];
  private showingOverlays: OverlayView[] = [];
  private vkbController!: VKBController;
  private touchRemoteView!: TouchRemoteView;
  private appExitView!: AppExitView;
  private screenSaverView!: ScreenSaverView;
  private overlayViewMap!: {
    [key in OverlayViewNames]: OverlayView;
  };

  constructor() {
    this.setEventHandler();
  }

  initialize = () => {
    this.vkbController = new VKBController();
    this.appExitView = new AppExitView();
    this.touchRemoteView = new TouchRemoteView();
    this.screenSaverView = new ScreenSaverView();
    this.allOverlays = [
      this.touchRemoteView,
      this.appExitView,
      this.vkbController.getVKB('default')!,
      this.vkbController.getVKB('number')!,
      this.screenSaverView,
    ];
    this.overlayViewMap = {
      touchRemote: this.touchRemoteView,
      appExit: this.appExitView,
      vkbDefault: this.vkbController.getVKB('default')!,
      vkbNumber: this.vkbController.getVKB('number')!,
      screenSaver: this.screenSaverView,
    };
  };

  private setEventHandler = () => {
    ipcMain
      .once('main-screen-loaded', this.handleMainScreenLoaded)
      .on('app-view-clicked', this.hideTopOverlay)
      .on('app-exit-cancel', this.hideExit)
      .on('input-focused', ipcHandler(this.showVKB))
      .on('input-blurred', ipcHandler(this.handleInputBlurred))
      .on('req-vkb-hide', () => this.hideVKB(this.getShowingVKB()));

    emtView.on('view-added', this.handleViewAdded);
  };

  private handleMainScreenLoaded = () => {
    this.allOverlays.forEach((overlayView) => {
      this.preventWhiteScreen(overlayView);
    });
  };

  private handleViewAdded = (_view: any, isOverlay: boolean) => {
    if (isOverlay) return;
    this.hideAllOverlay();
  };

  private handleInputBlurred = (inputType: string) => {
    this.hideVKB(this.vkbController.getVKB(inputType));
  };

  private preventWhiteScreen = (overlayView: OverlayView) => {
    const callback = (view: any) => {
      if (view === overlayView) {
        overlayView.removeCallbackHandler = setTimeout(() => {
          emtWindow.emit('remove-view', overlayView);
          overlayView.removeCallbackHandler = undefined;
        }, 1000);
        emtView.removeListener('view-added', callback);
      }
    };
    emtView.on('view-added', callback);
    setTimeout(() => {
      emtWindow.emit('add-view', overlayView);
      overlayView.setAutoResize({ width: true, height: true });
      overlayView.setBounds({ x: 0, y: 0, width: 1, height: 1 });
    }, 500);
  };

  private checkShowing = (view: OverlayView) => {
    return view.isShowing && this.showingOverlays.includes(view);
  };

  checkShowingByName = (viewName: OverlayViewNames) => {
    return this.checkShowing(this.overlayViewMap[viewName]);
  };

  getOverlayByName = (name: string) => {
    if (!(name in this.overlayViewMap)) return null;
    return this.overlayViewMap[name as OverlayViewNames];
  };

  getShowingVKB = () => {
    return this.showingOverlays.find(
      (view) => view.isShowing && view.name === 'KeyboardView'
    ) as KeyboardView | undefined;
  };

  private show = (view: OverlayView, data?: any) => {
    if (view.removeCallbackHandler) {
      clearTimeout(view.removeCallbackHandler);
      view.removeCallbackHandler = undefined;
    } else {
      emtWindow.emit('add-view', view, true);
    }
    view.show(data);
    if (!this.showingOverlays.includes(view)) this.showingOverlays.push(view);
  };

  showTouchRemote = (data?: any) => {
    if (this.checkShowing(this.touchRemoteView)) return false;
    this.show(this.touchRemoteView!, data);
    return true;
  };

  showExit = () => {
    if (this.checkShowing(this.appExitView)) return false;
    this.hideAnyVKB();
    this.show(this.appExitView!);
    return true;
  };

  showVKB = (inputType: string) => {
    if (!canVBKShow) return false;
    if (this.checkShowing(this.appExitView)) {
      this.hideExit();
      return false;
    }
    const vkb = this.vkbController.getVKB(inputType);
    if (!vkb || this.checkShowing(vkb)) return false;
    this.vkbController.getOtherVKBs(inputType).forEach((v) => {
      this.hideVKB(v);
    });
    setVKBShowThrottle();
    this.show(vkb);
    emtApp.emit('vkb-state-changed', true);
    return true;
  };

  showScreenSaver = () => {
    this.show(this.screenSaverView);
    emtSetting.emit('screen-saver-state-changed', true);
  };

  private hide = (view: OverlayView) => {
    if (!this.checkShowing(view)) return false;
    emtWindow.emit('remove-view', view);
    view.hide();
    _.remove(this.showingOverlays, view);
    return true;
  };

  hideTouchRemote = () => {
    return this.hide(this.touchRemoteView);
  };

  hideExit = () => {
    return this.hide(this.appExitView);
  };

  hideVKB = (vkb: KeyboardView | undefined) => {
    if (!vkb || !this.checkShowing(vkb)) return false;
    this.hide(vkb);
    emtApp.emit('vkb-state-changed', false);
    return true;
  };

  hideScreenSaver = () => {
    this.hide(this.screenSaverView);
    emtSetting.emit('screen-saver-state-changed', false);
  };

  hideAnyVKB = () => {
    return this.hideVKB(this.getShowingVKB());
  };

  hideAllOverlay = () => {
    this.hideTouchRemote();
    this.hideExit();
    this.hideAnyVKB();
    this.hideScreenSaver();
  };

  hideTopOverlay = () => {
    return this.hideTouchRemote() || this.hideExit() || this.hideAnyVKB();
  };

  hideOverlayByBack = () => {
    return this.hideExit() || this.hideAnyVKB();
  };

  isAnyShowing = () => {
    return this.showingOverlays.length > 0;
  };
}

const overlayController = new OverlayController();
export default overlayController;
