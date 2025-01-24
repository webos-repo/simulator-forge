/* eslint-disable @typescript-eslint/naming-convention */
import type { RCUButtonEventType } from './events';

export type RCU_Button = {
  keyCode: string;
  rcuEventType: RCUButtonEventType;
  isTouchRemote?: boolean;
};

export type ShareFrameIdParam = {
  appId: string;
};
