import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],

  build: {
    rollupOptions: {
      input: {
        main_window: path.resolve(
          __dirname,
          "src",
          "renderer",
          "screen",
          "abc.html",
        ),
        main_screen: path.resolve(
          __dirname,
          "src",
          "renderer",
          "screen",
          "mainScreen.html",
        ),
      },
    },
  },
});
