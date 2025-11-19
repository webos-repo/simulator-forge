import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ScreenSaverScreen from "@/renderer/screen/screenSaver/screenSaverScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ScreenSaverScreen />
  </StrictMode>,
);
