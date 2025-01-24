import { css, keyframes } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState, useRef, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { ipcHandler } from '@share/lib/utils';
import type { MouseEventType } from '@share/structure/events';

function TouchScreen() {
  const [edge, setEdge] = useState({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });
  const [active, setActive] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [bottomEdgeEntered, setBottomEdgeEntered] = useState(false);
  const [leftEdgeEntered, setLeftEdgeEntered] = useState(false);
  const [rightEdgeEntered, setRightEdgeEntered] = useState(false);
  const isDown = useRef(false);
  const cursorBox = useRef<any>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    sendMouseEvent(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isDown.current = false;
    sendMouseEvent(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    cursorMove(e);
    if (!isDown.current) return;
    sendMouseEvent(e);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsEntered(false);
    if (isDown.current) {
      ipcRenderer.send('touch-screen-mouse-leave-event');
      handleMouseUp({ ...e, type: 'mouseup' });
    }
  };

  const cursorMove = (e: React.MouseEvent) => {
    const { clientX: x, clientY: y } = e;

    if (cursorBox) {
      cursorBox.current.style.marginTop = `${y}px`;
      cursorBox.current.style.marginLeft = `${x}px`;
    }

    setLeftEdgeEntered(x < edge.minX);
    setRightEdgeEntered(x > edge.maxX);
    setBottomEdgeEntered(y > edge.maxY);
  };

  useEffect(() => {
    ipcRenderer.on('edge-data', ipcHandler(setEdge));
    ipcRenderer.send('req-edge-data');
  }, []);

  return (
    <TouchScreenLayout
      onMouseMove={handleMouseMove}
      data-testid="TouchScreenLayout"
    >
      <TouchBox
        onMouseDown={(e) => {
          handleMouseDown(e);
          setActive(true);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          setActive(false);
        }}
        onMouseEnter={() => setIsEntered(true)}
        onMouseLeave={handleMouseLeave}
        data-testid="TouchBox"
      >
        <CursorBox
          ref={cursorBox}
          isEntered={isEntered}
          data-testid="CursorBox"
        >
          <Cursor isActive={active} data-testid="Cursor" />
        </CursorBox>
      </TouchBox>
      <EdgeBox
        position="bottom"
        isEntered={isEntered && bottomEdgeEntered}
        data-testid="EdgeBox-bottom"
      />
      <EdgeBox
        position="left"
        isEntered={isEntered && leftEdgeEntered}
        data-testid="EdgeBox-left"
      />
      <EdgeBox
        position="right"
        isEntered={isEntered && rightEdgeEntered}
        data-testid="EdgeBox-right"
      />
    </TouchScreenLayout>
  );
}

function sendMouseEvent(e: React.MouseEvent) {
  ipcRenderer.send(
    'touch-screen-mouse-event',
    {
      type: e.type,
      x: e.clientX,
      y: e.clientY,
      movementX: e.movementX,
      movementY: e.movementY,
    } as MouseEventType,
    e.timeStamp
  );
}

const EdgeRange = '30px';

const TouchScreenLayout = styled.section`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0);
`;

const TouchBox = styled.div`
  height: 100%;
  overflow: hidden;
  cursor: none;
  position: relative;
  z-index: 10;
`;

const CursorBox = styled.div<{
  isEntered: boolean;
}>`
  ${({ isEntered }) =>
    !isEntered &&
    css`
      visibility: hidden;
    `}
`;

const touchClickEffect = keyframes`
  100% {
    border: solid 3px rgba(50, 120, 120, 0.7);
    background: radial-gradient(
      rgba(170, 238, 238, 0.8),
      rgba(170, 238, 238, 0.4) 60%
    );
  }
`;

const Cursor = styled.div<{
  isActive: boolean;
}>`
  position: absolute;
  border-radius: 50%;
  border: solid 3px rgba(130, 130, 130, 0.7);
  box-sizing: border-box;
  height: 26px;
  width: 26px;
  margin-top: -13px;
  margin-left: -13px;
  background: radial-gradient(
    rgba(150, 150, 150, 0.7),
    rgba(50, 50, 50, 0.7) 60%
  );

  ${({ isActive }) =>
    isActive &&
    css`
      animation: ${touchClickEffect} 0.1s ease-out forwards;
    `}
  }
`;

type EdgePosition = 'bottom' | 'left' | 'right';

const EdgeBox = styled.section<{
  position: EdgePosition;
  isEntered: boolean;
}>`
  position: absolute;
  z-index: 1;
  transition: background-color 0.2s ease-out;

  ${({ position }) => EdgePositionCSS[position]}

  ${({ isEntered }) =>
    isEntered &&
    css`
      background-color: rgba(150, 150, 150, 0.2);
    `}
`;

const EdgePositionCSS: { [key in EdgePosition]: SerializedStyles } = {
  bottom: css`
    top: calc(100vh - ${EdgeRange});
    left: 0;
    width: 100vw;
    height: ${EdgeRange};
  `,
  left: css`
    top: 0;
    left: 0;
    width: ${EdgeRange};
    height: 100vh;
  `,
  right: css`
    top: 0;
    left: calc(100vw - ${EdgeRange});
    width: ${EdgeRange};
    height: 100vh;
  `,
};

export default TouchScreen;
