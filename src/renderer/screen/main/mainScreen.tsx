import React from "react";
import { ipcHandler } from "@/share/lib/utils";
import { clearToast, showToast } from "@/renderer/lib/toastManager";
import AppBar from "@/renderer/screen/main/appBar/appBar";
import { Spinner } from "@heroui/react";
import MainIntro from "@/renderer/screen/main/mainIntro";
import WebOSNotification from "@/renderer/component/webOS/webOSNotification";
import { tv } from "tailwind-variants";
// import beanbird from "@/assets/beanbird-sky.jpg";

export default function MainScreen() {
  const [showIntro, setShowIntro] = React.useState(true);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [closeRotateVisible, setCloseRotateVisible] = React.useState(false);

  const whenIntroFinished = () => {
    setShowIntro(false);
    window.ipcRenderer.send("main-intro-finished");
  };

  React.useEffect(() => {
    document.addEventListener("mouseenter", () => {
      window.ipcRenderer.send("main-window-mouseenter");
    });
    window.ipcRenderer.on("set-spinner", ipcHandler(setShowSpinner));
    window.ipcRenderer.on("clear-main-screen", () => {
      setShowSpinner(false);
      clearToast();
    });
    window.ipcRenderer.on("show-noti-close-rotate", () =>
      setCloseRotateVisible(true),
    );
    window.ipcRenderer.on("show-toast", ipcHandler(showToast));
    console.log("main-screen-loaded", !!window.ipcRenderer);
    window.ipcRenderer.send("main-screen-loaded");
  }, []);

  React.useEffect(() => {
    window.ipcRenderer.on("dev-event-1", () => {
      window.location.reload();
    });
    window.ipcRenderer.on("dev-event-2", () => {
      setCloseRotateVisible(true);
    });
  }, []);

  return (
    <>
      {showIntro && <MainIntro whenFinished={whenIntroFinished} />}
      <main
        className={tLayout({ preventPointerEvent: showSpinner })}
        // FIXME: Change image and apply
        // style={{ backgroundImage: `url(${beanbird})` }}
      >
        <AppBar />
        {showSpinner && (
          <div className={tSpinner()}>
            <Spinner size="lg" color="default" />
          </div>
        )}
        {closeRotateVisible && (
          <WebOSNotification
            contents={[
              "This app does not support portrait mode.",
              "Please orient the screen to landscape mode to enjoy.",
            ]}
            whenClose={() => setCloseRotateVisible(false)}
          />
        )}
      </main>
    </>
  );
}

const tLayout = tv({
  base: [
    "w-screen max-w-full",
    "h-screen max-h-full",
    "relative",
    "overflow-hidden",
    "bg-cover bg-center",
    "bg-black",
  ],
  variants: {
    preventPointerEvent: {
      true: ["pointer-events-none"],
    },
  },
});

const tSpinner = tv({
  base: [
    "flex justify-center items-center",
    "w-full h-full",
    "absolute top-0 left-0",
    "bg-transparent",
  ],
});
