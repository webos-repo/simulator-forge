type Pos = {
  x: number;
  y: number;
};

type MovePos = Pos & {
  movementX: number;
  movementY: number;
};

type Size = {
  width: number;
  height: number;
};

type Bound = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type { Pos, MovePos, Size, Bound };
