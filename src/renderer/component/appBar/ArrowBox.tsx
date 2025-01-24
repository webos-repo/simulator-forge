import styled from '@emotion/styled';

import ArrowLeft from 'assets/ui_icons/arrow_left.png';
import ArrowRight from 'assets/ui_icons/arrow-right.png';

type Props = {
  scrollHorizontal: (
    deltaX: number,
    deltaY: number,
    fromButton: boolean
  ) => void;
  visible: boolean;
  direction: 'left' | 'right';
};

function ArrowBox({ scrollHorizontal, visible, direction }: Props) {
  const deltaX = direction === 'left' ? -150 : 150;

  return (
    <ArrowBoxLayout
      onClick={() => scrollHorizontal(deltaX, 0, true)}
      data-testid={`ArrowBox-${direction}`}
    >
      <Arrow
        visible={visible}
        direction={direction}
        data-testid={`Arrow-${direction}`}
      />
    </ArrowBoxLayout>
  );
}

const ArrowBoxLayout = styled.div`
  height: 100%;
  width: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  filter: invert(100%);
  opacity: 0.2;

  &:hover {
    opacity: 0.8;
  }
`;

const Arrow = styled.div<{
  direction: Props['direction'];
  visible: Props['visible'];
}>`
  width: 80%;
  height: 50%;
  transition: opacity 0.5s;
  background-size: cover;
  background-position: center;
  background-image: url(${({ direction }) =>
    direction === 'left' ? ArrowLeft : ArrowRight});
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export default ArrowBox;
