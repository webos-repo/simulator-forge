import type { RCUButtonEventType } from '@share/structure/events';
import type { RCU_Button } from '@share/structure/ipcParams';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { useState } from 'react';
import type React from 'react';

type UseRCUHandlerProps = {
  keyCode?: string;
  isTouchRemote?: boolean;
};

function useRCUHandler({ keyCode, isTouchRemote }: UseRCUHandlerProps) {
  const [isDown, setIsDown] = useState(false);
  const [backLongPressTimer, setBackLongPressTimer] =
    useState<NodeJS.Timeout | null>(null);

  if (!keyCode) {
    return {
      buttonHandler: undefined,
      leaveHandler: undefined,
    };
  }

  const buttonHandler = (e: React.MouseEvent) => {
    const rcuEventType = preProcess(e, setIsDown);
    if (!rcuEventType) return;

    if (keyCode !== 'Back') {
      ipcRenderer.send('rcu-button', {
        keyCode: keyCode!,
        rcuEventType,
        isTouchRemote: !!isTouchRemote,
      } as RCU_Button);
    } else {
      if (rcuEventType === 'down') {
        setBackLongPressTimer(
          setTimeout(() => {
            ipcRenderer.send('close-fg-app');
          }, 1000)
        );
      } else if (backLongPressTimer) {
        clearTimeout(backLongPressTimer);
        setBackLongPressTimer(null);
        ipcRenderer.send('rcu-back', !!isTouchRemote);
      }
    }
  };

  const leaveHandler = (e: React.MouseEvent) => {
    if (!isDown) return;
    buttonHandler(e);
  };

  return {
    buttonHandler,
    leaveHandler,
  };
}

const mouseToRCUEventMapping: { [key: string]: RCUButtonEventType } = {
  mousedown: 'down',
  mouseup: 'up',
  click: 'click',
};

const preProcess = (
  e: React.MouseEvent,
  setIsDown: (action: boolean) => void
) => {
  const rcuEventType = convertToRCUEventType(e);
  if (!rcuEventType || e.button !== 0) return null;
  setIsDown(rcuEventType === 'down');
  return rcuEventType;
};

const convertToRCUEventType = (e: React.MouseEvent) => {
  return _.get(mouseToRCUEventMapping, e.type, null);
};

export default useRCUHandler;
