import { emtService } from '../../../module/eventEmitters';
import { isJsonStrValid } from '../../../lib/jsonChecker';
import { methodError, methodNotFound } from '@service/ServiceError';
import type { ServiceData } from '../../Service';
import { setSchedule, stopSchedule } from './scheduler';
import type { EventEmitter } from 'events';
import type { LunaAdditionalData } from '@service/lunaService';
import type * as ActivityManagerTypes from './types';

const actMap: Map<string, ActivityManagerTypes.Activity> = new Map();
const emitterMap: Map<string, EventEmitter[]> = new Map();
const idMapper: Map<number, string> = new Map();

let ActivityId = 0;
const getActivityId = () => {
  ActivityId += 1;
  return ActivityId;
};

const findActivity = (
  {
    name,
    id,
  }: {
    name: string;
    id: number;
  },
  includeDestroyed = false
): [ActivityManagerTypes.Activity | undefined, string] => {
  let actById;
  let actByName;
  if (id && idMapper.has(id)) {
    actById = actMap.get(idMapper.get(id)!);
    if (actById?.state === 'destroyed' && !includeDestroyed) {
      actById = undefined;
    }
  }
  if (name) {
    actByName = actMap.get(name);
    if (actByName?.state === 'destroyed' && !includeDestroyed) {
      actByName = undefined;
    }
  }

  if (id && !name) {
    if (actById) return [actById, ''];
    return [undefined, 'activityId not found'];
  }
  if (name && !id) {
    if (actByName) return [actByName, ''];
    return [undefined, 'Activity name/creator pair not found'];
  }
  if (actById && actByName && actById === actByName) {
    return [actById, ''];
  }
  return [undefined, 'activityId not found'];
};

const setEmitterMap = (name: string, emitter: EventEmitter) => {
  if (emitterMap.has(name)) {
    emitterMap.get(name)!.push(emitter);
  } else {
    emitterMap.set(name, []);
    emitterMap.get(name)!.push(emitter);
  }
};

const broadcast = async (
  activity: ActivityManagerTypes.Activity,
  event: string
) => {
  emitterMap.get(activity.name)?.forEach((emt) => {
    emt.emit('subscribe-return', {
      ret: {
        returnValue: true,
        event,
        activityId: activity.activityId,
        subscribe: true,
      },
      isSubscription: true,
    });
  });
};

const runActivity = async (activity: ActivityManagerTypes.Activity) => {
  if (activity.state !== 'unsatisfied') return;

  activity.state = 'satisfied';
  if (activity.callback) {
    const token = `activity.token.${activity.activityId}`;

    emtService.once(`return-service-${token}`, () => {
      activity.state = 'expired';
      if (activity.type?.continuous) {
        activity.state = 'unsatisfied';
        broadcast(activity, 'complete');
      }
    });

    emtService.emit('call-service', {
      url: activity.callback.method,
      params: JSON.stringify(activity.callback.params),
      token,
      isCalledFromApp: false,
      isCancel: false,
    } as ServiceData);

    await broadcast(activity, 'start');
  }
};

const deleteActivity = (name: string) => {
  const id = actMap.get(name)?.activityId;
  if (id) idMapper.delete(id);
  actMap.delete(name);
  emitterMap.delete(name);
};

class ActivityManager {
  call = async (
    category: string,
    method: string,
    params: string,
    additionalData: LunaAdditionalData
  ) => {
    if (!isJsonStrValid(params)) {
      return methodError('ERROR_99', 'JSON format error.');
    }
    const { emitter } = additionalData;

    if (category === '') {
      switch (method) {
        case 'adopt':
          return await this.adopt(params);
        case 'cancel':
          return await this.cancel(params);
        case 'complete':
          return await this.complete(params);
        case 'create':
          return await this.create(params, emitter);
        case 'release':
          return await this.release(params);
        case 'start':
          return await this.start(params);
        case 'stop':
          return await this.stop(params);
        default:
      }
    }
    return methodNotFound(category, method);
  };

  /**
   * Not implemented
   * Just check parameters and return true.
   */
  adopt = async (params: string) => {
    const {
      activityId,
      activityName,
      wait,
      subscribe,
      detailedEvents,
    }: ActivityManagerTypes.AdoptParams = JSON.parse(params);

    const [activity, errorText] = findActivity({
      name: activityName,
      id: activityId,
    });

    if (!activity) {
      return methodError(2, errorText);
    }

    return {
      returnValue: true,
      adopt: true, // FIXME
    };
  };

  cancel = async (params: string) => {
    const { activityId, activityName }: ActivityManagerTypes.CancelParams =
      JSON.parse(params);

    const [activity, errorText] = findActivity(
      {
        name: activityName,
        id: activityId,
      },
      true
    );
    if (!activity) {
      return methodError(2, errorText);
    }

    stopSchedule(activity.name);
    activity.state = 'destroyed';
    broadcast(activity, 'cancel');

    return {
      returnValue: true,
    };
  };

  complete = async (params: string) => {
    const {
      activityId,
      activityName,
      restart,
      callback,
      schedule,
      trigger,
      metadata,
    }: ActivityManagerTypes.CompleteParams = JSON.parse(params);

    const [activity, errorText] = findActivity({
      name: activityName,
      id: activityId,
    });
    if (!activity) {
      return methodError(2, errorText);
    }
    if (!restart) {
      return this.cancel(JSON.stringify({ activityId, activityName }));
    }
    if (activity.state !== 'expired') {
      return methodError(-15, 'FIXME'); // FIXME
    }

    if (callback) activity.callback = callback;
    if (schedule) activity.schedule = schedule;
    if (trigger) activity.trigger = trigger;
    if (metadata) activity.metadata = metadata;

    activity.state = 'unsatisfied';
    // this.start(JSON.stringify({ activityId, activityName }));

    return {
      returnValue: true,
    };
  };

  create = async (params: string, emitter: EventEmitter) => {
    const {
      activity,
      subscribe,
      detailedEvents,
      start,
      replace,
    }: ActivityManagerTypes.CreateParams = JSON.parse(params);

    const { name, description, type, callback } = activity;

    if (!name || !description || !type) {
      // FIXME
    }
    if (!subscribe) {
      if (start && !callback) {
        // FIXME
      }
    }
    if (actMap.has(name)) {
      if (!replace) {
        return methodError(2, 'Already Exist'); // FIXME
      }
      deleteActivity(name);
    }

    const activityId = getActivityId();
    activity.activityId = activityId;
    activity.state = 'created';
    actMap.set(name, activity);
    idMapper.set(activityId, name);
    if (subscribe) {
      setEmitterMap(name, emitter);
    }

    if (start) {
      this.start(
        JSON.stringify({
          activityId,
          activityName: name,
        })
      );
    }

    return {
      returnValue: true,
      subscribed: subscribe,
      activityId: ActivityId,
    };
  };

  release = async (params: string) => {
    const { activityId, activityName }: ActivityManagerTypes.ReleaseParams =
      JSON.parse(params);

    const [activity, errorText] = findActivity({
      name: activityName,
      id: activityId,
    });
    if (!activity) {
      return methodError(2, errorText);
    }

    this.cancel(params);

    // do nothing
    return {
      returnValue: true,
    };
  };

  start = async (params: string) => {
    const { activityId, activityName }: ActivityManagerTypes.StartParams =
      JSON.parse(params);

    if (!activityName && !activityId) {
      return methodError(-10, 'FIXME'); // FIXME
    }

    const [activity, errorText] = findActivity({
      name: activityName,
      id: activityId,
    });
    if (!activity) {
      return methodError(2, errorText);
    }

    if (activity.type?.explicit === true) {
      activity.state = 'created';
    }

    if (
      activity.state !== 'created' &&
      activity.state !== 'expired' &&
      activity.state !== 'paused'
    ) {
      return methodError(
        -1000,
        `Failed to start activity: Invalid transition: ${activity.state} -> start`
      );
    }
    if (activity.state === 'expired') {
      if (activity.type?.continuous) {
        await this.complete(
          JSON.stringify({ activityId, activityName, restart: true })
        );
      }
      return methodError(
        -1000,
        'Failed to start activity: Invalid transition: expired -> start'
      );
    }

    activity.state = 'unsatisfied';
    if (activity.schedule) {
      setSchedule(activity, runActivity);
    } else if (activity.trigger) {
      // FIXME
    } else {
      runActivity(activity);
    }

    return {
      returnValue: true,
    };
  };

  stop = async (params: string) => {
    // exactly same as cancel method
    return this.cancel(params);
  };
}

const activityManager = new ActivityManager();
export default activityManager;
