import lunaService from '@service/lunaService';
import JSServiceController from '@controller/JSServiceController';
import { serviceNotFound } from '@service/ServiceError';
import type { SendToFramesParam } from '@view/AppView';
import { splitServiceURL } from '../lib/pathResolver';
import { emtApp, emtService } from '../module/eventEmitters';

export type ServiceData = {
  url: string;
  params: string;
  token: string;
  isCalledFromApp: boolean;
  isCancel: boolean;
  frameId: number;
};

export type ServiceCallback = (
  token: string,
  res: any,
  subscribe: boolean,
  isCalledFromApp: boolean,
  frameId: number
) => void;

async function callService({
  url,
  params,
  token,
  isCalledFromApp,
  isCancel,
  frameId,
}: ServiceData) {
  const isLunaService = await lunaService(
    url,
    params,
    isCalledFromApp,
    token,
    serviceCallback,
    isCancel,
    frameId
  );

  if (!isLunaService) {
    const { serviceName } = splitServiceURL(url);
    const jsService = JSServiceController.getJSService(serviceName);
    if (jsService?.isActive) {
      jsService.call(
        url,
        params,
        isCalledFromApp,
        token,
        serviceCallback,
        isCancel,
        frameId
      );
    } else {
      serviceCallback(
        token,
        serviceNotFound(serviceName),
        false,
        isCalledFromApp,
        frameId
      );
    }
  }
}

const serviceCallback: ServiceCallback = (
  token: string,
  res: any,
  subscribe: boolean,
  isCalledFromApp: boolean,
  frameId: number
) => {
  if (isCalledFromApp) {
    const appId = token.slice(0, token.lastIndexOf('.'));
    emtApp.emit('send-to-app-by-id', appId, {
      channel: `return-service-${token}`,
      args: res ? [res] : undefined,
      frameId,
    } as SendToFramesParam);
  } else {
    emtService.emit(`return-service-${token}`, res, subscribe);
  }
};

emtService.onWithIpcMain('call-service', callService);
