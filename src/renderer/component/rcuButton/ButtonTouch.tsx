import { css } from '@emotion/react';
import { touchButtonReaction } from '../../styles/effects';
import { arrangeCenterByFlex } from '../../styles/partials';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';

function ButtonTouch(props: RCUButtonCommonProps) {
  return <ButtonRCU {...props} isTouchRemote alternativeCSS={ButtonTouchCSS} />;
}

const ButtonTouchCSS = css`
  ${arrangeCenterByFlex};
  ${touchButtonReaction};
`;

export default ButtonTouch;
