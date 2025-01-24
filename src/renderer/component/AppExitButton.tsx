import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import {
  grayBtnBgColor,
  grayBtnBgColorFocus,
  grayBtnFtColor,
  grayBtnFtColorFocus,
} from '../styles/colors';

interface Props {
  clickHandler: () => void;
  value: string;
}

function AppExitButton({ value, clickHandler }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    ipcRenderer.on('be-hidden', () => setIsFocused(false));
  }, []);

  return (
    <Button
      isFocused={isFocused}
      onClick={() => clickHandler()}
      onMouseOver={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {value}
    </Button>
  );
}

const Button = styled.button<{ isFocused: boolean }>`
  background-color: ${grayBtnBgColor};
  width: 25vw;
  margin: 4vh 0;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-size: 1.2rem;
  color: ${grayBtnFtColor};
  box-shadow: 0px 8px 28px -6px rgba(24, 39, 75, 0.12),
    0px 18px 88px -4px rgba(24, 39, 75, 0.14);
  transition: transform ease-in 0.1s;
  cursor: pointer;

  ${({ isFocused }) =>
    isFocused &&
    css`
      background-color: ${grayBtnBgColorFocus};
      color: ${grayBtnFtColorFocus};
      transform: scale(1.05);
    `} {
  }
`;

export default AppExitButton;
