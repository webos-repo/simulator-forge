import { css, keyframes } from '@emotion/react';
import { focusRed } from './colors';

export const buttonReaction = css`
  transition: transform 0.1s ease-in-out, border-color 0.1s ease-in-out;

  &:hover {
    border-color: ${focusRed};
    transform: scale(1);
    z-index: 10;
  }

  &:active {
    border-color: ${focusRed};
    transition: transform 25ms ease-in-out;
    transform: scale(0.9);
  }
`;

export const touchButtonReaction = css`
  transition: all 0.1s ease-in-out;

  &:hover {
    transform: scale(1.15);
    z-index: 10;
  }

  &:active {
    transition: all 50ms ease-out;
    transform: scale(0.9);
  }
`;

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    visibility: visible;
    opacity: 1;
  }
`;

export const fadeInOut = keyframes`
  50% {
    opacity: 1;
    visibility: visible;
  }
`;
