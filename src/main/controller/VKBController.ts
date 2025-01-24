import KeyboardView from '@view/KeyboardView';

type VKBKeys = 'default' | 'number';

class VKBController {
  private readonly VKBMap: { [key in VKBKeys]: KeyboardView };

  constructor() {
    this.VKBMap = {
      default: new KeyboardView('default'),
      number: new KeyboardView('number'),
    };
  }

  convertType = (inputType: string) => {
    switch (inputType) {
      case 'number':
      case 'tel':
        return 'number';
      default:
        return 'default';
    }
  };

  getVKB = (inputType: string) => {
    const vkbType = this.convertType(inputType);
    const vkb = this.VKBMap[vkbType];
    if (!vkb) return undefined;
    return vkb;
  };

  getOtherVKBs = (inputType: string) => {
    const vkbType = this.convertType(inputType);
    return Object.entries(this.VKBMap)
      .filter(([key, value]) => {
        return key !== vkbType;
      })
      .map(([key, value]) => value);
  };
}

export default VKBController;
