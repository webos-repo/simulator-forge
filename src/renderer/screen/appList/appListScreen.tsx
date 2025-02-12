import { useState, useEffect } from "react";
import { ipcHandler } from "@/share/lib/utils";
import AppList from "@/renderer/component/AppList";
import type { AppInfoWithState } from "@/share/structure/appInfo";
import ListViewer from "@/renderer/component/ListViewer";
import { ipcSender } from "@/renderer/lib/utils";

export default function AppListScreen() {
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
}
