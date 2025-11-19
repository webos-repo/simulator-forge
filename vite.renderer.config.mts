import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
// import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
  plugins: [react(), tsconfigPaths()],

  build: {
    target: "es2022",
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
