import { css } from '@emotion/react';
import type { Orientation2Way } from '@share/structure/orientations';

const white = '#c0c0c0';
const blackBlue = '#2d3236';
const blue = '#353a40';
const buttonBorderColor = 'rgba(180, 180, 180, 0.2)';
const buttonBorderColorNotUsed = 'rgba(130, 130, 130, 0.2)';
const notUsedButtons = [
  '.hg-button-eng',
  '.hg-button-aa',
  '.hg-button-blank',
  ".hg-standardBtn[data-skbtn='']",
  '.hg-button-voice',
];

const getReactSimpleKeyboardCustomCSS = (orn: Orientation2Way) => css`
  .simple-keyboard {
    background-color: transparent;
    padding: 0;
    font-family: 'LG Smart 2.0 Regular', sans-serif;
    font-size: 1.3em;
    overflow: visible;

    .hg-rows {
      width: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .hg-row {
        margin: 0 0 1vh 0;
        position: relative;
        height: 38px;
        box-sizing: border-box;

        &:last-child {
          margin-bottom: 0;
        }

        .hg-button {
          margin: 0 0.1vw;
          height: 100%;
          color: ${white};
          border: 1px solid ${buttonBorderColor};
          font-weight: 5000;
          box-shadow: 0px 1px 1px 1px #42444c;
        }

        .hg-functionBtn {
          background-color: transparent;
          width: 10.2vw;
          margin: 0 20px;
        }

        .hg-standardBtn {
          background-color: ${blue};
          width: 4.4vw;
        }

        .hg-button-space {
          background-color: ${blue};
          width: 588px;
          margin: 0;
        }

        .hg-button-arrowleft {
          width: 5vw;
          margin-right: 1px;
          margin-left: 19px;
        }

        .hg-button-arrowright {
          width: 5vw;
          margin-left: 0;
        }

        .hg-button-none {
          visibility: hidden;
        }

        .hg-keyMarker {
          background-color: ${white};
          color: ${blackBlue};
          z-index: 10;
          box-shadow: 0 5px 15px 1px #000000;
          transform: scale(1.15);
          &:active {
            transform: scale(1.1);
          }
        }

        .hg-keyMarker.hg-button-space {
          transform: scale(1.01);
          &:active {
            transform: scale(1);
          }
        }

        ${notUsedButtons.map(
          (btn) => css`
            ${btn}, ${btn}.hg-keyMarker {
              background-color: transparent;
              color: rgba(230, 230, 230, 0.2);
              border-color: ${buttonBorderColorNotUsed};
              transform: none;
              box-shadow: none;
              z-index: auto;
              cursor: default;

              &:active {
                transform: none;
              }
            }
          `
        )}
      }

      .hg-row:nth-of-type(5) {
        margin-top: 4vh;
        position: relative;
      }

      .hg-row:nth-of-type(1) {
        .hg-button-bksp:nth-last-of-type(2) {
          margin-right: 0.1vw;
        }
        .hg-button-enter {
          margin-left: 0;
        }
      }
    }
  }

  ${orn === 'portrait' &&
  css`
    .simple-keyboard {
      font-size: 1em;

      .hg-rows {
        .hg-row {
          height: 34px;
          width: 98vw;

          .hg-functionBtn {
            width: 96px;
            margin: 0 8px;
          }

          .hg-button-space {
            margin: 0;
            width: 442px;
          }

          .hg-button-arrowleft {
            width: 40px;
            margin-right: 0.1vw;
          }

          .hg-button-arrowright {
            width: 40px;
            margin-left: 0;
          }
        }

        .hg-row:nth-of-type(1) {
          .hg-button-bksp:nth-last-of-type(2) {
            margin-right: 1px;
          }

          .hg-button-enter {
            margin-left: 0;
          }
        }
      }
    }
  `}
`;

export default getReactSimpleKeyboardCustomCSS;
