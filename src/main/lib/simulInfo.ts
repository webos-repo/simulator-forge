import { simulConfig } from "@/../simul.config";

const electronVersion = process.versions.electron;
const [eMajorVersion, eMiddleVersion, eMinorVersion] = electronVersion
  .split("-")[0]
  .split(".")
  .map((s) => parseInt(s, 10));

export const getElectronVersion = () => {
  return {
    version: electronVersion,
    major: eMajorVersion,
    middle: eMiddleVersion,
    minor: eMinorVersion,
  };
};

export type WebOSVersion = "6.0" | "22" | "23" | "24" | "25";

const WebOSVerFromElectronMajorVer: Record<string, WebOSVersion> = {
  8: "6.0",
  11: "22",
  15: "23",
  22: "24",
  28: "25",
};

export const getWebOSVersion = (): WebOSVersion => {
  const major = getElectronVersion().major.toString();
  return WebOSVerFromElectronMajorVer[major] || simulConfig.webOSTVVersion;
};

export const isWebOSVersionGte = (targetVersion: WebOSVersion) => {
  return Number(targetVersion) <= Number(getWebOSVersion());
};
