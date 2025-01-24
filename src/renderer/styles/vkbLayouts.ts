export const vkbDisplay = {
  '{bksp}': '⌫',
  '{enter}': 'Enter',
  '{symbol}': '$%^',
  '{symbol_num}': '* + /',
  '{shift}': '⇧',
  '{space}': 'Space',
  '{clearall}': 'Clear All',
  '{option}': '...',
  '{none}': ' ',
  '{voice}': 'Voice',
  '{aa}': 'Àà',
  '{eng}': 'ENG',
  '{arrowleft}': '◁',
  '{arrowright}': '▷',
  '{blank}': ' ',
  '{abc}': 'ABC',
};

export const defaultVKBLayout = {
  default: [
    '{eng} 1 2 3 4 5 6 7 8 9 0 {bksp}',
    '{symbol} q w e r t y u i o p {enter}',
    '{aa} a s d f g h j k l ? {voice}',
    '{shift} @ z x c v b n m , . {clearall}',
    '{none} {space} {arrowleft} {arrowright}',
  ],
  shift: [
    '{eng} 1 2 3 4 5 6 7 8 9 0 {bksp}',
    '{symbol} Q W E R T Y U I O P {enter}',
    '{aa} A S D F G H J K L ? {voice}',
    '{shift} @ Z X C V B N M , . {clearall}',
    '{none} {space} {arrowleft} {arrowright}',
  ],
  symbol: [
    '{eng} ! @ # $ % ^ & * ( ) {bksp}',
    '{abc} - _ = + \\ | [ ] { } {enter}',
    '{aa} ; : \' " , . < > / ? {voice}',
    '{blank} ₩ € £ ¥ § ¿ ` ~   {clearall}',
    '{none} {space} {arrowleft} {arrowright}',
  ],
};

export const numberVKBLayout = {
  default: ['{symbol_num} 1 2 3 4 5 6 7 8 9 0 {bksp} {enter}'],
  shift: ['{symbol_num} 1 2 3 4 5 6 7 8 9 0 {bksp} {enter}'],
  symbol: ['{symbol_num} . , / # - + % ( ) * {bksp} {enter}'],
};
