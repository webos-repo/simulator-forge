import "core-js/stable";
import { AppController } from "@/main/controller/appController";
import { dbInit } from "@/main/controller/dbController";
import jsServiceController from "@/main/controller/jsServiceController";
import overlayController from "@/main/controller/overlayController";
import { TouchController } from "@/main/controller/touchController";
import windowController from "@/main/controller/windowController";
import { removeWebOSServiceFile } from "@/main/lib/oldFileRemover";
import { setSimulInfoToDB } from "@/main/lib/simulatorInfo";
import { getUserAgents } from "@/main/lib/userAgents";
import { checkVersion } from "@/main/lib/versionChecker";
import menuBuilder from "@/main/menu";
import analytics from "@/main/module/analytics";
import { initServiceHandler } from "@/main/service/service";
import { turnOnDevMode } from "@/main/settings/devMode";
import { tvLocation, tvNetwork } from "@/main/tvSettings/index";
import { app, session } from "electron";
import started from "electron-squirrel-startup";

if (started) {
  app.quit();
}

// for iframe access
app.commandLine.appendSwitch("disable-site-isolation-trials");
app.commandLine.appendSwitch("disable-features", "WidgetLayering");

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

function appGlobalSetting() {
  session.defaultSession.setUserAgent(getUserAgents());
}

async function startSimulator() {
  try {
    appGlobalSetting();
    await Promise.allSettled([
      tvLocation.updateLocationData(),
      tvNetwork.updateNetworkInfo(),
    ]);

    if (import.meta.env.DEV) {
      turnOnDevMode();
    }
    checkVersion();
    setSimulInfoToDB();

    initServiceHandler();
    AppController.init();
    TouchController.init();
    await windowController.initialize();
    overlayController.initialize();
    jsServiceController.initialize();

    menuBuilder.setEventListener();
    menuBuilder.buildMenu();
    analytics.init();
  } catch {
    console.error("[Failure] The simulator launch is failed.");
    return;
  }
  console.info("[Success] The simulator launch is successful.");
}
