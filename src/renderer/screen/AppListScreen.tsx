import { useState, useEffect } from "react";
import { ipcHandler } from "@share/lib/utils";
import AppList from "../component/AppList";
import type { AppInfoWithState } from "@share/structure/appInfo";
import ListViewer from "../component/ListViewer";
import { ipcSender } from "../lib/utils";

const AppListScreen = () => {
  const [appInfos, setAppInfos] = useState<AppInfoWithState[]>([]);

  const handleAppListUpdated = (appListDataStr: string) => {
    setAppInfos(JSON.parse(appListDataStr));
  };

  useEffect(() => {
    window.ipcRenderer.on("app-list-updated", ipcHandler(handleAppListUpdated));
    window.ipcRenderer.send("app-list-screen-loaded");
  }, []);

  return (
    <ListViewer
      title="App List"
      plusButtonHandler={ipcSender("open-app-dialog")}
    >
      {appInfos?.map((appInfo, idx) => <AppList appInfo={appInfo} key={idx} />)}
    </ListViewer>
  );
};

export default AppListScreen;
