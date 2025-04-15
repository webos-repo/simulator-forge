import { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { simulConfig } from "./simul.config";

const config: ForgeConfig = {
  packagerConfig: {
    name: simulConfig.name,
    executableName: simulConfig.name,
    appVersion: simulConfig.version,
    extraResource: ["./extra", "./resource"],
    icon: "./resource/icon/icon.png",
    asar: true,

    // macOS signing and notarization
    osxSign: {},
    osxNotarize: {
      appleId: process.env.APPLE_ID as string,
      appleIdPassword: process.env.APPLE_PASSWORD as string,
      teamId: process.env.APPLE_TEAM_ID as string,
    },
  },
  rebuildConfig: {},
  makers: [
    // windows
    new MakerSquirrel({}),

    // linux
    new MakerDeb({
      options: {
        bin: simulConfig.name,
        name: simulConfig.name,
        productName: simulConfig.name,
        genericName: simulConfig.name,
      },
    }),

    // macOS
    new MakerDMG({
      format: "ULFO",
    }),
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
};

export default config;
