import { methodError, methodNotFound } from "@/main/service/serviceError";
import { tvInfo } from "@/main/tvSettings/index";
import { get, has, isEmpty } from "es-toolkit/compat";
import { isJsonStrValid } from "../../lib/jsonChecker";

class ConfigService {
  call = async (category: string, method: string, params: string) => {
    if (!isJsonStrValid(params)) {
      return methodError("ERROR_99", "JSON format error.");
    }

    if (category === "") {
      switch (method) {
        case "getConfigs":
          return await this.getConfigs(params);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  getConfigs = async (params: string) => {
    const { configNames }: { configNames: string[] } = JSON.parse(params);
    const missingConfigs: string[] = [];
    const tvInfoConfigs = tvInfo.configs;

    if (!configNames) {
      return methodError(-2, "Invalid parameter error", { subscribed: false });
    }

    const configs = configNames?.reduce((pre: any, cur) => {
      if (has(tvInfoConfigs, cur)) {
        pre[cur] = get(tvInfoConfigs, cur);
      } else {
        missingConfigs.push(cur);
      }
      return pre;
    }, {});

    return {
      subscribed: false,
      returnValue: true,
      ...(isEmpty(configs) ? {} : { configs }),
      ...(isEmpty(missingConfigs) ? {} : { missingConfigs }),
    };
  };
}

const configService = new ConfigService();
export default configService;
