import { css } from '@emotion/react';
import {
  buttonBlue,
  buttonGreen,
  buttonRed,
  buttonYellow,
} from '../../styles/colors';
import { buttonReaction } from '../../styles/effects';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';

type Props = RCUButtonCommonProps & {
  color: 'Red' | 'Green' | 'Blue' | 'Yellow';
};

function ButtonRCUColor(props: Props) {
  const { color } = props;
  return (
    <ButtonRCU
      {...props}
      keyCode={color}
      alternativeCSS={colorButtonCSS(color)}
    />
  );
}

const colorButtonCSS = (color: Props['color']) => css`
  ${buttonReaction};
  width: 80%;
  height: 70%;
  border: none;
  outline: none;
  border-radius: 100vw;
  cursor: pointer;
  box-shadow: 0 4vw 5vw 2vw rgba(10, 10, 10, 0.8);
  background-color: ${buttonColor[color]};
`;

const buttonColor: { [key in Props['color']]: string } = {
  Red: buttonRed,
  Green: buttonGreen,
  Yellow: buttonYellow,
  Blue: buttonBlue,
};

export default ButtonRCUColor;
