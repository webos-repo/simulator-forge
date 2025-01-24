import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { ToastContainer, Flip } from 'react-toastify';
import { ipcHandler } from '@share/lib/utils';
import AppBar from '../component/appBar/AppBar';
import Spinner from '../component/Spinner';
import Notification from '../component/Notification';
import { clearToast, showToast } from '../lib/toastManager';
import 'react-toastify/dist/ReactToastify.css';
import { arrangeCenterByFlex } from '../styles/partials';

import beanbird from 'assets/beanbird-sky.jpg';

const closeOnRotateContents = [
  'This app does not support portrait mode.',
  'Please orient the screen to landscape mode to enjoy.',
];

function MainScreen() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [closeRotateVisible, setCloseRotateVisible] = useState(false);

  const setNotiTimer = (setFunc: any) => {
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
    }, 5500);
  };

  useEffect(() => {
    document.addEventListener('mouseenter', () => {
      ipcRenderer.send('main-window-mouseenter');
    });
    ipcRenderer
      .on('set-spinner', ipcHandler(setShowSpinner))
      .on('clear-main-screen', () => {
        setShowSpinner(false);
        clearToast();
      })
      .on('show-noti-close-rotate', () => setNotiTimer(setCloseRotateVisible))
      .on('show-toast', ipcHandler(showToast));

    ipcRenderer.send('main-screen-loaded');
  }, []);

  return (
    <MainScreenLayout preventPointerEvent={showSpinner}>
      <AppBar />
      {showSpinner && <Spinner />}
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
  ]
);

const IgnorePanel = styled.div`
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 5;
`;

export default MainScreen;
