import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainScreen from "@/renderer/screen/main/mainScreen";
import { HeroUIProvider } from "@heroui/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <MainScreen />
    </HeroUIProvider>
  </StrictMode>,
);
