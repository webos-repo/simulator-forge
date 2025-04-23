import { cpSync, mkdirSync } from "node:fs";
// import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerZIP } from "@electron-forge/maker-zip";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { ForgeConfig } from "@electron-forge/shared-types";
import MakerAppImage from "@pengx17/electron-forge-maker-appimage";
import { rimrafSync } from "rimraf";
import { simulConfig } from "./simul.config";

const outDir = "./out";
const publishDir = `${outDir}/publish`;
const tmpDir = `${outDir}/tmp`;

const config: ForgeConfig = {
  packagerConfig: {
    name: simulConfig.exeName,
    executableName: simulConfig.exeName,
    appVersion: simulConfig.version,
    extraResource: ["./resource"],
    icon: "./resource/icon/icon.png",
    asar: true,

    // macOS signing and notarization

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
    preStart: async () => {
      rimrafSync(publishDir);
      rimrafSync(tmpDir);
      mkdirSync(publishDir, { recursive: true });
      mkdirSync(tmpDir, { recursive: true });
    },
    postPackage: async (_config, result) => {
      if (process.platform === "linux") {
        console.log("[postPackage] is Linux!!!!!!!");
        return;
      }
      const packageDir = result.outputPaths[0];
      cpSync(packageDir, tmpDir, { recursive: true });
    },
    postMake: async (_config, result) => {
      if (process.platform === "linux") {
        console.log(result[0].artifacts[0]);
      }
      rimrafSync(tmpDir);
    },
  },
};

export default config;
