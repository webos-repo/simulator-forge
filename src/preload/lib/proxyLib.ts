export function setChangeListener(
  targetObj: any,
  targetKey: string,
  handler: any
) {
  // eslint-disable-next-line no-new
  new Proxy(targetObj, {
    set: (target: any, key: string, value: any) => {
      target[key] = value;
      if (key === targetKey) handler();
      return true;
    },
  });
}
