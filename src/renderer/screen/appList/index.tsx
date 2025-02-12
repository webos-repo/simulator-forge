import "@/renderer/styles/global.css";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppListScreen from "@/renderer/screen/appList/appListScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <AppListScreen />
  </StrictMode>,
);
