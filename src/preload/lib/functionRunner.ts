import { webFrame } from 'electron';

export function functionRunner(
  func: any,
  options: { args?: any[]; replace?: { [key: string]: any } } = {}
) {
  const funcStr = replaceVars(extractFunc(func), options.replace);
  const newArgs = argsToStr(options.args);
  const cmd = `(${funcStr})(${newArgs});`;
  webFrame.executeJavaScript(cmd, true);
}

function extractFunc(func: any) {
  const funcStr = func.toString();
  return funcStr.startsWith('function')
    ? funcStr.slice(funcStr.indexOf('('), funcStr.indexOf(')') + 1) +
        ' => ' +
        funcStr.slice(funcStr.indexOf(')') + 2)
    : funcStr.slice(funcStr.indexOf('('));
}

function replaceVars(str: string, replace: { [key: string]: any } = {}) {
  let replaceStr = str;
  Object.entries(replace).forEach(([key, value]) => {
    replaceStr = replaceStr.replace(
      new RegExp(key, 'g'),
      typeof value === 'string' ? `'${value}'` : `${value}`
    );
  });
  return replaceStr;
}

function argsToStr(args: any[] = []) {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return `'${arg}'`;
      return arg;
    })
    .join();
}
