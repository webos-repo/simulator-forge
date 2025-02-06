import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const getScreenPath = (windowName: string) =>
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
        main_window: getScreenPath("main"),
        rcu_window: getScreenPath("rcu"),
        app_list_window: getScreenPath("appList"),
        js_service_window: getScreenPath("jsService"),
        tv_setting_window: getScreenPath("tvSetting"),
        app_exit_view: getScreenPath("appExit"),
        screen_saver_view: getScreenPath("screenSaver"),
        touch_view: getScreenPath("touch"),
        touch_remote_view: getScreenPath("touchRemote"),
        vkb_default_view: getScreenPath("vkb/default"),
        vkb_number_view: getScreenPath("vkb/number"),
      },
    },
  },
});
