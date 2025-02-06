import path from "path";

type TargetDirNames = "assets" | "extra" | "release";

function getRootPathDev() {
  if (process.env.NODE_ENV === "production") throw new Error();
  return path.resolve(
    __dirname,
    process.type === "renderer" ? "../.." : "../../..",
  );
}

export function getTargetDirPath(targetDirName: TargetDirNames) {
  const dirPath = targetDirName === "assets" ? "src/assets" : targetDirName;
  return process?.env.NODE_ENV === "production"
    ? path.resolve(process.resourcesPath, dirPath)
    : path.resolve(getRootPathDev(), dirPath);
}

export function getTargetFilePath(
  targetDirName: TargetDirNames,
  ...paths: string[]
) {
  return path.resolve(getTargetDirPath(targetDirName), ...paths);
}
