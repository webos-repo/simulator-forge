type StateName =
  | 'created'
  | 'unsatisfied'
  | 'satisfied'
  | 'expired'
  | 'paused'
  | 'failed'
  | 'destroyed';

type Parent =
  | {
      appId: string;
    }
  | {
      serviceId: string;
    };

type Schedule = {
  precise?: boolean;
  start?: string;
  interval?: string;
  skip?: boolean;
  local?: boolean;
  end?: string;
  relative?: boolean;
  lastFinished?: string;
};

type TypeObject = {
  foreground?: boolean;
  background?: boolean;
  immediate?: boolean;
  priority?: string;
  userInitiated?: boolean;
  persist?: boolean;
  explicit?: boolean;
  continuous?: boolean;
  power?: boolean;
  powerDebounce?: boolean;
};

type Trigger = {
  method: string;
  params?: { [key: string]: any };
  where?: { [key: string]: any };
  compare?: { [key: string]: any };
  key?: string;
};

type ActivityCallbackObject = {
  method: string;
  params?: { [key: string]: any };
};

type Activity = {
  name: string;
  description: string;
  type: TypeObject;
  schedule?: Schedule;
  trigger?: Trigger;
  callback?: ActivityCallbackObject;
  metadata?: any;
  activityId?: number;
  creator?: Parent;
  parent?: Parent;
  adopters?: Parent[];
  state?: StateName;
  focused?: boolean;
};

type AdoptParams = {
  activityId: number;
  activityName: string;
  wait: boolean;
  subscribe: boolean;
  detailedEvents?: boolean;
};

type CancelParams = { activityId: number; activityName: string };

type CompleteParams = {
  activityId: number;
  activityName: string;
  restart?: boolean;
  callback?: ActivityCallbackObject;
  schedule?: Schedule;
  trigger?: Trigger;
  metadata?: any;
};

type CreateParams = {
  activity: Activity;
  subscribe: boolean;
  detailedEvents: boolean;
  start: boolean;
  replace: boolean;
};
type ReleaseParams = { activityId: number; activityName: string };

type StartParams = { activityId: number; activityName: string };

export {
  Activity,
  AdoptParams,
  CancelParams,
  CompleteParams,
  CreateParams,
  ReleaseParams,
  StartParams,
};
