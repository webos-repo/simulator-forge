import { useEffect, useState } from "react";
import type { JSServiceProps } from "@/renderer/component/jsService";
import JSService from "@/renderer/component/jsService";
import ListViewer from "@/renderer/component/listViewer";
import { ipcSender } from "@/renderer/lib/utils";
import { ipcHandler } from "@/share/lib/utils";

export default function JSServiceScreen() {
  const [jsServiceDataList, setJsServiceDataList] = useState<JSServiceProps[]>(
    [],
  );

  useEffect(() => {
    window.ipcRenderer.on(
      "update-js-service-list",
      ipcHandler((data: string) => {
        setJsServiceDataList(JSON.parse(data));
      }),
    );
    window.ipcRenderer.send("js-service-screen-loaded");
  }, []);

  return (
    <ListViewer
      title="JS Service"
      plusButtonHandler={ipcSender("open-service-dialog")}
    >
      {jsServiceDataList?.map((jsServiceData) => (
        <JSService {...jsServiceData} key={jsServiceData.id} />
      ))}
    </ListViewer>
  );
}
