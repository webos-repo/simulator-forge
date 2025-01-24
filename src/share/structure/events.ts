import type { MovePos } from './positions';

type MouseEventType = MovePos & {
  type:
    | 'mousedown'
    | 'mouseup'
    | 'mousemove'
    | 'click'
    | 'mouseout'
    | 'mouseover';
};

type PointerEventType = MovePos & {
  type: 'pointerdown' | 'pointerup' | 'pointermove';
};

type TouchEventType = MovePos & {
  type: 'touchstart' | 'touchend' | 'touchmove';
};

type KeyEventType = 'keydown' | 'keyup' | 'keypress';
type RCUButtonEventType = 'down' | 'up' | 'click';

export type {
  MouseEventType,
  PointerEventType,
  TouchEventType,
  RCUButtonEventType,
  KeyEventType,
};
