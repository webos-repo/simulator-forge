import ApiKeys from '../lib/ApiKeys';
import { functionRunner } from '../lib/functionRunner';

const { Root } = ApiKeys;

export function setAppWindowListener() {
  setDetailFlatten();
}

function setDetailFlatten() {
  functionRunner(() => {
    function detailFlatten(event: any) {
      if (!event.detail) return;
      Object.keys(event.detail).forEach((key) => {
        event[key] = event.detail[key];
      });
    }

    window.addEventListener('keyboardStateChange', detailFlatten, true);
    window.addEventListener('cursorStateChange', detailFlatten, true);
    window.addEventListener('screenOrientationChange', detailFlatten, true);
  });
}
