import cp from 'child_process';
import { methodNotFound } from '@service/ServiceError';
import { splitServiceURL } from '../lib/pathResolver';
import { emtService, emtWindow } from '../module/eventEmitters';
import { getTargetFilePath } from '@share/lib/paths';
import type { ChildProcess } from 'child_process';
import type { ServiceCallback, ServiceData } from './Service';

type JSServiceMethod = {
  name: string;
  request?: (message: any) => void;
  cancel?: (message: any) => void;
};

interface IJSService {
  id: string;
  dirPath: string;
  entry: string;
  isActive: boolean;
  methods: JSServiceMethod[];
  activate: () => void;
  deactivate: () => void;
  child?: ChildProcess;
  call: (
    url: string,
    params: string,
    isCalledFromApp: boolean,
    token: string,
    callback: ServiceCallback,
    isCancel: boolean,
    frameId: number
  ) => any;
}

const initMessage = (
  id: string,
  categoryName: string,
  methodName: string,
  params: any,
  subscribe: boolean,
  token: string
) => {
  return {
    category: `/${categoryName}`,
    method: methodName,
    isSubscription: subscribe,
    sender: id,
    uniqueToken: token,
    payload: JSON.parse(params),
  };
};

class JSService implements IJSService {
  id: string;
  dirPath: string;
  entry: string;
  isActive: boolean;
  methods: JSServiceMethod[];
  child?: cp.ChildProcess;

  constructor(id: string, dirPath: string, entry: string) {
    this.id = id;
    this.dirPath = dirPath;
    this.entry = entry;
    this.isActive = false;
    this.methods = [];
  }

  activate = () => {
    const child = cp.fork(this.entry, [], {
      stdio: ['ipc'],
      env: {
        ...process.env,
        NODE_PATH:
          process.env.NODE_ENV === 'production'
            ? getTargetFilePath('release', 'extra', 'modules')
            : getTargetFilePath('extra', 'modules'),
      },
    });
    if (child) {
      this.child = child;
      this.isActive = true;
      this.child.on('message', this.serviceEventHandler);
    }
    return child;
  };

  deactivate = () => {
    this.isActive = false;
    this.methods = [];
    this.child?.kill();
  };

  toggleActive = () => {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  };

  call = async (
    url: string,
    params: string,
    isCalledFromApp: boolean,
    token: string,
    callback: ServiceCallback,
    isCancel: boolean,
    frameId: number
  ) => {
    if (!this.child || !this.child.connected) return;
    const { categoryName, methodName } = splitServiceURL(url);
    const subscribe = !!JSON.parse(params).subscribe;
    const name = categoryName
      ? [categoryName, methodName].join('/')
      : methodName;
    const method = this.methods.find((m) => m.name === name);

    if (!method) {
      callback(
        token,
        methodNotFound(categoryName, methodName),
        subscribe,
        isCalledFromApp,
        frameId
      );
      return;
    }

    const serviceMsgHandler = (data: any) => {
      const {
        cmd,
        ret,
        isSubscription,
        uniqueToken,
        isCancel: isCancelService,
      } = data;
      if (cmd !== `service-send` || uniqueToken !== token) return;
      if (!isSubscription || isCancelService) {
        this.child?.removeListener('message', serviceMsgHandler);
      }
      callback(token, JSON.parse(ret), subscribe, isCalledFromApp, frameId);
    };
    this.child.on('message', serviceMsgHandler);

    this.child.send({
      cmd: `called-${name}`,
      msg: initMessage(
        this.id,
        categoryName,
        methodName,
        params,
        subscribe,
        token
      ),
      isCancel,
    });
  };

  serviceEventHandler = (message: any) => {
    const { cmd } = message;

    if (cmd === 'register') {
      this.registerHandler(message);
    } else if (cmd === 'call') {
      this.callHandler(message);
    } else if (cmd === 'subscribe') {
      this.subscribeHandler(message);
    }
  };

  registerHandler = (message: any) => {
    const { busId, methodName } = message;
    if (this.methods.find((m) => m.name === methodName)) {
      emtWindow.emit('alert-message', {
        message: `Already registered method\n\nMethod: '${methodName}'\nService: '${busId}'`,
        type: 'error',
      });
      return;
    }
    this.methods.push({
      name: methodName,
    });
  };

  callHandler = (message: any, isFromSubscribe = false) => {
    const { uri, args, token, isCancel } = message;

    const callbackHandler = (res: any, subscribe: boolean) => {
      if (!subscribe) {
        emtService.removeListener(`return-service-${token}`, callbackHandler);
      }
      if (this.child?.connected) {
        this.child?.send({
          cmd: isFromSubscribe
            ? `subscribe-response-${token}`
            : `call-response-${token}`,
          res: {
            payload: res,
          },
          subscribe,
        });
      }
    };
    emtService.on(`return-service-${token}`, callbackHandler);
    emtService.emit('call-service', {
      url: uri,
      params: args,
      token,
      isCalledFromApp: false,
      isCancel,
    } as ServiceData);
  };

  subscribeHandler = (message: any) => {
    message.args = JSON.stringify({
      ...JSON.parse(message.args),
      subscribe: true,
    });
    this.callHandler(message, true);
  };
}

export default JSService;
export type { IJSService };
