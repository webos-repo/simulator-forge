import "@/renderer/styles/global.css";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppExitScreen from "@/renderer/screen/appExit/appExitScreen";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <AppExitScreen />
  </StrictMode>,
);
