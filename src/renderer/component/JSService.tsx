import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';
import { useState, useRef, useEffect } from 'react';
import { fadeIn } from '../styles/effects';

type JSServiceProps = {
  id: string;
  isActive: boolean;
  dirPath: string;
};

function JSService({ id, isActive, dirPath }: JSServiceProps) {
  const refServiceName = useRef<any>(null);
  const refServiceNameText = useRef<any>(null);
  const [entered, setEntered] = useState(false);
  const [isTitleLong, setIsTitleLong] = useState(false);
  const [widthDif, setWidthDif] = useState(0);

  const checkIsLong = () => {
    if (!refServiceName?.current || !refServiceNameText?.current) return;
    if (
      refServiceName.current.clientWidth <
      refServiceNameText.current.clientWidth
    ) {
      setIsTitleLong(true);
      setWidthDif(
        refServiceNameText.current.clientWidth -
          refServiceName.current.clientWidth
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
  }, [refServiceName, refServiceNameText]);

  return (
    <JSServiceLayout
      onClick={() => ipcRenderer.send('js-service-toggle', id)}
      onContextMenu={() => ipcRenderer.send('js-service-right-click', id)}
      data-testid={id}
    >
      <TitleWrapper
        isActive={isActive}
        ref={refServiceName}
        title={dirPath}
        onMouseEnter={() => setEntered(true)}
        onMouseLeave={() => setEntered(false)}
      >
        <TitleBox
          ref={refServiceNameText}
          swipe={entered && isTitleLong}
          widthDif={widthDif}
        >
          {id}
        </TitleBox>
      </TitleWrapper>
      <ToggleBox>
        <ToggleHandle isActive={isActive} />
      </ToggleBox>
    </JSServiceLayout>
  );
}

const JSServiceLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 38px;
  min-height: 38px;
  margin-bottom: 10px;
  animation: 1s ${fadeIn};
  animation-fill-mode: forwards;
  cursor: pointer;
`;

const TitleWrapper = styled.div<{
  isActive: boolean;
}>`
  display: flex;
  align-items: center;
  width: calc(100% - 50px);
  height: 80%;
  background-color: transparent;
  overflow: hidden;
  transition: color ease-out 200ms;
  color: rgba(155, 155, 155, 0.9);
  border-bottom: solid 1px rgba(155, 155, 155, 0.9);

  ${({ isActive }) =>
    isActive
      ? css`
          border-bottom-color: #24dba6;
          color: rgba(255, 255, 255, 0.8);
        `
      : css`
          &:hover {
            color: rgba(200, 200, 200, 0.9);
            border-bottom-color: rgba(200, 200, 200, 0.9);
          }
        `}
`;

const TitleBox = styled.div<{
  swipe: boolean;
  widthDif: number;
}>`
  white-space: nowrap;
  padding: 0 2px 0 2px;
  font-size: 12pt;
  text-overflow: ellipsis;
  transition: 1s;
  transform: translateX(0);

  ${({ swipe, widthDif }) =>
    swipe &&
    css`
      transform: translateX(-${widthDif + 5}px);
    `}
`;

const ToggleBox = styled.div`
  width: 40px;
  height: 26px;
  background-color: rgba(220, 220, 220, 1);
  border-radius: 10vw;
  display: flex;
  align-items: center;
`;

const ToggleHandle = styled.div<{ isActive: boolean }>`
  width: 20px;
  height: 20px;
  margin-left: 4px;
  border-radius: 50%;
  background-color: rgba(86, 81, 81, 1);
  transition: all ease-out 200ms;

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: #189973;
      margin-left: 16px;
    `}
`;

export type { JSServiceProps };
export default JSService;
