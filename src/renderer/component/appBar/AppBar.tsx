import styled from '@emotion/styled';
import type { AppInfoWithState } from '@share/structure/appInfo';
import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ipcHandler } from '@share/lib/utils';
import { arrangeCenterByFlex } from '../../styles/partials';
import AppIcon from './AppIcon';
import ArrowBox from './ArrowBox';

function AppBar() {
  const [appInfos, setAppInfos] = useState<AppInfoWithState[]>([]);
  const [show, setShow] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const appBarRef = useRef<any>(null);

  const checkShow = useCallback(() => {
    if (!appBarRef || !appBarRef.current) return;
    setShowLeft(appBarRef.current.scrollLeft > 0);
    setShowRight(
      appBarRef.current.scrollWidth >
        appBarRef.current.clientWidth + appBarRef.current.scrollLeft
    );
  }, [setShowLeft, setShowRight]);

  const scrollHorizontal = (
    deltaX: number,
    deltaY: number,
    fromButton = false
  ) => {
    if (!appBarRef || !appBarRef.current) return;

    const movementX = 50;
    const delta = Math.abs(deltaX) < Math.abs(deltaY) ? deltaY : deltaX;

    appBarRef.current.scrollLeft += fromButton
      ? delta
      : delta < -movementX
      ? -movementX
      : delta > movementX
      ? movementX
      : delta;
    checkShow();
  };

  useEffect(() => {
    ipcRenderer.on(
      'app-list-updated',
      ipcHandler((data: string) => {
        setAppInfos(JSON.parse(data));
        checkShow();
      })
    );
  }, [checkShow]);

  return (
    <AppBarLayout
      data-testid="AppBar"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {appInfos.length !== 0 && (
        <>
          <ArrowBox
            direction="left"
            visible={show && showLeft}
            scrollHorizontal={scrollHorizontal}
          />
          <AppIconContainer
            ref={appBarRef}
            onWheel={({ deltaX, deltaY }) => scrollHorizontal(deltaX, deltaY)}
            data-testid="AppIconContainer"
          >
            {appInfos.map((appInfoWithState, key) => (
              <AppIcon appInfoWithState={appInfoWithState} key={key} />
            ))}
          </AppIconContainer>
          <ArrowBox
            direction="right"
            visible={show && showRight}
            scrollHorizontal={scrollHorizontal}
          />
        </>
      )}
    </AppBarLayout>
  );
}

const AppBarLayout = styled.section`
  ${arrangeCenterByFlex};
  position: absolute;
  top: 77vh;
  left: 0;
  width: 100vw;
  height: 21vh;
`;

const AppIconContainer = styled.div`
  display: flex;
  align-items: center;
  width: 88%;
  height: 100%;
  overflow-x: hidden;
  transition: all 0.5s;
  box-sizing: border-box;
  border-radius: 1vw;
  margin: 0 1px;

  &:hover {
    box-shadow: inset 0 0 12px -5px whitesmoke;
  }
`;

export default AppBar;
