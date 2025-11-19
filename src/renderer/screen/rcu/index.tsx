import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RCUScreen from "@/renderer/screen/rcu/rcuScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RCUScreen />
  </StrictMode>,
);
