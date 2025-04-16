const webOSTVVersion = "25";
const version = "0.0.1";
const isDevBranch = true;

export const simulConfig = {
  name: `webos-tv-${webOSTVVersion}-simulator`,
  webOSTVVersion,
  version,
  isDevBranch,
} as const;
