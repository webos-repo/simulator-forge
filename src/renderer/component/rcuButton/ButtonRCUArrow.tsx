import type {
  Direction,
  DirectionKeyCode,
} from '@share/structure/orientations';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';
import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

type Props = RCUButtonCommonProps & {
  direction: DirectionKeyCode;
};

function ButtonRCUArrow(props: Props) {
  const { direction } = props;
  return (
    <ButtonRCU
      {...props}
      keyCode={direction}
      additionalCSS={arrowButtonCSS(direction)}
    />
  );
}

const directionCSSMap: { [key in Props['direction']]: SerializedStyles } = {
  ArrowUp: css`
    grid-area: 1/2/2/3;
  `,
  ArrowRight: css`
    grid-area: 2/3/3/4;
  `,
  ArrowDown: css`
    grid-area: 3/2/4/3;
  `,
  ArrowLeft: css`
    grid-area: 2/1/3/2;
  `,
  Enter: css`
    background: radial-gradient(#454545, #050505);
    grid-area: 2/2/3/3;
  `,
};

const arrowButtonCSS = (direction: Props['direction']) => css`
  background: inherit;
  ${directionCSSMap[direction]}
`;

export default ButtonRCUArrow;
