import type { WebOSEnv } from '@share/structure/webOSEnv';

function parseEnv(key: string) {
  const rawValue = process.argv.find((argv) => argv.startsWith(`--${key}`));
  if (!rawValue) {
    return undefined;
  }
  return JSON.parse(rawValue.slice(rawValue.indexOf('{')));
}

export const webOSEnv: WebOSEnv = parseEnv('webos-env');
