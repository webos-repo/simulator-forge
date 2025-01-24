import { isWebOSVersionGte } from '@main/lib/simulInfo';
import { ipcMain } from 'electron';
import { extractIdFromToken } from '../../lib/pathResolver';
import { isJsonStrValid } from '../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import { emtApp } from '../../module/eventEmitters';
import type { LunaAdditionalData } from './index';

import type { EventEmitter } from 'events';

const subscriptions: Map<string, EventEmitter> = new Map();
const timers: Map<string, NodeJS.Timeout> = new Map();
const updateCntMap: Map<string, number> = new Map();
let updateCnt = 0;
let clientX = 0;
let clientY = 0;

const makeSensorData = (x: number, y: number) => {
  return {
    returnValue: true,
    deviceId: 0,
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
    coordinate: {
      x,
      y,
    },
    gyroscope: {
      x: 0,
      y: 0,
      z: 0,
    },
    quaternion: {
      q0: 0,
      q1: 0,
      q2: 0,
      q3: 0,
    },
  };
};

const handleMouseMoveData = (_: any, x: number, y: number) => {
  updateCnt += 1;
  clientX = x;
  clientY = y;
};

const cancelSubscription = (token: string) => {
  if (subscriptions.has(token)) {
    subscriptions.get(token)!.emit('subscribe-return', {
      ret: {},
      isSubscription: false,
    });
    subscriptions.delete(token);
    emtApp.emit('send-to-app-by-id', {
      appId: extractIdFromToken(token),
      channel: 'get-mouse-move-fast-off',
    });
  }
  if (timers.has(token)) {
    clearInterval(timers.get(token)!);
  }
  return {
    returnValue: true,
  };
};

class MrcuService {
  private readonly SENSOR2_SENSOR_MAX_INTERVAL = 1000;
  private readonly SENSOR2_SENSOR_MIN_INTERVAL = 10;
  private readonly SENSOR2_SENSOR_IS_ALIVE = false;
  private sensor2_sensorInterval = 1000;

  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('101', 'Invalid JSON format.');
    }

    const { emitter, token, isCancel } = additionalData;

    if (isCancel) {
      return cancelSubscription(token);
    }

    switch (category) {
      case '':
        switch (method) {
          case 'enableDualPairing':
            return await this.enableDualPairing(params);
          case 'getAPIVersion':
            if (!isWebOSVersionGte('24')) break;
            return await this.getAPIVersion();
          default:
        }
        break;
      case 'sensor':
        switch (method) {
          case 'getSensorData':
            return await this.sensor_getSensorData(params, emitter, token);
          case 'resetQuaternion':
            return await this.sensor_resetQuaternion();
          default:
        }
        break;
      case 'sensor2':
        switch (method) {
          case 'getSensorEventData':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_getSensorEventData(params);
          case 'cancelSensorDataSubscribe':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_cancelSensorDataSubscribe();
          case 'getSensorState':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_getSensorState();
          case 'getSensorInterval':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_getSensorInterval();
          case 'setSensorInterval':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_setSensorInterval(params);
          case 'resetQuaternion':
            if (!isWebOSVersionGte('24')) break;
            return await this.sensor2_resetQuaternion();
          default:
        }
        break;
      default:
    }
    return methodNotFound(category, method);
  };

  enableDualPairing = async (params: string) => {
    const { enable }: { enable: boolean } = JSON.parse(params);

    if (!enable) {
      return methodError(1101, 'Invalid Parameter');
    }
    return {
      returnValue: true,
    };
  };

  sensor_getSensorData = async (
    params: string,
    emitter: EventEmitter,
    token: string
  ) => {
    const {
      callbackInterval,
      subscribe,
    }: { callbackInterval: number; subscribe: boolean } = JSON.parse(params);

    if (!subscribe) {
      return methodError(1201, 'Not Subscription Message', {
        subscribed: false,
      });
    }

    ipcMain.removeListener('assistant-mousemove', handleMouseMoveData);
    ipcMain.on('assistant-mousemove', handleMouseMoveData);

    if (!subscriptions.has(token)) {
      emtApp.emit('send-to-app-by-id', {
        appId: extractIdFromToken(token),
        channel: 'get-mouse-move-fast-on',
      });
      updateCntMap.set(token, updateCnt);
      const timer = setInterval(() => {
        if (updateCntMap.get(token)! >= updateCnt) return;

        updateCntMap.set(token, updateCnt);
        emitter.emit('subscribe-return', {
          ret: makeSensorData(clientX, clientY),
          isSubscription: true,
        });
      }, callbackInterval * 10);
      subscriptions.set(token, emitter);
      timers.set(token, timer);
    }

    return {
      returnValue: true,
      subscribed: subscribe,
    };
  };

  sensor_resetQuaternion = async () => {
    return {
      returnValue: true,
    };
  };

  getAPIVersion = async () => {
    return {
      returnValue: true,
      version: '1.0',
    };
  };

  sensor2_getSensorEventData = async (_params: string) => {
    // const { sensorType, subscribe } = JSON.parse(params);
    return methodError(1003, 'Magic Remote is not Ready', {
      subscribed: false,
    });
  };

  sensor2_cancelSensorDataSubscribe = async () => {
    return {
      returnValue: true,
    };
  };

  sensor2_getSensorState = async () => {
    return {
      returnValue: true,
      isAlive: this.SENSOR2_SENSOR_IS_ALIVE,
    };
  };

  sensor2_getSensorInterval = async () => {
    return {
      returnValue: true,
      interval: this.sensor2_sensorInterval,
      maxInterval: this.SENSOR2_SENSOR_MAX_INTERVAL,
      minInterval: this.SENSOR2_SENSOR_MIN_INTERVAL,
    };
  };

  sensor2_setSensorInterval = async (params: string) => {
    const { interval }: { interval: number } = JSON.parse(params);
    if (
      interval < this.SENSOR2_SENSOR_MIN_INTERVAL ||
      interval > this.SENSOR2_SENSOR_MAX_INTERVAL
    ) {
      return methodError(1006, 'Wrong Callback Interval');
    }
    this.sensor2_sensorInterval = interval;
    return {
      returnValue: true,
    };
  };

  sensor2_resetQuaternion = async () => {
    return methodError(1003, 'Magic Remote is not Ready');
  };
}

const mrcuService = new MrcuService();
export default mrcuService;
