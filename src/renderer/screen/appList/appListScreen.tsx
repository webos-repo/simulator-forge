import AppList from "@/renderer/component/appList";
import ListViewer from "@/renderer/component/listViewer";
import { ipcSender } from "@/renderer/lib/utils";
import { ipcHandler } from "@/share/lib/utils";
import type { AppInfoWithState } from "@/share/structure/appInfo";
import { useEffect, useState } from "react";

export default function AppListScreen() {
  const [appInfos, setAppInfos] = useState<AppInfoWithState[]>([]);

  useEffect(() => {
    const handleAppListUpdated = (appListDataStr: string) => {
      setAppInfos(JSON.parse(appListDataStr));
    };

    window.ipcRenderer.on("app-list-updated", ipcHandler(handleAppListUpdated));
    window.ipcRenderer.send("app-list-screen-loaded");
  }, []);

  return (
    <ListViewer
      title="App List"
      plusButtonHandler={ipcSender("open-app-dialog")}
    >
      {appInfos?.map((appInfo) => (
        <AppList appInfo={appInfo} key={appInfo.id} />
      ))}
    </ListViewer>
  );
}
