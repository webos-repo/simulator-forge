import "@/renderer/styles/global.css";
import TvSettingScreen from "@/renderer/screen/tvSetting/tvSettingScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TvSettingScreen />
  </StrictMode>,
);
