import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppListScreen from "@/renderer/screen/appList/appListScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppListScreen />
  </StrictMode>,
);
