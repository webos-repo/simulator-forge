import { css } from '@emotion/react';
import {
  buttonBlue,
  buttonGreen,
  buttonRed,
  buttonYellow,
} from '../../styles/colors';
import { touchButtonReaction } from '../../styles/effects';
import { arrangeCenterByFlex } from '../../styles/partials';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';

type Props = RCUButtonCommonProps & {
  color: 'Red' | 'Green' | 'Yellow' | 'Blue';
};

function ButtonTouchColor(props: Props) {
  const { color } = props;
  return (
    <ButtonRCU
      {...props}
      keyCode={color}
      isTouchRemote
      alternativeCSS={ButtonTouchColorCSS(color)}
    />
  );
}

const ButtonTouchColorCSS = (color: Props['color']) => css`
  ${arrangeCenterByFlex};
  ${touchButtonReaction};
  width: 50%;
  height: 7px;
  border-radius: 5px;
  background-color: ${buttonColor[color]};
`;

const buttonColor: { [color in Props['color']]: string } = {
  Red: buttonRed,
  Green: buttonGreen,
  Yellow: buttonYellow,
  Blue: buttonBlue,
};

export default ButtonTouchColor;
