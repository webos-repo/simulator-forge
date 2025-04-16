import "@/renderer/styles/global.css";
import MainScreen from "@/renderer/screen/main/mainScreen";
import { HeroUIProvider } from "@heroui/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <MainScreen />
    </HeroUIProvider>
  </StrictMode>,
);
