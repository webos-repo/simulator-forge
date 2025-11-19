import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TouchScreen from "@/renderer/screen/touch/touchScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TouchScreen />
  </StrictMode>,
);
