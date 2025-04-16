import "@/renderer/styles/global.css";
import AppExitScreen from "@/renderer/screen/appExit/appExitScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppExitScreen />
  </StrictMode>,
);
