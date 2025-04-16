import { methodError, methodNotFound } from "@/main/service/serviceError";
import { isJsonStrValid } from "../../lib/jsonChecker";

class DRMService {
  call = async (category: string, method: string, params: string) => {
    if (!isJsonStrValid(params)) {
      return methodError("ERROR_99", "JSON format error.");
    }

    if (category === "") {
      switch (method) {
        case "load":
          return await this.load();
        case "unload":
          return await this.unload();
        case "isLoaded":
          return await this.isLoaded();
        case "sendDrmMessage":
          return await this.sendDrmMessage();
        case "getRightsError":
          return await this.getRightsError();
        default:
      }
    }
    return methodNotFound(category, method);
  };

  load = async () => {
    return methodError(999, "Simulator does not support DRM");
  };

  unload = async () => {
    return methodError(999, "Simulator does not support DRM");
  };

  isLoaded = async () => {
    return methodError(999, "Simulator does not support DRM");
  };

  sendDrmMessage = async () => {
    return methodError(999, "Simulator does not support DRM");
  };

  getRightsError = async () => {
    return methodError(999, "Simulator does not support DRM");
  };
}

const drmService = new DRMService();
export default drmService;
