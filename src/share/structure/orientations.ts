type Direction = 'Left' | 'Right' | 'Up' | 'Down';
type DirectionKeyCode =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Enter';

const directions: Direction[] = ['Left', 'Right', 'Up', 'Down'];

type Orientation =
  | 'landscape'
  | 'portrait'
  | 'reversed_landscape'
  | 'reversed_portrait';

type Orientation2Way = 'landscape' | 'portrait';

const orientations: Orientation[] = [
  'landscape',
  'portrait',
  'reversed_landscape',
  'reversed_portrait',
];

function convertTo2Way(orientation: Orientation): Orientation2Way {
  if (orientation === 'landscape' || orientation === 'reversed_landscape')
    return 'landscape';
  if (orientation === 'portrait' || orientation === 'reversed_portrait')
    return 'portrait';
  throw new Error('can not convert orientation');
}

export { orientations, directions, convertTo2Way };
export type { Orientation, Orientation2Way, DirectionKeyCode, Direction };
