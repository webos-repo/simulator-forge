import { EventEmitter } from "events";
import bleGattService from "@/main/service/lunaService/bleGattService";
import { splitServiceURL } from "../../lib/pathResolver";
import type { ServiceCallback } from "../service";
import activityManager from "./activityManager";
import applicationManager from "./applicationManager";
import audioService from "./audioService";
import configService from "./configService";
import connectionManager from "./connectionManager";
import databaseService from "./databaseService";
import deviceUniqueId from "./deviceUniqueId";
import drmService from "./drmService";
import mrcuService from "./mrcuService";
import settingsService from "./settingsService";
import systemService from "./systemService";
import tvDeviceInformation from "./tvDeviceInformation";

type LunaAdditionalData = {
  emitter: EventEmitter;
  isCancel: boolean;
  token: string;
  isCalledFromApp: boolean;
  callback: ServiceCallback;
  frameId: number;
};

const findMatchService = (serviceName: string) => {
  if (serviceName.length <= 60) {
    switch (serviceName) {
      case "com.palm.systemservice":
      case "com.webos.service.systemservice":
        return systemService;
      case "com.webos.service.config":
        return configService;
      case "com.webos.service.tv.systemproperty":
        return tvDeviceInformation;
      case "com.webos.audio":
        return audioService;
      case "com.webos.settingsservice":
        return settingsService;
      case "com.webos.service.sm":
        return deviceUniqueId;
      case "com.palm.connectionmanager":
      case "com.webos.service.connectionmanager":
        return connectionManager;
      case "com.webos.applicationManager":
        return applicationManager;
      case "com.palm.activitymanager":
        return activityManager;
      case "com.webos.service.mrcu":
        return mrcuService;
      case "com.webos.service.drm":
        return drmService;
      case "com.palm.db":
      case "com.webos.mediadb":
        return databaseService;
      case "com.webos.service.blegatt":
        return bleGattService;
      default:
    }
  }
  return null;
};

const lunaService = async (
  url: string,
  params: string,
  isCalledFromApp: boolean,
  token: string,
  callback: ServiceCallback,
  isCancel: boolean,
  frameId: number,
) => {
  const { serviceName, categoryName, methodName } = splitServiceURL(url);
  const subscribe = !!JSON.parse(params).subscribe;

  const matchedService = findMatchService(serviceName);
  if (!matchedService) return false;

  const emitter = new EventEmitter();
  if (!isCancel && subscribe) {
    const subscribeHandler = (data: any) => {
      const { ret, isSubscription } = data;
      if (!isSubscription) {
        emitter.removeListener("subscribe-return", subscribeHandler);
      }
      callback(token, ret, subscribe, isCalledFromApp, frameId);
    };
    emitter.on("subscribe-return", subscribeHandler);
  }

  const ret = await matchedService.call(categoryName, methodName, params, {
    emitter,
    token,
    isCancel,
    isCalledFromApp,
    callback,
    frameId,
  });
  callback(token, ret, subscribe, isCalledFromApp, frameId);
  return true;
};

export default lunaService;
export type { LunaAdditionalData };
