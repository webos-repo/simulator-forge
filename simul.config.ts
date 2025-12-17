const webOSTVVersion = "26";
const version = "1.5.0";
const isDevBranch = true;

export const simulConfig = {
  name: `webOS TV ${webOSTVVersion} Simulator`,
  exeName: `webOS_TV_${webOSTVVersion}_Simulator_${version}`,
  webOSTVVersion,
  version,
  isDevBranch,
} as const;
