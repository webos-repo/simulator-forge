import settingsDB from '@settings/settingsDB';
import type {
  Orientation,
  Orientation2Way,
} from '@share/structure/orientations';
import type { Bound, Pos, Size } from '@share/structure/positions';
import { emtSetting } from '../module/eventEmitters';

type DBData = {
  width?: number;
  height?: number;
  zoomFactor?: number;
};

const WSKey = 'window-settings';

class WindowSetting {
  private BaseWidth: Readonly<number> = 1280;
  private BaseHeight: Readonly<number> = 720;
  private orn4w: Orientation = 'landscape';
  private orn2w: Orientation2Way = 'landscape';
  private x = 50;
  private y = 50;
  private width!: number;
  private height!: number;
  private zoomFactor!: number;
  public readonly rcuSize: Size = {
    width: 127,
    height: 680,
  };

  constructor() {
    try {
      this.initFromDB();
    } catch {
      this.initSettings();
    }
  }

  private initSettings = (
    width = this.BaseWidth,
    height = this.BaseHeight,
    zoomFactor = 1
  ) => {
    [this.width, this.height, this.zoomFactor] = [width, height, zoomFactor];
    this.setToDB({
      width: this.width,
      height: this.height,
      zoomFactor: this.zoomFactor,
    });
  };

  private initFromDB = () => {
    if (settingsDB.has(WSKey)) {
      const { width, height, zoomFactor } = settingsDB.get(WSKey);
      this.initSettings(width, height, zoomFactor);
    } else {
      this.initSettings();
    }
  };

  private setToDB = (data: DBData) => {
    Object.entries(data).forEach(([key, value]) => {
      settingsDB.set(`${WSKey}.${key}`, value);
    });
  };

  get pos(): Pos {
    return { x: this.x, y: this.y };
  }

  get size(): Size {
    return this.isLandscape()
      ? { width: this.width, height: this.height }
      : { width: this.height, height: this.width };
  }

  get baseSize(): Size {
    return this.isLandscape()
      ? { width: this.BaseWidth, height: this.BaseHeight }
      : { width: this.BaseHeight, height: this.BaseWidth };
  }

  get bound(): Bound {
    return { ...this.pos, ...this.size };
  }

  get orn() {
    return this.orn4w;
  }

  get orn2Way() {
    return this.orn2w;
  }

  get zoom() {
    return this.zoomFactor;
  }

  getPosToArray = (): Readonly<[number, number]> => {
    return Object.values(this.pos) as [number, number];
  };

  getSizeToArray = (): Readonly<[number, number]> => {
    return Object.values(this.size) as [number, number];
  };

  getBoundToArray = (): Readonly<[number, number, number, number]> => {
    return [...this.getPosToArray(), ...this.getSizeToArray()];
  };

  getLongSide = () => {
    const { width, height } = this.size;
    return width > height ? width : height;
  };

  private setSize = (width: number, height: number) => {
    [this.width, this.height] = [Math.round(width), Math.round(height)];
    this.setToDB({ width: this.width, height: this.height });
  };

  setOrn = (orn: Orientation) => {
    if (this.orn4w === orn) return;
    this.orn4w = orn;
    if (orn === 'landscape' || orn === 'reversed_landscape') {
      this.setOrn2Way('landscape');
    } else {
      this.setOrn2Way('portrait');
    }
  };

  setOrn2Way = (orn2Way: Orientation2Way) => {
    if (this.orn2w === orn2Way) return;
    this.orn2w = orn2Way;
  };

  setZoom = (zoomFactor: number) => {
    if (this.zoomFactor === zoomFactor) return;
    this.zoomFactor = zoomFactor;
    this.setSize(this.BaseWidth * zoomFactor, this.BaseHeight * zoomFactor);
    emtSetting.emit('change-zoomFactor', this.zoom);
    this.setToDB({ zoomFactor });
  };

  private isLandscape = () => {
    return this.orn2w === 'landscape';
  };
}

const windowSetting = new WindowSetting();
export default windowSetting;
