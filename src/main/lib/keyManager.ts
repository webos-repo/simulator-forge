import _ from 'lodash';

export const VKBPriorityKeys = [
  'Enter',
  'ArrowUp',
  'ArrowDown',
  'ArrowRight',
  'ArrowLeft',
] as const;

const KeysRequirePress = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Enter',
] as const;

const KeyMap = {
  ArrowRight: 'Right',
  ArrowLeft: 'Left',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  Enter: '\u000d',
} as const;

const KeyEventTypeMap = {
  keydown: 'keyDown',
  keyup: 'keyUp',
  keypress: 'char',
} as const;

const CustomKey = [
  'Back',
  'Red',
  'Green',
  'Yellow',
  'Blue',
  'Play',
  'Pause',
  'Stop',
  'Forward',
  'Backward',
] as const;

export function isRequirePress(keyCode: string) {
  return _.includes(KeysRequirePress, keyCode);
}

export function convertKey(keyCode: string) {
  return _.get(KeyMap, keyCode, keyCode);
}

export function convertKeyType(type: keyof typeof KeyEventTypeMap) {
  return KeyEventTypeMap[type];
}

export function isCustomKey(keyCode: string) {
  return _.includes(CustomKey, keyCode);
}
