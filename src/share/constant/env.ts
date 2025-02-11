import { simulConfig } from "@/../simul.config";

const isDevBuild = process.env.NODE_ENV === "development";
const isProdBuild = process.env.NODE_ENV === "production";
const isDev = isDevBuild || simulConfig.isDevBranch;

export { isDev, isDevBuild, isProdBuild };
