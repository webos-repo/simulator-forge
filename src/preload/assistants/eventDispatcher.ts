import type {
  KeyEventType,
  MouseEventType,
  PointerEventType,
  TouchEventType,
} from '@share/structure/events';
import { ipcRenderer } from 'electron';
import { ipcHandler } from '@share/lib/utils';
import { functionRunner } from '../lib/functionRunner';
import { CustomKeyMap } from '../lib/keyHelper';

const MappingFromTouch: {
  [key: string]: [PointerEventType['type'], MouseEventType['type']];
} = {
  touchstart: ['pointerdown', 'mousedown'],
  touchend: ['pointerup', 'mouseup'],
  touchmove: ['pointermove', 'mousemove'],
};

const BasicMouseEventTypes: MouseEventType['type'][] = [
  'mousedown',
  'mouseup',
  'click',
];

export function setIpcListener() {
  ipcRenderer
    .on('invoke-event-by-touch', ipcHandler(invokeEventByTouch))
    .on('invoke-mouse-click', ipcHandler(invokeMouseClick))
    .on('invoke-webos-event', ipcHandler(invokeWebOSEvent))
    .on('invoke-custom-key', ipcHandler(invokeCustomKey));
}

function invokeCustomKey(type: KeyEventType, key: string) {
  if (!(key in CustomKeyMap)) return;
  const [vKeyTmp, vCode, vKeyCode] = CustomKeyMap[key];
  const vKey = key === 'Back' && type === 'keyup' ? 'Unidentified' : vKeyTmp;

  functionRunner(
    () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent(type, {
          key: vKey,
          code: vCode,
          keyCode: vKeyCode,
          which: vKeyCode,
          bubbles: true,
          cancelable: true,
          composed: true,
          ...(type === 'keypress' ? { charCode: vKeyCode } : {}),
        })
      );
    },
    { replace: { type, vKeyCode, vKey, vCode } }
  );
}

function invokeEventByTouch(touchEvent: TouchEventType, isShortHold: boolean) {
  const { type: touchType, x, y, movementX, movementY } = touchEvent;
  const target = document.elementFromPoint(x, y);
  if (!target) return;
  if (touchType === 'touchstart' && target instanceof HTMLInputElement) {
    target.focus();
  }
  const [pointerType, mouseType] = MappingFromTouch[touchType];
  const props = { x, y, movementX, movementY };
  invokePointer(target, { type: pointerType, ...props });
  invokeTouch(target, touchEvent);

  if (!isShortHold || mouseType !== 'mouseup') return;
  if (document.activeElement && target !== document.activeElement) {
    invokeMouse(document.activeElement, {
      type: 'mouseout',
      ...props,
    });
    invokeMouse(target, {
      type: 'mouseover',
      ...props,
    });
    setTimeout(() => {
      BasicMouseEventTypes.forEach((type) => {
        invokeMouse(target, {
          type,
          ...props,
        });
      });
    }, 100);
  } else {
    BasicMouseEventTypes.forEach((type) => {
      invokeMouse(target, {
        type,
        ...props,
      });
    });
  }
}

function invokePointer(target: Element, props: PointerEventType) {
  const pointerEvent = makePointerEvent(props);
  target.dispatchEvent(pointerEvent);
}

function invokeTouch(target: Element, props: TouchEventType) {
  const { type, x, y } = props;
  const touch = makeTouch(target, x, y);
  const touchEvent = makeTouchEvent(type, touch);
  target.dispatchEvent(touchEvent);
}

function invokeMouse(target: Element, props: MouseEventType) {
  const mouseEvent = makeMouseEvent(props);
  target.dispatchEvent(mouseEvent);
}

function invokeMouseClick({ x, y }: Pick<MouseEventType, 'x' | 'y'>) {
  const target = document.elementFromPoint(x, y);
  if (!target) return;
  invokeMouse(target, {
    type: 'click',
    x,
    y,
    movementX: 0,
    movementY: 0,
  });
}

function invokeWebOSEvent(type: string, props: any) {
  document.dispatchEvent(new CustomEvent(type, props));
}

function makePointerEvent({
  type,
  x,
  y,
  movementX,
  movementY,
}: PointerEventType) {
  return new PointerEvent(type, {
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
    movementX,
    movementY,
    pointerType: 'touch',
    pointerId: 2,
    pressure: 0.5,
    isPrimary: true,
    button: 0, // main button
    buttons: 1, // left button
    width: 50,
    height: 50,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
}

function makeTouch(target: Element, x: number, y: number, identifier = 0) {
  return new Touch({
    identifier,
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 25,
    radiusY: 25,
    rotationAngle: 0,
    force: 1.0, // Device is NaN... ??
  });
}

function makeTouchEvent(touchType: string, touch: Touch) {
  return new TouchEvent(touchType, {
    bubbles: true,
    cancelable: true,
    composed: true,
    touches: touchType === 'touchend' ? [] : [touch],
    targetTouches: touchType === 'touchend' ? [] : [touch],
    changedTouches: [touch],
  });
}

function makeMouseEvent({ type, x, y, movementX, movementY }: MouseEventType) {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
    movementX,
    movementY,
    button: 0, // main button
    buttons: 1, // left button
    bubbles: true,
    cancelable: true,
    composed: true,
  });
}
