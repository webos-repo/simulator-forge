import path from 'path';

type TargetDirNames = 'assets' | 'extra' | 'release';

function getRootPathDev() {
  if (process.env.NODE_ENV === 'production') throw new Error();
  return path.resolve(
    __dirname,
    process.type === 'renderer' ? '../..' : '../../..'
  );
}

export function getTargetDirPath(targetDirName: TargetDirNames) {
  return process?.env.NODE_ENV === 'production'
    ? path.resolve(process.resourcesPath, targetDirName)
    : path.resolve(getRootPathDev(), targetDirName);
}

export function getTargetFilePath(
  targetDirName: TargetDirNames,
  ...paths: string[]
) {
  return path.resolve(getTargetDirPath(targetDirName), ...paths);
}
