import "@/renderer/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TouchRemoteScreen from "@/renderer/screen/touchRemote/touchRemoteScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TouchRemoteScreen />
  </StrictMode>,
);
