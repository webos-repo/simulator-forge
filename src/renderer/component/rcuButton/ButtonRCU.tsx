/* eslint-disable react/no-unused-prop-types */
import styled from '@emotion/styled';
import type { ReactNode, MouseEvent } from 'react';
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import useRCUHandler from '../../hook/useRCUHandler';
import { buttonReaction } from '../../styles/effects';
import { arrangeCenterByFlex } from '../../styles/partials';
import IconRCU from './IconRCU';
import type { IconRCUProps } from './IconRCU';

type RCUButtonCommonProps = IconRCUProps & {
  keyCode?: string;
  children?: ReactNode;
  useOnClick?: boolean;
  isTouchRemote?: boolean;
  unused?: boolean;
};

type RCUButtonProps = RCUButtonCommonProps & {
  alternativeCSS?: SerializedStyles;
  additionalCSS?: SerializedStyles;
  customHandler?: (...args: any[]) => void;
};

function ButtonRCU({
  keyCode,
  children,
  useOnClick,
  isTouchRemote,
  unused,
  alternativeCSS,
  additionalCSS,
  customHandler,
  iconImage,
  iconNoInvert,
  iconAdditionalCSS,
}: RCUButtonProps) {
  const { buttonHandler, leaveHandler } = useRCUHandler({
    keyCode,
    isTouchRemote,
  });
  const handler = customHandler || buttonHandler;

  return (
    <Button
      data-testid={keyCode ? `buttonRCU-${keyCode}` : undefined}
      onMouseDown={!unused && !useOnClick ? handler : undefined}
      onMouseUp={!unused && !useOnClick ? handler : undefined}
      onClick={!unused && useOnClick ? handler : undefined}
      onMouseLeave={!unused ? leaveHandler : undefined}
      css={css(
        alternativeCSS || [defaultCSS, additionalCSS],
        unused ? unusedCSS : null
      )}
    >
      {iconImage ? (
        <IconRCU
          iconImage={iconImage}
          iconNoInvert={iconNoInvert}
          iconAdditionalCSS={iconAdditionalCSS}
        />
      ) : children !== undefined ? (
        children
      ) : null}
    </Button>
  );
}

const Button = styled.button``;

const defaultCSS = css`
  ${arrangeCenterByFlex};
  ${buttonReaction};
  width: 24vw;
  height: 24vw;
  padding: 0;
  outline: none;
  background: radial-gradient(#606060, #252525);
  position: relative;
  border: 2vw solid rgba(24, 24, 24, 0.7);
  border-radius: 100%;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4vw 6vw 2vw rgba(10, 10, 10, 0.5);
  color: rgba(255, 255, 255, 0.7);
`;

const unusedCSS = css`
  pointer-events: none;
  opacity: 40%;
  color: #909090;
  box-shadow: none;
`;

export type { RCUButtonCommonProps };
export default ButtonRCU;
