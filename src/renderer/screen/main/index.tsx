import "@/renderer/styles/global.css";
import { HeroUIProvider } from "@heroui/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainScreen from "@/renderer/screen/main/mainScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <MainScreen />
    </HeroUIProvider>
  </StrictMode>,
);
