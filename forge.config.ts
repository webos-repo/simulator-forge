import { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { simulConfig } from "./simul.config";

const config: ForgeConfig = {
  packagerConfig: {
    name: simulConfig.name,
    appVersion: simulConfig.version,
    extraResource: ["./extra", "./resource"],
    icon: "./resource/icon/icon.png",
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ["darwin"]),
    new MakerSquirrel({}),
    new MakerDeb({}),
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
