import "@/renderer/styles/global.css";
import JSServiceScreen from "@/renderer/screen/jsService/jsServiceScreen";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <JSServiceScreen />
  </StrictMode>,
);
