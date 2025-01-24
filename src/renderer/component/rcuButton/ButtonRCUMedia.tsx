import { css } from '@emotion/react';
import { gray2 } from '../../styles/colors';
import { buttonReaction } from '../../styles/effects';
import { arrangeCenterByFlex } from '../../styles/partials';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';
import type { SerializedStyles } from '@emotion/react';

type Props = RCUButtonCommonProps & {
  type: 'Stop' | 'Play' | 'Pause' | 'Backward' | 'Forward';
};

function ButtonRCUMedia(props: Props) {
  const { type } = props;
  return (
    <ButtonRCU
      {...props}
      keyCode={type}
      alternativeCSS={buttonCSS(type === 'Stop')}
      iconAdditionalCSS={iconCSS(type)}
    />
  );
}

const buttonCSS = (isStop: boolean) => css`
  ${buttonReaction};
  ${arrangeCenterByFlex};
  width: 26px;
  height: 18px;
  background-color: ${gray2};
  border-radius: 100vw;
  cursor: pointer;
  box-shadow: 0 4vw 5vw 2vw rgba(10, 10, 10, 0.8);
  border: 2px solid transparent;
  padding: 1px;

  ${isStop &&
  css`
    width: 30px;
    height: 20px;
    margin-bottom: 0.3vh;
    box-shadow: 0 4vw 5vw 2vw rgba(10, 10, 10, 0.6);
  `}
`;

const iconCSS = (type: Props['type']) => css`
  width: 12px;
  height: 12px;
  ${iconTypeCSSMap[type]};
`;

const iconTypeCSSMap: {
  [key in Props['type']]: SerializedStyles;
} = {
  Stop: css`
    width: 14px;
    height: 14px;
  `,
  Play: css`
    margin-left: 2px;
  `,
  Pause: css``,
  Backward: css`
    margin-right: 1px;
  `,
  Forward: css`
    margin-left: 1px;
    transform: rotate(0.5turn);
  `,
};

export default ButtonRCUMedia;
