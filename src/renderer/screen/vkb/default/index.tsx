import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import VkbScreen from "@/renderer/screen/vkb/vkbScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VkbScreen inputType="default" />
  </StrictMode>,
);
