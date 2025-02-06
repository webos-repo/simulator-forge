import { BrowserWindow } from "electron";
import path from "path";

export function loadWindow(targetWindow: BrowserWindow, windowName: string) {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    targetWindow.loadURL(
      `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/screen/${windowName}/index.html`,
    );
  } else {
    targetWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/src/renderer/screen/${windowName}/index.html`,
      ),
    );
  }
}
