import * as fs from "node:fs";
import * as path from "node:path";
import { MakerZIP } from "@electron-forge/maker-zip";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { ForgeConfig } from "@electron-forge/shared-types";
import MakerAppImage from "@pengx17/electron-forge-maker-appimage";
import * as archiver from "archiver";
import { rimrafSync } from "rimraf";
import { simulConfig } from "./simul.config";

const outDir = path.join(__dirname, "out");
const publishDir = path.join(outDir, "publish");
const tmpDir = path.join(outDir, "tmp");
const extraDir = path.join(__dirname, "extra");
let output: string;

const config: ForgeConfig = {
  packagerConfig: {
    name: simulConfig.exeName,
    executableName: simulConfig.exeName,
    appVersion: simulConfig.version,
    extraResource: ["./resource"],
    icon: "./resource/icon/icon.png",
    asar: true,

    ...(simulConfig.isDevBranch
      ? {}
      : {
          osxSign: {},
          osxNotarize: {
            appleId: process.env.APPLE_ID as string,
            appleIdPassword: process.env.APPLE_PASSWORD as string,
            teamId: process.env.APPLE_TEAM_ID as string,
          },
        }),
  },
  makers: [
    // windows
    // new MakerSquirrel({}),

    // ubuntu
    new MakerAppImage({
      options: {
        bin: simulConfig.name,
        name: simulConfig.name,
        productName: simulConfig.name,
        genericName: simulConfig.name,
      },
    }),

    // macOS, windows
    ...(process.platform !== "linux" ? [new MakerZIP({})] : []),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload/preloadApp.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
        {
          entry: "src/preload/preloadSimul.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
  ],
  hooks: {
    prePackage: async () => {
      rimrafSync(publishDir);
      rimrafSync(tmpDir);
      fs.mkdirSync(publishDir, { recursive: true });
      fs.mkdirSync(tmpDir, { recursive: true });
    },
    postPackage: async (_config, result) => {
      if (process.platform === "linux") {
        return;
      }
      output = result.outputPaths[0];
    },
    postMake: async (_config, result) => {
      if (process.platform === "linux") {
        output = result[0].artifacts[0];
      }

      const name = simulConfig.exeName;
      const zipOutputPath = path.join(publishDir, `${name}.zip`);
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
      archive.directory(extraDir, name);

      console.log(">>>> output:", output);
      if (process.platform === "linux") {
        archive.file(output, {
          name: `${name}/${path.basename(output)}`,
        });
      } else {
        archive.directory(output, name);
      }
      archive.finalize();
    },
  },
};

export default config;
