import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { getTargetFilePath } from '@share/lib/paths';
import type { AppInfoWithState } from '@share/structure/appInfo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';

type Props = {
  appInfoWithState: AppInfoWithState;
};

function AppIcon({
  appInfoWithState: {
    title,
    id,
    icon,
    iconColor,
    appPath,
    largeIcon,
    appState,
  },
}: Props) {
  const [isTitleLong, setIsTitleLong] = useState(false);
  const appTitleDiv = useRef<any>(null);
  const appTitle = useRef<any>(null);
  const tooltip = `title: ${title}\nappId: ${id}${
    appState === 'background' ? '\nbackground' : ''
  }`;

  const iconData = useMemo(() => {
    const iconPath = largeIcon
      ? path.join(appPath, largeIcon)
      : icon
      ? path.join(appPath, icon)
      : getTargetFilePath('assets', 'icon.png');
    const iconRaw = fs.readFileSync(iconPath).toString('base64');
    return `data:image/${iconPath.slice(-3)};base64,${iconRaw}`;
  }, [appPath, icon, largeIcon]);

  useEffect(() => {
    if (!appTitle || !appTitleDiv) return;
    if (appTitleDiv.current?.clientWidth < appTitle.current?.clientWidth) {
      setIsTitleLong(true);
    }
  }, [appTitle, appTitleDiv]);

  return (
    <AppIconLayout title={tooltip} onContextMenu={() => handleRightClick(id)}>
      {appState === 'background' && <BackgroundLight />}
      <AppIconWrapper>
        <AppIconBox
          iconColor={iconColor}
          iconData={iconData}
          onClick={() => handleLaunchApp(appPath!)}
        />
      </AppIconWrapper>
      <AppTitleWrapper ref={appTitleDiv} long={isTitleLong}>
        <AppTitleBox ref={appTitle} long={isTitleLong}>
          {title}
        </AppTitleBox>
      </AppTitleWrapper>
    </AppIconLayout>
  );
}

const handleLaunchApp = (appPath: string) =>
  ipcRenderer.send('launch-app', {
    appPath,
  });

const handleRightClick = (appId: string) => {
  ipcRenderer.send('app-icon-right-click', appId);
};

const AppIconLayout = styled.button`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 11vh;
  margin-right: 9vh;
  box-sizing: border-box;
  color: white;
  position: relative;

  &:last-of-type {
    width: 13vh;
    padding-right: 2vh;
  }

  &:first-of-type {
    width: 13vh;
    padding-left: 2vh;
    padding-right: 0;
  }
`;

const BackgroundLight = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: yellow;
  width: 6px;
  height: 6px;
  border-radius: 100px;
`;

const AppIconWrapper = styled.div`
  width: 11vh;
  height: 11vh;
  margin-bottom: 0.6vh;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 20%;
  box-shadow: 0 0 1vh 3px rgba(100, 100, 100, 0.5);
  transition: all 0.1s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transition: all 50ms ease-out;
    transform: scale(1);
  }
`;

const AppIconBox = styled.div<{
  iconColor?: string;
  iconData: string;
}>`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background-size: cover;
  background-color: ${({ iconColor }) => iconColor || 'rgb(243, 243, 243)'};
  background-image: url('${({ iconData }) => iconData}');
`;

const AppTitleWrapper = styled.div<{ long: boolean }>`
  display: flex;
  align-items: center;
  width: 11vh;
  overflow: hidden;
  padding: 0 1px;

  ${(props) =>
    !props.long &&
    css`
      justify-content: center;
    `}
`;

const AppTitleBox = styled.div<{ long: boolean }>`
  opacity: 0.8;
  margin-top: 1vh;
  font-weight: 600;
  white-space: nowrap;
  cursor: default;
  user-select: none;

  ${(props) =>
    props.long &&
    css`
      transform: translateX(0);
      transition: 1.5s;
      &:hover {
        transform: translateX(calc(70px - 100%));
      }
    `}
`;

export default AppIcon;
