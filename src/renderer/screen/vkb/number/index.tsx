import "@/renderer/styles/global.css";
import VkbScreen from "@/renderer/screen/vkb/vkbScreen";
import GlobalStyles from "@/renderer/styles/GlobalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <VkbScreen inputType="number" />
  </StrictMode>,
);
