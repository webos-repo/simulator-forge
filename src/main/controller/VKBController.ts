import VkbView from "@/main/view/vkbView";

type VKBKeys = "default" | "number";

export default class VKBController {
  private readonly VKBMap: { [key in VKBKeys]: VkbView };

  constructor() {
    this.VKBMap = {
      default: new VkbView("default"),
      number: new VkbView("number"),
    };
  }

  convertType = (inputType: string) => {
    switch (inputType) {
      case "number":
      case "tel":
        return "number";
      default:
        return "default";
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
      .filter(([key]) => {
        return key !== vkbType;
      })
      .map(([, value]) => value);
  };
}
