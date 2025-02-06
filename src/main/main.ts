// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import "@service/Service";
// import analytics from "@main/module/analytics";
import { setSimulInfoToDB } from "@/main/lib/simulatorInfo";
import { checkVersion } from "@/main/lib/versionChecker";
import { removeWebOSServiceFile } from "@/main/lib/oldFileRemover";
import { app, session } from "electron";
import { getUserAgents } from "@/main/lib/userAgents";
import { tvLocation, tvNetwork } from "@/main/tvSettings/index";
import overlayController from "@/main/controller/OverlayController";
import windowController from "@/main/controller/WindowController";
import menuBuilder from "@/main/menu";
import { turnOnDevMode } from "@/main/settings/devMode";
import { dbInit } from "@/main/controller/dbController";
import AppController from "@/main/controller/appController";
// import "@controller/StateController";
// import "@controller/touchController";

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
    AppController.init();
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
    // jsServiceController.initialize();

    menuBuilder.setEventListener();
    menuBuilder.buildMenu();
    // analytics.init();
  } catch {
    console.error("[Failure] The simulator launch is failed.");
    return;
  }
  console.info("[Success] The simulator launch is successful.");
};

const appGlobalSetting = () => {
  session.defaultSession.setUserAgent(getUserAgents());
};
