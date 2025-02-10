import path from "path";

export function convertResourcePath(...paths: string[]) {
  const resDir =
    process.env.NODE_ENV === "production"
      ? path.resolve(process.resourcesPath, "resource")
      : path.resolve(__dirname, "..", "..", "resource");
  return path.resolve(resDir, ...paths);
}
