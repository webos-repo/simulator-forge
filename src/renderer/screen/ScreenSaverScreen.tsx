import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { directions } from '@share/structure/orientations';
import type { Direction } from '@share/structure/orientations';
import { useState, useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';
import { ipcHandler } from '@share/lib/utils';
import { random } from 'lodash';
import { DefaultRect } from '@share/constant/defaults';

const DefaultGuidePos = {
  top: 300,
  left: 100,
};

function ScreenSaverScreen() {
  const [shown, setShown] = useState(false);
  const [movePrevent, setMovePrevent] = useState(true);
  const [guideVisible, setGuideVisible] = useState(false);
  const [guidePos, setGuidePos] = useState(DefaultGuidePos);
  const guideMoveTimer = useRef<NodeJS.Timer | null>(null);
  const holePos = useRef(DefaultRect);
  const guidanceMoveTime = process.env.NODE_ENV === 'test' ? 200 : 8000;

  const preventScreenSaver = (e: any) => {
    if (!shown) return;
    if (movePrevent) {
      setMovePrevent(false);
      if (e.type === 'mousemove') return;
    }
    ipcRenderer.send('prevent-screen-saver-from-screen');
  };

  const checkGuideVisible = () => {
    return !holePos.current.width && !holePos.current.height;
  };

  useEffect(() => {
    const resetGuideMoveTimer = (makeNewTimer: boolean) => {
      if (guideMoveTimer.current) {
        clearTimeout(guideMoveTimer.current);
        guideMoveTimer.current = null;
      }
      if (makeNewTimer && checkGuideVisible()) {
        guideMoveTimer.current = setInterval(() => {
          setGuidePos(makeRandomPos());
          setGuideVisible(false);
          setTimeout(() => setGuideVisible(true), 100);
        }, guidanceMoveTime);
      }
    };

    ipcRenderer
      .on(
        'video-rect',
        ipcHandler((newHolePos: Electron.Rectangle) => {
          holePos.current = newHolePos;
        })
      )
      .on('is-shown', () => {
        setGuidePos(DefaultGuidePos);
        resetGuideMoveTimer(true);
        setShown(true);
        setMovePrevent(true);
        if (checkGuideVisible()) setGuideVisible(true);
      })
      .on('is-hidden', () => {
        setShown(false);
        setGuideVisible(false);
        resetGuideMoveTimer(false);
      });
  }, [guidanceMoveTime]);

  return (
    <ScreenSaverScreenLayout
      guideVisible={guideVisible}
      onMouseDownCapture={preventScreenSaver}
      onMouseMoveCapture={preventScreenSaver}
      onMouseUpCapture={preventScreenSaver}
      onKeyDownCapture={preventScreenSaver}
      onKeyUpCapture={preventScreenSaver}
      data-testid="ScreenSaverScreenLayout"
    >
      {guideVisible ? (
        <GuidanceBox pos={guidePos} data-testid="GuidanceBox">
          <GuidanceTitle>Screen Saver</GuidanceTitle>
          <span>To turn the screen back on, please press any button</span>
          <span>except for the power button.</span>
        </GuidanceBox>
      ) : (
        shown && (
          <>
            <Hole holePos={holePos.current} data-testid="Hole" />
            {directions.map((dir) => (
              <BlackBox
                key={dir}
                direction={dir}
                holePos={holePos.current}
                data-testid={`BlackBox-${dir}`}
              />
            ))}
          </>
        )
      )}
    </ScreenSaverScreenLayout>
  );
}

const TopMax = 550;
const LeftMax = 700;

function makeRandomPos() {
  return {
    top: random(100, TopMax),
    left: random(100, LeftMax),
  };
}

const ScreenSaverScreenLayout = styled.main<{
  guideVisible: boolean;
}>`
  width: 100vw;
  height: 100vh;
  cursor: none;
  overflow: hidden;
  background-color: black;
  ${({ guideVisible }) =>
    !guideVisible &&
    css`
      background-color: rgba(0, 0, 0, 0);
    `};
`;

const fadeInOut = keyframes`
  50% {
    opacity: 1;
    visibility: visible;
  }
`;

const GuidanceBox = styled.div<{
  pos: { top: number; left: number };
}>`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  visibility: hidden;
  animation: ${fadeInOut} 7.5s 1;

  ${({ pos: { top, left } }) => css`
    top: ${top}px;
    left: ${left}px;
  `}}
`;

const GuidanceTitle = styled.div`
  text-align: center;
  font-size: 2em;
  margin-bottom: 3vh;
  border: solid 2px rgba(255, 255, 255, 0.4);
  border-radius: 4vh;
  padding: 4vh;
`;

const Hole = styled.div<{
  holePos: Electron.Rectangle;
}>`
  position: absolute;
  background-color: rgba(0, 0, 0, 0);

  ${({ holePos: { x, y, width, height } }) => css`
    left: ${x}px;
    top: ${y}px;
    width: ${width}px;
    height: ${height}px;
  `}
`;

const BlackBox = styled.div<{
  direction: Direction;
  holePos: Electron.Rectangle;
}>`
  position: absolute;
  background-color: black;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  ${({ direction, holePos: { x, y, width, height } }) =>
    direction === 'Up'
      ? css`
          height: ${y}px;
        `
      : direction === 'Down'
      ? css`
          top: ${y + height}px;
          height: ${720 - y - height}px;
        `
      : direction === 'Left'
      ? css`
          width: ${x}px;
        `
      : direction === 'Right'
      ? css`
          left: ${x + width}px;
          width: ${1280 - x - width}px;
        `
      : undefined}
`;

export default ScreenSaverScreen;
