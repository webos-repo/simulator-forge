import "@/renderer/styles/global.css";
import RCUScreen from "@/renderer/screen/rcu/rcuScreen";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <RCUScreen />
  </StrictMode>,
);
