import "@/renderer/styles/global.css";
import TouchScreen from "@/renderer/screen/touch/touchScreen";
import GlobalStyles from "@/renderer/styles/GlobalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <TouchScreen />
  </StrictMode>,
);
