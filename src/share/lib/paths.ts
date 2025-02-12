import path from "path";

export function convertResourcePath(...paths: string[]) {
  const resDir = import.meta.env.DEV
    ? path.resolve(__dirname, "..", "..", "resource")
    : path.resolve(process.resourcesPath, "resource");
  return path.resolve(resDir, ...paths);
}
