/* eslint-disable global-require */
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import "@service/Service";
import { dbInit } from "@controller/dbController";
import analytics from "@main/module/analytics";
import { setSimulInfoToDB } from "./lib/simulatorInfo";
import { checkVersion } from "./lib/versionChecker";
import { removeWebOSServiceFile } from "./lib/oldFileRemover";
import { app, session } from "electron";
import menuBuilder from "@main/menu";
import jsServiceController from "@controller/JSServiceController";
import windowController from "@controller/WindowController";
import overlayController from "@controller/OverlayController";
import { getUserAgents } from "./lib/userAgents";
import { turnOnDevMode } from "@settings/devMode";
import { tvLocation, tvNetwork } from "@tvSettings/index";
import "@controller/StateController";
import "@controller/touchController";
import "@controller/appController";

// if (isProdBuild) {
//   const sourceMapSupport = require("source-map-support");
//   sourceMapSupport.install();
// } else if (isDevBuild) {
//   if (process.env.DEBUG_PROD === "true") {
//     require("electron-debug")();
//   }
// }

// for iframe access
app.commandLine.appendSwitch("disable-site-isolation-trials");

dbInit();
removeWebOSServiceFile();

app.on("window-all-closed", () => {
  app.exit();
});

app.on("ready", () => {
  startSimulator();
  app.on("activate", () => {
    if (!windowController.isMainWindowExist()) startSimulator();
  });
});

const startSimulator = async () => {
  try {
    appGlobalSetting();
    await Promise.allSettled([
      tvLocation.updateLocationData(),
      tvNetwork.updateNetworkInfo(),
    ]);

    if (process.env.NODE_ENV === "development") {
      turnOnDevMode();
    }
    checkVersion();
    setSimulInfoToDB();

    await windowController.initialize();
    overlayController.initialize();
    jsServiceController.initialize();

    menuBuilder.setEventListener();
    menuBuilder.buildMenu();
    analytics.init();
  } catch (e) {
    console.error("[Failure] The simulator launch is failed.");
    return;
  }
  console.info("[Success] The simulator launch is successful.");
};

const appGlobalSetting = () => {
  session.defaultSession.setUserAgent(getUserAgents());
};
