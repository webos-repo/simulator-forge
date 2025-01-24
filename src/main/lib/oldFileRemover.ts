import fs from 'fs';
import os from 'os';
import path from 'path';

const WebOSServiceFileName = 'webos-service.js';
const HomeNodeModules = path.resolve(os.homedir(), 'node_modules');
const WebOSServiceFilePath = path.resolve(
  HomeNodeModules,
  WebOSServiceFileName
);

export function removeWebOSServiceFile() {
  try {
    fs.rmSync(
      isOnlyWebOSServiceFile() ? HomeNodeModules : WebOSServiceFilePath,
      {
        force: true,
        recursive: true,
      }
    );
  } catch {
    // pass
  }
}

function isOnlyWebOSServiceFile() {
  const fileNames = fs.readdirSync(HomeNodeModules);
  return fileNames.length === 1 && fileNames[0] === WebOSServiceFileName;
}
