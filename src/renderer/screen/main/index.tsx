import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainScreen from "@/renderer/screen/main/mainScreen";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer, Flip } from "react-toastify";

import "@/renderer/styles/global.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <MainScreen />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnFocusLoss={false}
        theme="dark"
        transition={Flip}
      />
    </HeroUIProvider>
  </StrictMode>,
);
