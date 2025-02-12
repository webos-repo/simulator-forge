import "@/renderer/styles/global.css";
import TouchRemoteScreen from "@/renderer/screen/touchRemote/touchRemoteScreen";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TouchRemoteScreen />
  </StrictMode>,
);
