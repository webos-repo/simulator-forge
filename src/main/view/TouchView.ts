import { runningApps } from '@controller/appController/appMemory';
import { checkMacViewPositionBug } from '@main/lib/bugVersionChecker';
import { constStore } from '@share/store/constStore';
import type { MouseEventType, TouchEventType } from '@share/structure/events';
import type { Direction, Orientation2Way } from '@share/structure/orientations';
import type { Pos } from '@share/structure/positions';
import { BrowserView, ipcMain } from 'electron';
import windowSetting from '@settings/windowSetting';
import { resolveHtmlPath } from '../lib/pathResolver';
import {
  emtApp,
  emtDev,
  emtSetting,
  emtView,
  emtWindow,
} from '../module/eventEmitters';
import overlayController from '@controller/OverlayController';
import { ipcHandler } from '@share/lib/utils';
import type { AppInfoJson } from '@share/structure/appInfo';

type MatchedMouseType = Extract<
  MouseEventType['type'],
  'mousedown' | 'mouseup' | 'mousemove'
>;

type VirtualTouch = NonNullable<AppInfoJson['virtualTouch']>;
type SupportTouchMode = NonNullable<AppInfoJson['supportTouchMode']>;

const MouseToTouch: {
  [key in MatchedMouseType]: TouchEventType['type'];
} = {
  mousedown: 'touchstart',
  mouseup: 'touchend',
  mousemove: 'touchmove',
};
const DefaultVirtualTouch: Required<VirtualTouch> = {
  verticalThreshold: 40,
  horizontalThreshold: 40,
  positionEventOnPress: false,
  shortTouchThreshold: 10,
};
const ShortHoldThreshold = 200;
const EdgeSwipeThreshold = 40;
const FullWheelThreshold = 30;

const calcMouseEventWithZoomFactor = (
  mouseEvent: MouseEventType,
  zoomFactor: number
): MouseEventType => {
  const { x, y, movementX, movementY } = mouseEvent;
  return {
    type: mouseEvent.type,
    x: Math.round(x / zoomFactor),
    y: Math.round(y / zoomFactor),
    movementX: Math.round(movementX / zoomFactor),
    movementY: Math.round(movementY / zoomFactor),
  };
};

const checkPressHoldThreshold = (start: number, end: number) => {
  return start >= 0 && end - start <= ShortHoldThreshold;
};

const reqInvokeMouseEvent = (mouseEvent: MouseEventType | MouseEventType[]) => {
  if (!runningApps.fgApp) return;
  if (Array.isArray(mouseEvent)) {
    mouseEvent.forEach(runningApps.fgApp.sendMouseEvent);
  } else {
    runningApps.fgApp.sendMouseEvent(mouseEvent);
  }
};

const convertMouseToTouch = (
  mouseEvent: MouseEventType
): TouchEventType | undefined => {
  if (!Object.keys(MouseToTouch).includes(mouseEvent.type)) return undefined;
  return {
    ...mouseEvent,
    type: MouseToTouch[mouseEvent.type as MatchedMouseType],
  };
};

const convertWithinRange = (cur: number, min: number, max: number) =>
  cur < min ? min : cur > max ? max : cur;

const checkOverThreshold = (
  p1: MouseEventType,
  p2: MouseEventType,
  threshold: number
) => calcPointerDist(p1.x, p1.y, p2.x, p2.y) > threshold ** 2;

const calcPointerDist = (x1: number, y1: number, x2: number, y2: number) =>
  (x1 - x2) ** 2 + (y1 - y2) ** 2;

const checkWhichOverThreshold = ({
  p1,
  p2,
  thresholdX,
  thresholdY,
}: {
  p1: Pos;
  p2: Pos;
  thresholdX: number;
  thresholdY: number;
}) => {
  if (Math.abs(p1.x - p2.x) > thresholdX) return 'x';
  if (Math.abs(p1.y - p2.y) > thresholdY) return 'y';
  return null;
};

class TouchView extends BrowserView {
  name = 'TouchView';
  private supportTouchMode: SupportTouchMode = 'none';
  private virtualTouch: Required<VirtualTouch> = DefaultVirtualTouch;
  private fullDownTime = 0;
  private isPseudoSwiping = false;
  private pseudoDownBackup?: MouseEventType;
  private pseudoHoldTimer?: NodeJS.Timeout;
  private swipeBeforeX = -1;
  private swipeBeforeY = -1;
  private edgeDirection: Direction[] = [];
  private edgeDownBackup?: MouseEventType;
  private edgeSwiping = false;
  private preventEvent = false;
  private isByLeave = false;
  private edgeMinX!: number;
  private edgeMaxX!: number;
  private edgeMinY!: number;
  private edgeMaxY!: number;
  private halfX!: number;
  private halfY!: number;
  private fullDownPos?: { x: number; y: number };
  private fullWheelDirFactor?: { x: boolean; y: boolean };
  private isFullWheeling = false;
  private removeCallbackHandler?: NodeJS.Timeout;

  constructor() {
    super({
      webPreferences: {
        zoomFactor: windowSetting.zoom,
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    this.webContents.loadURL(resolveHtmlPath('index.html', 'touch'));
    this.calcXYByOrn(windowSetting.orn2Way);
    this.preventWhiteScreen();
    this.setEventHandler();
  }

  private setEventHandler = () => {
    ipcMain
      .on('touch-screen-mouse-event', ipcHandler(this.handleTouchScreenEvent))
      .on('touch-screen-mouse-leave-event', () => {
        this.isByLeave = true;
      })
      .on('req-edge-data', this.sendEdgeData);

    emtApp.on('fg-app-changed', () => {});

    emtWindow.on('main-window-orientation-changed', this.changeOrientation);

    emtSetting.on('change-zoomFactor', () => {
      this.webContents.zoomFactor = windowSetting.zoom;
    });

    emtDev.on('open-devtools-touch', () =>
      this.webContents.openDevTools({ mode: 'detach' })
    );
  };

  private preventWhiteScreen = () => {
    const callback = (view: any) => {
      if (view !== this) return;
      this.removeCallbackHandler = setTimeout(() => {
        emtWindow.emit('remove-view', this);
        this.removeCallbackHandler = undefined;
      }, 1000);
      emtView.removeListener('view-added', callback);
    };
    emtView.on('view-added', callback);
    setTimeout(() => {
      emtWindow.emit('add-view', this);
      this.resetSize(2, 1);
    }, 500);
  };

  preset = () => {
    if (this.removeCallbackHandler) clearTimeout(this.removeCallbackHandler);
    this.readTouchOption();
    this.resetSize();
    runningApps.fgApp?.hideCursor();
    // this.webContents.openDevTools({ mode: 'detach' });
  };

  private resetSize = (
    width = windowSetting.size.width,
    height = windowSetting.size.height
  ) => {
    this.setAutoResize({ width: true, height: true });
    this.setBounds({
      x: 0,
      y: checkMacViewPositionBug() ? constStore.getMainWindowYDiff() : 0,
      width: width - 1,
      height,
    });
  };

  private changeOrientation = (orn: Orientation2Way) => {
    this.calcXYByOrn(orn);
    this.resetSize();
    this.sendEdgeData();
  };

  private calcXYByOrn = (orn: Orientation2Way) => {
    const { width, height } = windowSetting.baseSize;
    this.edgeMinX = orn === 'landscape' ? 30 : 20;
    this.edgeMaxX = width - this.edgeMinX;
    this.edgeMinY = orn === 'landscape' ? 20 : 30;
    this.edgeMaxY = height - this.edgeMinY;
    this.halfX = width / 2;
    this.halfY = height / 2;
  };

  private readTouchOption = () => {
    if (!runningApps.fgApp) return;
    const { supportTouchMode, virtualTouch } = runningApps.fgApp.appInfo;
    this.supportTouchMode = supportTouchMode || 'none';
    this.setVirtualTouch(virtualTouch);
  };

  private setVirtualTouch = (newVirtualTouch?: VirtualTouch) => {
    const {
      verticalThreshold,
      horizontalThreshold,
      positionEventOnPress,
      shortTouchThreshold,
    } = {
      ...DefaultVirtualTouch,
      ...newVirtualTouch,
    };
    this.virtualTouch = {
      verticalThreshold: convertWithinRange(verticalThreshold, 10, 100),
      horizontalThreshold: convertWithinRange(horizontalThreshold, 10, 100),
      positionEventOnPress,
      shortTouchThreshold: convertWithinRange(shortTouchThreshold, 10, 50),
    };
  };

  private handleTouchScreenEvent = (
    mouseEvent: MouseEventType,
    timeStamp: number,
    passEdge = false
  ) => {
    if (!runningApps.fgApp) return;
    if (this.preventEvent) {
      if (mouseEvent.type === 'mouseup') {
        this.preventEvent = false;
        if (!this.isByLeave) {
          overlayController.hideTopOverlay();
        }
        this.isByLeave = false;
      }
      return;
    }

    if (!passEdge && this.checkEdgeSwipe(mouseEvent, timeStamp)) {
      return;
    }

    if (mouseEvent.type === 'mousedown' && overlayController.isAnyShowing()) {
      this.preventEvent = true;
      return;
    }

    if (mouseEvent.type === 'mouseup') {
      this.isByLeave = false;
    }

    const touchHandler = this.getTouchHandler(this.supportTouchMode);
    if (!touchHandler) return;

    runningApps.fgApp.webContents.focus();
    touchHandler(mouseEvent, timeStamp);
  };

  private checkEdgeSwipe = (
    mouseEvent: MouseEventType,
    timeStamp: number
  ): boolean => {
    const { type } = mouseEvent;
    if (type === 'mousedown') return this.edgeSwipeDown(mouseEvent);
    if (type === 'mousemove') return this.edgeSwipeMove(mouseEvent);
    if (type === 'mouseup') return this.edgeSwipeUp(mouseEvent, timeStamp);
    throw new Error(`Can not handle ${type} type event`);
  };

  private edgeSwipeDown = (mouseEvent: MouseEventType) => {
    const { x, y } = mouseEvent;
    if (x <= this.edgeMinX) this.edgeDirection.push('Left');
    else if (x >= this.edgeMaxX) this.edgeDirection.push('Right');
    if (y <= this.edgeMinY) this.edgeDirection.push('Up');
    else if (y >= this.edgeMaxY) this.edgeDirection.push('Down');

    if (this.edgeDirection.length) {
      this.edgeDownBackup = mouseEvent;
      return true;
    }
    return false;
  };

  private edgeSwipeMove = (mouseEvent: MouseEventType) => {
    const { x, y } = mouseEvent;
    if (this.edgeSwiping) return true;
    if (!this.edgeDownBackup) return false;

    const { x: bx, y: by } = this.edgeDownBackup;
    let isEdgeSwipe = false;
    let direction: Direction | undefined;

    this.edgeDirection.some((dir: Direction) => {
      if (dir === 'Left') isEdgeSwipe = bx < x && x - bx > EdgeSwipeThreshold;
      else if (dir === 'Right')
        isEdgeSwipe = x < bx && bx - x > EdgeSwipeThreshold;
      else if (dir === 'Up')
        isEdgeSwipe = by < y && y - by > EdgeSwipeThreshold;
      else if (dir === 'Down')
        isEdgeSwipe = y < by && by - y > EdgeSwipeThreshold;

      if (isEdgeSwipe) {
        direction = dir;
        return true;
      }
      return false;
    });

    if (isEdgeSwipe && direction) {
      this.edgeSwiping = true;
      this.edgeDownBackup = undefined;
      this.edgeDirection = [];
      this.invokeEdgeSwipe(direction, { x: bx, y: by });
    }
    return true;
  };

  private edgeSwipeUp = (mouseEvent: MouseEventType, timeStamp: number) => {
    if (this.edgeSwiping) {
      // end of edge swipe
      this.edgeSwiping = false;
      return true;
    }
    if (this.edgeDownBackup) {
      // If pointer up without satisfying swipe distance
      this.handleTouchScreenEvent(this.edgeDownBackup, timeStamp, true);
      this.handleTouchScreenEvent(mouseEvent, timeStamp, true);
      this.edgeDownBackup = undefined;
      this.edgeDirection = [];
      return true;
    }
    return false;
  };

  private invokeEdgeSwipe = (
    direction: Direction,
    position: { x: number; y: number }
  ) => {
    switch (direction) {
      case 'Left':
        emtApp.emit('rcu-back');
        break;
      case 'Right':
        overlayController.showTouchRemote(position);
        break;
      case 'Up':
        // show volume control panel
        break;
      case 'Down':
        emtApp.emit('call-home');
        break;
      default:
    }
  };

  private getTouchHandler = (supportTouchMode: SupportTouchMode) => {
    switch (supportTouchMode) {
      case 'full':
        return this.fullTouch;
      case 'virtual':
        return this.pseudoTouch;
      case 'none':
        return this.noneTouch;
      default:
        return undefined;
    }
  };

  private fullTouch = (mouseEvent: MouseEventType, timeStamp: number) => {
    if (!runningApps.fgApp) return;

    const mouseEventCalc = calcMouseEventWithZoomFactor(
      mouseEvent,
      runningApps.fgApp.webContents.zoomFactor / this.webContents.zoomFactor
    );

    const { type: mouseType } = mouseEventCalc;
    let isShortHold = false;

    switch (mouseType) {
      case 'mousedown':
        this.fullDownTime = timeStamp;
        this.fullDownPos = { x: mouseEvent.x, y: mouseEvent.y };
        this.fullWheelDirFactor = undefined;
        break;
      case 'mouseup':
        this.fullDownPos = undefined;
        this.isFullWheeling = false;
        if (checkPressHoldThreshold(this.fullDownTime, timeStamp)) {
          this.fullDownTime = 0;
          isShortHold = true;
        }
        break;
      case 'mousemove':
        this.invokeWheel(mouseEvent);
        break;
      case 'click':
        return;
      default:
    }

    runningApps.fgApp.hideCursor();
    runningApps.fgApp.invokeEventsByTouch(
      convertMouseToTouch(mouseEventCalc)!,
      isShortHold
    );
  };

  private invokeWheel = (mouseMoveEvent: MouseEventType) => {
    if (!this.fullDownPos) return;
    if (!this.isFullWheeling) {
      const whichOver = checkWhichOverThreshold({
        p1: this.fullDownPos,
        p2: { x: mouseMoveEvent.x, y: mouseMoveEvent.y },
        thresholdX: FullWheelThreshold,
        thresholdY: FullWheelThreshold,
      });
      if (!whichOver) return;

      this.isFullWheeling = true;
      this.fullWheelDirFactor = {
        x: whichOver === 'x',
        y: whichOver === 'y',
      };
    }
    emtApp.emit('invoke-wheel', {
      ...this.fullDownPos,
      movementX: this.fullWheelDirFactor?.x ? mouseMoveEvent.movementX : 0,
      movementY: this.fullWheelDirFactor?.y ? mouseMoveEvent.movementY : 0,
    });
  };

  private pseudoTouch = (mouseEvent: MouseEventType, _timeStamp: number) => {
    if (!runningApps.fgApp) return;

    const { type: mouseType } = mouseEvent;

    switch (mouseType) {
      case 'mousedown':
        this.pseudoTouchStart(mouseEvent);
        break;

      case 'mouseup':
        this.pseudoTouchEnd(mouseEvent);
        break;

      case 'mousemove':
        this.pseudoTouchMove(mouseEvent);
        break;

      default:
    }
  };

  private pseudoTouchStart = (mouseEvent: MouseEventType) => {
    this.pseudoDownBackup = mouseEvent;
    if (this.virtualTouch.positionEventOnPress) {
      reqInvokeMouseEvent(mouseEvent);
    }
    this.pseudoHoldTimer = setTimeout(() => {
      this.resetPseudoHoldTimer();
      if (!this.virtualTouch.positionEventOnPress) {
        reqInvokeMouseEvent(mouseEvent);
      }
    }, ShortHoldThreshold);
  };

  private pseudoTouchEnd = (mouseEvent: MouseEventType) => {
    if (this.isPseudoSwiping) {
      this.isPseudoSwiping = false;
      return;
    }

    if (!runningApps.fgApp) return;
    const mouseClickEvent = calcMouseEventWithZoomFactor(
      { ...mouseEvent, type: 'click' },
      runningApps.fgApp.webContents.zoomFactor
    );

    if (!this.pseudoHoldTimer || !this.pseudoDownBackup) {
      reqInvokeMouseEvent([mouseEvent, mouseClickEvent]);
      return;
    }
    this.resetPseudoHoldTimer();

    if (
      checkOverThreshold(
        this.pseudoDownBackup,
        mouseEvent,
        this.virtualTouch.shortTouchThreshold
      )
    ) {
      return;
    }

    if (this.virtualTouch.positionEventOnPress) {
      reqInvokeMouseEvent([mouseEvent, mouseClickEvent]);
      return;
    }
    reqInvokeMouseEvent([this.pseudoDownBackup, mouseEvent, mouseClickEvent]);
  };

  private pseudoTouchMove = (mouseEvent: MouseEventType) => {
    if (this.isPseudoSwiping) {
      this.handleSwipe(mouseEvent);
      return;
    }

    if (!this.pseudoHoldTimer || !this.pseudoDownBackup) {
      reqInvokeMouseEvent(mouseEvent);
      return;
    }

    if (
      !checkWhichOverThreshold({
        p1: this.pseudoDownBackup,
        p2: mouseEvent,
        thresholdX: this.virtualTouch.horizontalThreshold,
        thresholdY: this.virtualTouch.verticalThreshold,
      })
    ) {
      return;
    }

    this.isPseudoSwiping = true;
    this.resetPseudoHoldTimer();
    this.swipeBeforeX = this.pseudoDownBackup.x;
    this.swipeBeforeY = this.pseudoDownBackup.y;
    this.handleSwipe(mouseEvent);
  };

  private handleSwipe = (curPoint: MouseEventType) => {
    if (!this.pseudoDownBackup) return;

    const { x, y } = curPoint;
    const [bx, by] = [
      Math.abs(x - this.pseudoDownBackup.x),
      Math.abs(y - this.pseudoDownBackup.y),
    ];
    const [dx, dy] = [x - this.swipeBeforeX, y - this.swipeBeforeY];

    const direction = this.findSwipeDirection(bx, by, dx, dy);
    if (!direction) return;

    if (direction === 'Left' || direction === 'Right') this.swipeBeforeX = x;
    else this.swipeBeforeY = y;

    runningApps.fgApp?.sendSwipeEvent(direction);
  };

  private findSwipeDirection = (
    bx: number,
    by: number,
    dx: number,
    dy: number
  ): Direction | undefined => {
    const [absX, absY] = [Math.abs(dx), Math.abs(dy)];
    const { horizontalThreshold, verticalThreshold } = this.virtualTouch;

    if (bx > by) {
      if (absX > horizontalThreshold) return dx > 0 ? 'Left' : 'Right';
      if (absY > verticalThreshold) return dy > 0 ? 'Up' : 'Down';
    } else {
      if (absY > verticalThreshold) return dy > 0 ? 'Up' : 'Down';
      if (absX > horizontalThreshold) return dx > 0 ? 'Left' : 'Right';
    }
    return undefined;
  };

  private resetPseudoHoldTimer = () => {
    if (!this.pseudoHoldTimer) return;
    clearTimeout(this.pseudoHoldTimer);
    this.pseudoHoldTimer = undefined;
  };

  private noneTouch = (mouseEvent: MouseEventType, _timeStamp: number) => {
    if (!runningApps.fgApp || mouseEvent.type !== 'mouseup') return;
    const { x, y } = mouseEvent;
    overlayController.showTouchRemote({ x, y });
  };

  private sendEdgeData = () => {
    this.webContents.send('edge-data', {
      minX: this.edgeMinX,
      maxX: this.edgeMaxX,
      minY: this.edgeMinY,
      maxY: this.edgeMaxY,
    });
  };
}

export default TouchView;
