const webOSTVVersion = "25";
const version = "0.0.1";
const isDevBranch = true;

export const simulConfig = {
  name: `webOS TV ${webOSTVVersion} Simulator`,
  exeName: `webOS_TV_${webOSTVVersion}_Simulator_${version}`,
  webOSTVVersion,
  version,
  isDevBranch,
} as const;
