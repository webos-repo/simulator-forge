import _ from 'lodash';

const InputTypesNeedVkb = [
  'email',
  'text',
  'password',
  'search',
  'url',
  'tel',
  'number',
] as const;

export const NotPreventKeys = [
  'Enter',
  'Red',
  'Green',
  'Yellow',
  'Blue',
  'ArrowRight',
  'ArrowLeft',
  'Unidentified',
];

export const CustomKeyMap: Readonly<{
  [key: string]: [key: string, code: string, keyCode: number];
}> = {
  Red: ['Unidentified', '', 403],
  Green: ['Unidentified', '', 404],
  Yellow: ['Unidentified', '', 405],
  Blue: ['Unidentified', '', 406],
  Back: ['GoBack', '', 461],
  Play: ['Unidentified', '', 415],
  Pause: [String.fromCharCode(0x85), 'Pause', 19],
  Stop: ['Unidentified', '', 413],
  Forward: ['Unidentified', '', 417],
  Backward: ['Unidentified', '', 412],
};

export function convertInputToKeyboardType(inputType: string) {
  switch (inputType) {
    case 'number':
    case 'tel':
      return 'number';
    case 'email':
    case 'text':
    case 'password':
    case 'search':
    case 'url':
      return 'default';
    default:
  }
  return '';
}

export function checkElementNeedVKB(target: EventTarget | null) {
  return (
    !target ||
    !(target instanceof HTMLInputElement) ||
    !target.type ||
    !_.includes(InputTypesNeedVkb, target.type)
  );
}
