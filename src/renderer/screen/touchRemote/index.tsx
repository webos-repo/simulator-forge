import "@/renderer/styles/global.css";
import TouchRemoteScreen from "@/renderer/screen/touchRemote/touchRemoteScreen";
import GlobalStyles from "@/renderer/styles/globalStyles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <TouchRemoteScreen />
  </StrictMode>,
);
