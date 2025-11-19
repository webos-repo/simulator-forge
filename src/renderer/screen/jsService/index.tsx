import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JSServiceScreen from "@/renderer/screen/jsService/jsServiceScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JSServiceScreen />
  </StrictMode>,
);
