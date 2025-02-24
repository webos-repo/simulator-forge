import AppListTopBar from "@/renderer/screen/main/appList/appListTopBar";
import { Pagination, Tab, Tabs } from "@heroui/react";
import { tv } from "tailwind-variants";

export default function AppListPanel() {
  return (
    <section className={tLayout()}>
      <Tabs aria-label="Tabs" size="lg" variant="underlined">
        <Tab key="App" title="App" className="h-full flex flex-col gap-2">
          <AppListTopBar />
          <section className={tListBox()}>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
            <div className={tContentBox()}>abc</div>
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
        </Tab>
        <Tab
          key="Service"
          title="Service"
          className="h-full flex flex-col gap-2"
        ></Tab>
      </Tabs>
    </section>
  );
}

const tLayout = tv({
  base: ["grow relative", "flex flex-col gap-2", "w-full h-full py-1 px-1"],
});

const tListBox = tv({
  base: ["grow", "grid grid-cols-4 grid-rows-3 gap-2"],
});

const tContentBox = tv({
  base: ["w-full h-full", "bg-neutral-800 rounded-lg"],
});

const tPaginationBox = tv({
  base: ["w-full", "flex justify-center items-center"],
});
