const webOSTVVersion = "22";
const version = "0.0.1";

export const simulConfig = {
  name: `webos-tv-${webOSTVVersion}-simulator`,
  webOSTVVersion: webOSTVVersion,
  version: version,
  isDevBranch: true,
} as const;
