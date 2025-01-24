import { css } from '@emotion/react';
import { focusRed } from '../../styles/colors';
import { arrangeCenterByFlex } from '../../styles/partials';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';
import type { SerializedStyles } from '@emotion/react';

type Props = RCUButtonCommonProps & {
  type: 'top' | 'bottom';
};

function ButtonRCULong(props: Props) {
  const { type } = props;
  return <ButtonRCU {...props} alternativeCSS={longButtonCSS(type)} />;
}

const longButtonCSS = (direction: Props['type']) => css`
  ${arrangeCenterByFlex};
  background-color: #454545;
  width: 60%;
  height: 40%;
  outline: none;
  padding: 0;
  border: 1vw solid black;
  cursor: pointer;
  ${directionToCSSMap[direction]}
`;

const directionToCSSMap: { [key in Props['type']]: SerializedStyles } = {
  top: css`
    border-bottom: none;
    border-radius: 40% 40% 0 0;
    box-shadow: 0 -4vw 6vw 2vw rgba(10, 10, 10, 0.8);
    &:hover {
      border-bottom: 1vw solid ${focusRed};
    }
  `,

  bottom: css`
    border-top: none;
    border-radius: 0 0 40% 40%;
    box-shadow: 0 4vw 6vw 2vw rgba(10, 10, 10, 0.8);
    &:hover {
      border-top: 1vw solid ${focusRed};
    }
  `,
};

export default ButtonRCULong;
