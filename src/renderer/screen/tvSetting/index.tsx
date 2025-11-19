import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TvSettingScreen from "@/renderer/screen/tvSetting/tvSettingScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TvSettingScreen />
  </StrictMode>,
);
