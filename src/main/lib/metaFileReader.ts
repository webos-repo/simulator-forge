import type { AppInfo, AppInfoJson } from "@share/structure/appInfo";
import type { ServiceJson } from "@share/structure/serviceInfo";
import fs from "fs";
import path from "path";
import LogMessage from "./logMessage";
import { convertResourcePath } from "@/share/lib/paths";

const readJsonFile = (filePath: string, fileName: string) => {
  if (!fs.existsSync(filePath)) throw new Error();
  if (fs.lstatSync(filePath).isDirectory()) {
    return JSON.parse(fs.readFileSync(path.join(filePath, fileName), "utf8"));
  }
  return JSON.parse(
    fs.readFileSync(path.join(path.dirname(filePath), fileName), "utf8"),
  );
};

const readAppInfoJson = (appPath: string): AppInfoJson => {
  try {
    return readJsonFile(appPath, "appinfo.json");
  } catch {
    throw new LogMessage(
      "error",
      "App launch error",
      `Can not found 'appinfo.json' in ${appPath}.`,
    );
  }
};

const readIconRaw = ({
  largeIcon,
  icon,
  appPath,
}: {
  largeIcon: AppInfoJson["largeIcon"];
  icon: AppInfoJson["icon"];
  appPath: string;
}): string => {
  const iconPath = largeIcon
    ? path.join(appPath, largeIcon)
    : icon
      ? path.join(appPath, icon)
      : convertResourcePath("icon", "icon.png");
  const iconRaw = fs.readFileSync(iconPath).toString("base64");
  return `data:image/${iconPath.slice(-3)};base64,${iconRaw}`;
};

const readAppInfo = (appPath: string): AppInfo => {
  const appInfoJson = readAppInfoJson(appPath);
  const iconRaw = readIconRaw({
    largeIcon: appInfoJson.largeIcon,
    icon: appInfoJson.icon,
    appPath,
  });
  return {
    ...appInfoJson,
    appPath,
    iconRaw,
  };
};

const readAppEntry = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    throw new LogMessage(
      "error",
      "App launch error",
      `Can not access ${dirPath}`,
    );
  }
  if (!fs.lstatSync(dirPath).isDirectory()) {
    throw new LogMessage(
      "error",
      "App launch error",
      `${dirPath} is not directory.`,
    );
  }
  const appInfo = readAppInfoJson(dirPath);
  return path.join(dirPath, appInfo.main);
};

const readPackageJson = (filePath: string) => {
  try {
    return readJsonFile(filePath, "package.json");
  } catch {
    throw new LogMessage(
      "error",
      "Service add error",
      `Can not found 'package.json' in this directory.`,
    );
  }
};

const readServiceJson = (dirPath: string): ServiceJson => {
  try {
    return readJsonFile(dirPath, "services.json");
  } catch {
    throw new LogMessage(
      "error",
      "Service add error",
      `Can not found 'services.json' in ${dirPath}`,
    );
  }
};

const readServiceEntry = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    throw new LogMessage(
      "error",
      "Service add error",
      `Can not access ${dirPath}`,
    );
  }
  if (!fs.lstatSync(dirPath).isDirectory()) {
    throw new LogMessage(
      "error",
      "Service add error",
      `${dirPath} is not directory.`,
    );
  }
  const { main } = readPackageJson(dirPath);
  if (!main) {
    throw new LogMessage(
      "error",
      "Service add error",
      `Can not found 'main' in 'package.json'.`,
    );
  }

  return path.join(dirPath, main);
};

export {
  readAppInfoJson,
  readAppInfo,
  readAppEntry,
  readServiceJson,
  readServiceEntry,
};
