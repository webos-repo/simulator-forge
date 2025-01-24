import appState from '../assistants/appState';
import ApiKeys from './ApiKeys';
import { functionRunner } from './functionRunner';
import { ipcRenderer } from 'electron';

export function wrapWindowApis() {
  ipcRenderer.once('wrap-window-api', () => {
    wrapWindowOpen();
    wrapWindowClose();
  });
}

function wrapWindowOpen() {
  const RootKey = ApiKeys.Root;
  const IsolateBridgeKey = ApiKeys.IsolateBridge;
  functionRunner(
    () => {
      const originOpen = window.open;
      window.open = (...args) => {
        if (window[RootKey][IsolateBridgeKey].windowOpen(...args))
          return window;
        return originOpen(...args);
      };
    },
    { replace: { RootKey, IsolateBridgeKey } }
  );
}

function wrapWindowClose() {
  functionRunner(
    appState.isMainFrame
      ? () => {
          window.close = () => window.webOSSystem.close();
        }
      : () => {
          window.close = () => {};
        }
  );
}
