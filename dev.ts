import * as fs from "node:fs";
import * as path from "node:path";
import archiver from "archiver";
import { rimrafSync } from "rimraf";
import { simulConfig } from "./simul.config";

const extraDir = path.join(__dirname, "extra");
const outDir = path.join(__dirname, "abc");
const publishDir = path.join(outDir, "publish2");
const tmpDir = path.join(outDir, "tmp2");
const packageDir = path.join(
  __dirname,
  "abc",
  "webOS_TV_25_Simulator_0.0.1-darwin-arm64",
);

const ext: Record<string, string> = {
  win32: "exe",
  linux: "AppImage",
  darwin: "app",
};

const pre = () => {
  rimrafSync(publishDir);
  rimrafSync(tmpDir);
  fs.mkdirSync(publishDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });
};

const main = () => {
  const appName = `${simulConfig.exeName}.${ext[process.platform]}`;
  const zipOutputPath = path.join(publishDir, `${simulConfig.exeName}.zip`);
  const writeStream = fs.createWriteStream(zipOutputPath);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  writeStream.on("close", () => {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed.",
    );
  });

  writeStream.on("end", () => {
    console.log("Data has been drained");
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(writeStream);
  archive.directory(extraDir, simulConfig.exeName);
  if (process.platform === "linux") {
    archive.file(tmpDir, {
      name: path.join(simulConfig.exeName, appName),
    });
  } else {
    archive.directory(packageDir, path.join(simulConfig.exeName));
  }
  archive.finalize();
};

// pre();
// main();
console.log(path.basename(packageDir));
