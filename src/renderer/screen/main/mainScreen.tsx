import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { ToastContainer, Flip } from "react-toastify";
import { ipcHandler } from "@share/lib/utils";
import AppBar from "../../component/appBar/AppBar";
// import Spinner from "../../component/Spinner";
import Notification from "../../component/Notification";
import { clearToast, showToast } from "../../lib/toastManager";
import "react-toastify/dist/ReactToastify.css";
import { arrangeCenterByFlex } from "../../styles/partials";

import beanbird from "@/assets/beanbird-sky.jpg";
import { Spinner } from "@heroui/react";

const closeOnRotateContents = [
  "This app does not support portrait mode.",
  "Please orient the screen to landscape mode to enjoy.",
];

export default function MainScreen() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [closeRotateVisible, setCloseRotateVisible] = useState(false);

  const setNotiTimer = (setFunc: any) => {
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
    }, 5500);
  };

  useEffect(() => {
    document.addEventListener("mouseenter", () => {
      window.ipcRenderer.send("main-window-mouseenter");
    });
    window.ipcRenderer.on("set-spinner", ipcHandler(setShowSpinner));
    window.ipcRenderer.on("clear-main-screen", () => {
      setShowSpinner(false);
      clearToast();
    });
    window.ipcRenderer.on("show-noti-close-rotate", () =>
      setNotiTimer(setCloseRotateVisible),
    );
    window.ipcRenderer.on("show-toast", ipcHandler(showToast));
    window.ipcRenderer.send("main-screen-loaded");
  }, []);

  return (
    <MainScreenLayout preventPointerEvent={showSpinner}>
      <AppBar />
      {showSpinner && <Spinner size="lg" color="default" />}
      {closeRotateVisible && (
        <IgnorePanel
          onClick={() => setCloseRotateVisible(false)}
          data-testid="IgnorePanel"
        >
          <Notification contents={closeOnRotateContents} />
        </IgnorePanel>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnFocusLoss={false}
        theme="dark"
        transition={Flip}
      />
    </MainScreenLayout>
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

const IgnorePanel = styled.div`
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 5;
`;
