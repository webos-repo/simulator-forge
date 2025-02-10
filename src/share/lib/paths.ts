import path from "path";

type TargetDirNames = "assets" | "extra" | "release";

export function getTargetDirPath(targetDirName: TargetDirNames) {
  const dirPath = targetDirName === "assets" ? "src/assets" : targetDirName;
  return process?.env.NODE_ENV === "production"
    ? path.resolve(process.resourcesPath, dirPath)
    : path.resolve(__dirname, "..", "..", dirPath);
}

export function getTargetFilePath(
  targetDirName: TargetDirNames,
  ...paths: string[]
) {
  return path.resolve(getTargetDirPath(targetDirName), ...paths);
}
