import "@/renderer/styles/global.css";
import ScreenSaverScreen from "@/renderer/screen/screenSaver/screenSaverScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ScreenSaverScreen />
  </StrictMode>,
);
