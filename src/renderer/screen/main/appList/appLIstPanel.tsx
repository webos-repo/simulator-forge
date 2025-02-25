import AppCard from "@/renderer/component/appCard";
import AppListTopBar from "@/renderer/screen/main/appList/appListTopBar";
import { ipcHandler } from "@/share/lib/utils";
import { AppInfoWithState } from "@/share/structure/appInfo";
import { Pagination, Tab, Tabs } from "@heroui/react";
import React from "react";
import { tv } from "tailwind-variants";

export default function AppListPanel() {
  const [appInfos, setAppInfos] = React.useState<AppInfoWithState[]>();

  React.useEffect(() => {
    window.ipcRenderer.on(
      "app-list-updated",
      ipcHandler((data: string) => {
        setAppInfos(JSON.parse(data));
      }),
    );
  }, []);

  return (
    <section className={tLayout()}>
      <Tabs aria-label="Tabs" size="lg" variant="underlined">
        <Tab key="App" title="App">
          <div className={tTapBox()}>
            <AppListTopBar />
            <section className={tListBox()}>
              {appInfos?.map((appInfo) => (
                <AppCard appInfo={appInfo} key={appInfo.id} />
              ))}
              {appInfos?.map((appInfo) => (
                <AppCard appInfo={appInfo} key={appInfo.id} />
              ))}
              {appInfos?.map((appInfo) => (
                <AppCard appInfo={appInfo} key={appInfo.id} />
              ))}
              {appInfos?.map((appInfo) => (
                <AppCard appInfo={appInfo} key={appInfo.id} />
              ))}
              {appInfos?.map((appInfo) => (
                <AppCard appInfo={appInfo} key={appInfo.id} />
              ))}
            </section>
            <div className={tPaginationBox()}>
              <Pagination
                initialPage={1}
                total={10}
                variant="light"
                color="default"
                size="sm"
              />
            </div>
          </div>
        </Tab>
        <Tab key="Service" title="Service">
          <div className={tTapBox()}></div>
        </Tab>
      </Tabs>
    </section>
  );
}

const tLayout = tv({
  base: ["relative", "flex flex-col gap-4", "w-full py-4 px-8 overflow-hidden"],
});

const tTapBox = tv({
  base: ["flex flex-col gap-6 h-full justify-between"],
});

const tListBox = tv({
  base: ["grid grid-cols-4 grid-rows-3 auto-rows-fr gap-x-8 gap-y-6 grow"],
});

const tPaginationBox = tv({
  base: ["w-full", "flex justify-center items-center"],
});
