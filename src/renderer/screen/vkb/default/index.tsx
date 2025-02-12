import "@/renderer/styles/global.css";
import VkbScreen from "@/renderer/screen/vkb/vkbScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VkbScreen inputType="default" />
  </StrictMode>,
);
