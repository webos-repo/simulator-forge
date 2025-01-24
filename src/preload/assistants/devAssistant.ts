import { ipcRenderer, webFrame } from 'electron';
import ApiKeys from '../lib/ApiKeys';

export function getTestApi() {
  return {
    api1: () => {
      console.log('expose', document);
    },
  };
}

export function setIpcListener() {
  const { Root, SimulTest } = ApiKeys;
  ipcRenderer
    .on('preload-test1', () => {})
    .on('preload-test2', () => {})
    .on('preload-test3', () => {});
}
