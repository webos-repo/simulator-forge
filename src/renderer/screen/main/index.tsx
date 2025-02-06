import "@/renderer/styles/global.css";
import GlobalStyles from "@/renderer/styles/GlobalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainScreen from "@/renderer/screen/main/mainScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <MainScreen />
  </StrictMode>,
);
