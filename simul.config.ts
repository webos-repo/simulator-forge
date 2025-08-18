const webOSTVVersion = "25";
const version = "1.4.3";
const isDevBranch = false;

export const simulConfig = {
  name: `webOS TV ${webOSTVVersion} Simulator`,
  exeName: `webOS_TV_${webOSTVVersion}_Simulator_${version}`,
  webOSTVVersion,
  version,
  isDevBranch,
} as const;
