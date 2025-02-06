import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const getWindowPath = (windowName: string) =>
  path.resolve(
    __dirname,
    "src",
    "renderer",
    "screen",
    windowName,
    "index.html",
  );

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],

  build: {
    rollupOptions: {
      input: {
        app_exit_window: getWindowPath("appExit"),
        app_list_window: getWindowPath("appList"),
        js_service_window: getWindowPath("jsService"),
        main_window: getWindowPath("main"),
        rcu_window: getWindowPath("rcu"),
        screen_saver_window: getWindowPath("screenSaver"),
        touch_window: getWindowPath("touch"),
        touch_remote_window: getWindowPath("touchRemote"),
        tv_setting_window: getWindowPath("tvSetting"),
        vkb_window: getWindowPath("vkb"),
      },
    },
  },
});
