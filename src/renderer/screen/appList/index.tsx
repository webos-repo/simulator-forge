import "@/renderer/styles/global.css";
import AppListScreen from "@/renderer/screen/appList/appListScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppListScreen />
  </StrictMode>,
);
