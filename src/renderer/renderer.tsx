import GlobalStyles from "@/renderer/styles/GlobalStyles";
import "./global.css";
// import App from "@/renderer/App";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { BrowserRouter, Route, Routes } from "react-router";
import MainScreen from "@/renderer/screen/MainScreen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <MainScreen />
  </StrictMode>,
);
