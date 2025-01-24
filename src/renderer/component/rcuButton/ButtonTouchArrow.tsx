import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import type { DirectionKeyCode } from '@share/structure/orientations';
import { grayBtnBgColor } from '../../styles/colors';
import { arrangeCenterByFlex } from '../../styles/partials';
import type { RCUButtonCommonProps } from './ButtonRCU';
import ButtonTouch from './ButtonTouch';

type Props = RCUButtonCommonProps & {
  direction: DirectionKeyCode;
};

function ButtonTouchArrow(props: Props) {
  const { direction } = props;
  return (
    <ButtonTouchArrowLayout>
      <BackgroundBox direction={direction} />
      <ButtonTouch {...props} keyCode={direction}>
        {direction === 'Enter' && <EnterText>OK</EnterText>}
      </ButtonTouch>
    </ButtonTouchArrowLayout>
  );
}

const ButtonTouchArrowLayout = styled.div`
  ${arrangeCenterByFlex};
  position: relative;
  overflow: hidden;
`;

const BackgroundBox = styled.div<{ direction: Props['direction'] }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${grayBtnBgColor};
  ${({ direction }) => boxDirectionCSSMap[direction]}
`;

const boxDirectionCSSMap: { [key in Props['direction']]: SerializedStyles } = {
  ArrowUp: css`
    top: 0;
    margin-top: 10px;
    height: 70px;
    border-radius: 18px;
  `,

  ArrowDown: css`
    bottom: 0;
    margin-bottom: 10px;
    height: 70px;
    border-radius: 18px;
  `,

  ArrowLeft: css`
    left: 0;
    margin-left: 10px;
    width: 70px;
    border-radius: 18px;
  `,

  ArrowRight: css`
    right: 0;
    margin-right: 10px;
    width: 70px;
    border-radius: 18px;
  `,

  Enter: css``,
};

const EnterText = styled.span`
  z-index: 10;
  color: rgba(255, 255, 255, 0.7);
`;

export default ButtonTouchArrow;
