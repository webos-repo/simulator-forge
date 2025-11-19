import { css } from "@emotion/react";
import type { RCUButtonCommonProps } from "./buttonRCU";
import ButtonRCU from "./buttonRCU";

function ButtonRCUPower(props: RCUButtonCommonProps) {
  return <ButtonRCU {...props} alternativeCSS={buttonPowerCSS} />;
}

const buttonPowerCSS = css`
  position: relative;
  left: -20%;
`;

export default ButtonRCUPower;
