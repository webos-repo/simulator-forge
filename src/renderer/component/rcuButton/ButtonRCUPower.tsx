import { css } from '@emotion/react';
import ButtonRCU from './ButtonRCU';
import type { RCUButtonCommonProps } from './ButtonRCU';

function ButtonRCUPower(props: RCUButtonCommonProps) {
  return <ButtonRCU {...props} alternativeCSS={buttonPowerCSS} />;
}

const buttonPowerCSS = css`
  position: relative;
  left: -20%;
`;

export default ButtonRCUPower;
