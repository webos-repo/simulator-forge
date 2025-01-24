import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';
import { useState, useRef, useEffect } from 'react';
import type { AppInfoWithState } from '@share/structure/appInfo';
import { fadeIn } from '../styles/effects';

type Props = {
  appInfo: AppInfoWithState;
};

function AppList({ appInfo: { appPath, id, title, appState } }: Props) {
  const refAppButton = useRef<any>(null);
  const refAppButtonText = useRef<any>(null);
  const [entered, setEntered] = useState(false);
  const [isTitleLong, setIsTitleLong] = useState(false);
  const [widthDif, setWidthDif] = useState(0);

  const checkIsLong = () => {
    if (!refAppButton?.current || !refAppButtonText?.current) return;
    if (
      refAppButton.current.clientWidth < refAppButtonText.current.clientWidth
    ) {
      setIsTitleLong(true);
      setWidthDif(
        refAppButtonText.current.clientWidth - refAppButton.current.clientWidth
      );
    } else {
      setIsTitleLong(false);
    }
  };

  useEffect(() => {
    ipcRenderer.on('resized', checkIsLong);
  }, []);

  useEffect(() => {
    checkIsLong();
  }, [refAppButton, refAppButtonText]);

  return (
    <AppListBox
      appState={appState}
      ref={refAppButton}
      onClick={() => ipcRenderer.send('launch-app', { appPath })}
      onContextMenu={() =>
        ipcRenderer.send('app-list-right-click', appPath, id)
      }
      onMouseEnter={() => setEntered(true)}
      onMouseLeave={() => setEntered(false)}
    >
      <AppListTitleBox
        ref={refAppButtonText}
        swipe={entered && isTitleLong}
        widthDif={widthDif}
      >
        {title}
      </AppListTitleBox>
    </AppListBox>
  );
}

const appStateCSSMap: {
  [key in AppInfoWithState['appState']]: SerializedStyles;
} = {
  foreground: css`
    border-bottom-color: #24dba6;
    color: rgba(255, 255, 255, 0.8);
  `,
  background: css`
    border-bottom-color: #dbb624;
    color: rgba(255, 255, 255, 0.6);
  `,
  notLaunched: css`
    &:hover {
      color: rgba(200, 200, 200, 0.9);
      border-bottom-color: rgba(200, 200, 200, 0.9);
    }
  `,
};

const AppListBox = styled.div<{
  appState: AppInfoWithState['appState'];
}>`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  height: 38px;
  min-height: 38px;
  background-color: transparent;
  overflow: hidden;
  cursor: pointer;
  transition: color ease-out 200ms;
  animation: 1s ${fadeIn};
  animation-fill-mode: forwards;
  color: rgba(155, 155, 155, 0.9);
  border-bottom: solid 1px rgba(155, 155, 155, 0.9);

  ${({ appState }) => appStateCSSMap[appState]}
`;

const AppListTitleBox = styled.div<{
  swipe: boolean;
  widthDif: number;
}>`
  white-space: nowrap;
  padding: 0 2px 0 3px;
  font-size: 12pt;
  text-overflow: ellipsis;
  transition: transform 1s;
  transform: translateX(0);

  ${({ swipe, widthDif }) =>
    swipe &&
    css`
      transform: translateX(-${widthDif + 5}px);
    `}
`;

export default AppList;
