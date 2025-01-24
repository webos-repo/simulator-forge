import moment from 'moment-timezone';
import { tvLocation } from '@tvSettings/index';
import type * as ActivityManagerTypes from './types';

const NonPreciseIntervals = [
  '12h',
  '6h',
  '3h',
  '1h',
  '20m',
  '30m',
  '15m',
  '10m',
  '5m',
];

const activityTimerMap: Map<string, NodeJS.Timeout> = new Map();

// a - b
const getTimeDiff = (
  a: moment.Moment,
  b = moment().tz(tvLocation.timeZone)
) => {
  return moment.duration(a.diff(b)).asMilliseconds();
};

const validInterval = (
  timeNum: number,
  timeType: string,
  precise?: boolean
) => {
  if (!precise) {
    if (timeType === 'd') return true;
    return NonPreciseIntervals.includes(`${timeNum}${timeType}`);
  }
  return true;
};

const convertTimeToMilli = (timeNum: number, timeType: string) => {
  let ret = timeNum;
  switch (timeType) {
    case 'd':
      ret *= 24 * 60 * 60 * 1000;
      break;
    case 'h':
      ret *= 60 * 60 * 1000;
      break;
    case 'm':
      ret *= 60 * 1000;
      break;
    case 's':
      ret *= 1000;
      break;
    default:
      return -1;
  }
  return ret;
};

const handleInterval = (
  activity: ActivityManagerTypes.Activity,
  callback: any
) => {
  const { end, precise, interval } = activity.schedule!;
  if (!interval) return false;

  const timeNum = parseInt(interval.slice(0, -1), 10);
  const timeType = interval.slice(-1)?.toLowerCase();

  if (!timeNum || !timeType || !validInterval(timeNum, timeType, precise)) {
    return false;
  }

  const intervalMilli = convertTimeToMilli(timeNum, timeType);
  if (intervalMilli <= 0) return false;

  let endTime: moment.Moment | undefined;
  if (end) endTime = moment(end, 'Y-M-D H:m:s', true).tz(tvLocation.timeZone);

  activityTimerMap.set(
    activity.name,
    setTimeout(function callbackCaller() {
      if (endTime && getTimeDiff(endTime) < 0) return;
      callback(activity);
      setTimeout(callbackCaller, intervalMilli);
    }, intervalMilli)
  );

  return true;
};

const handleStart = (
  activity: ActivityManagerTypes.Activity,
  callback: any
) => {
  const { start, end, interval } = activity.schedule!;
  const { continuous } = activity.type;

  if (!start) return false;
  const startTime = moment(start, 'Y-M-D H:m:s', true).tz(tvLocation.timeZone);

  if (!startTime.isValid()) {
    return false;
  }
  const curTime = moment().tz(tvLocation.timeZone);
  const curStartDiff = getTimeDiff(startTime, curTime);
  if (curStartDiff < 0) return false;

  if (end) {
    const endTime = moment(end, 'Y-M-D H:m:s', true).tz(tvLocation.timeZone);
    const startEndDiff = getTimeDiff(endTime, startTime);
    if (startEndDiff < 0) return false;
  }

  activityTimerMap.set(
    activity.name,
    setTimeout(() => {
      callback(activity);
      if (continuous && interval) {
        handleInterval(activity, callback);
      }
    }, curStartDiff)
  );

  return true;
};

export const setSchedule = (
  activity: ActivityManagerTypes.Activity,
  callback: any
) => {
  if (!activity.schedule) return false;
  if (activity.schedule?.start) {
    return handleStart(activity, callback);
  }
  if (activity.schedule?.interval) {
    return handleInterval(activity, callback);
  }

  return false;
};

export const stopSchedule = (activityName: string) => {
  const timer = activityTimerMap.get(activityName);
  if (!timer) return false;
  clearTimeout(timer);
  activityTimerMap.delete(activityName);
  return true;
};
