import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { ipcHandler } from "@/share/lib/utils";
import AppBar from "../../component/appBar/appBar";
import { clearToast, showToast } from "../../lib/toastManager";
import { arrangeCenterByFlex } from "../../styles/partials";
import { Spinner } from "@heroui/react";
import beanbird from "@/assets/beanbird-sky.jpg";
import MainIntro from "@/renderer/screen/main/mainIntro";
import WebOSNotification from "@/renderer/component/webOS/webOSNotification";

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
    window.ipcRenderer.send("main-screen-loaded");
  }, []);

  return (
    <>
      {showIntro && <MainIntro whenFinished={whenIntroFinished} />}
      <MainScreenLayout preventPointerEvent={showSpinner}>
        {showSpinner && <Spinner size="lg" color="default" />}
        {closeRotateVisible && (
          <WebOSNotification
            contents={[
              "This app does not support portrait mode.",
              "Please orient the screen to landscape mode to enjoy.",
            ]}
            whenClose={() => setCloseRotateVisible(false)}
          />
        )}
        <AppBar />
      </MainScreenLayout>
    </>
  );
}

const MainScreenLayout = styled.main<{ preventPointerEvent: boolean }>(
  (props) => [
    css`
      ${arrangeCenterByFlex};
      width: 100vw;
      max-width: 100%;
      height: 100vh;
      max-height: 100%;
      overflow: hidden;
      background-image: url(${beanbird});
      background-size: cover;
      background-position: center;
    `,
    props.preventPointerEvent &&
      css`
        pointer-events: none;
      `,
  ],
);
