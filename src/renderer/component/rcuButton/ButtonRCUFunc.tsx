import { css } from '@emotion/react';
import ButtonRCU from './ButtonRCU';

type Props = {
  value: string;
  onClick: () => void;
  active?: boolean;
};

function ButtonRCUFunc({ value, onClick, active }: Props) {
  return (
    <ButtonRCU
      additionalCSS={buttonFuncCSS(!!active)}
      customHandler={onClick}
      useOnClick
    >
      {value}
    </ButtonRCU>
  );
}

const buttonFuncCSS = (active: boolean) => css`
  width: 45vw;
  border-radius: 15vw;

  ${active &&
  css`
    background: rgba(170, 238, 238, 0.5);
  `}
`;

export default ButtonRCUFunc;
