import type { AppInfo, AppInfoJson } from '@share/structure/appInfo';
import type { ServiceJson } from '@share/structure/serviceInfo';
import fs from 'fs';
import path from 'path';
import LogMessage from './logMessage';

const readJsonFile = (filePath: string, fileName: string) => {
  if (!fs.existsSync(filePath)) throw new Error();
  if (fs.lstatSync(filePath).isDirectory()) {
    return JSON.parse(fs.readFileSync(path.join(filePath, fileName), 'utf8'));
  }
  return JSON.parse(
    fs.readFileSync(path.join(path.dirname(filePath), fileName), 'utf8')
  );
};

const readAppInfoJson = (appPath: string): AppInfoJson => {
  try {
    return readJsonFile(appPath, 'appinfo.json');
  } catch {
    throw new LogMessage(
      'error',
      'App launch error',
      `Can not found 'appinfo.json' in ${appPath}.`
    );
  }
};

const readAppInfo = (appPath: string): AppInfo => ({
  ...readAppInfoJson(appPath),
  appPath,
});

const readAppEntry = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    throw new LogMessage(
      'error',
      'App launch error',
      `Can not access ${dirPath}`
    );
  }
  if (!fs.lstatSync(dirPath).isDirectory()) {
    throw new LogMessage(
      'error',
      'App launch error',
      `${dirPath} is not directory.`
    );
  }
  const appInfo = readAppInfoJson(dirPath);
  return path.join(dirPath, appInfo.main);
};

const readPackageJson = (filePath: string) => {
  try {
    return readJsonFile(filePath, 'package.json');
  } catch {
    throw new LogMessage(
      'error',
      'Service add error',
      `Can not found 'package.json' in this directory.`
    );
  }
};

const readServiceJson = (dirPath: string): ServiceJson => {
  try {
    return readJsonFile(dirPath, 'services.json');
  } catch {
    throw new LogMessage(
      'error',
      'Service add error',
      `Can not found 'services.json' in ${dirPath}`
    );
  }
};

const readServiceEntry = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    throw new LogMessage(
      'error',
      'Service add error',
      `Can not access ${dirPath}`
    );
  }
  if (!fs.lstatSync(dirPath).isDirectory()) {
    throw new LogMessage(
      'error',
      'Service add error',
      `${dirPath} is not directory.`
    );
  }
  const { main } = readPackageJson(dirPath);
  if (!main) {
    throw new LogMessage(
      'error',
      'Service add error',
      `Can not found 'main' in 'package.json'.`
    );
  }

  return path.join(dirPath, main);
};

export {
  readAppInfoJson,
  readAppInfo,
  readAppEntry,
  readServiceJson,
  readServiceEntry,
};
