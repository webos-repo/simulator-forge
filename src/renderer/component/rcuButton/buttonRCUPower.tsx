import { css } from "@emotion/react";
import ButtonRCU from "./buttonRCU";
import type { RCUButtonCommonProps } from "./buttonRCU";

function ButtonRCUPower(props: RCUButtonCommonProps) {
  return <ButtonRCU {...props} alternativeCSS={buttonPowerCSS} />;
}

const buttonPowerCSS = css`
  position: relative;
  left: -20%;
`;

export default ButtonRCUPower;
