import "@/renderer/styles/global.css";
import TvSettingScreen from "@/renderer/screen/tvSetting/tvSettingScreen";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <TvSettingScreen />
  </StrictMode>,
);
