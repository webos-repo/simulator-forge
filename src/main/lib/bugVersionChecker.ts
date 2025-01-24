import { getWebOSVersion } from '@main/lib/simulInfo';

export function checkMacViewPositionBug() {
  return getWebOSVersion() === '24' && process.platform === 'darwin';
}
