import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { grayBtnBgColor, grayBtnFtColor } from '../styles/colors';
import { arrangeCenterByFlex } from '../styles/partials';

type Props = {
  contents: string[];
};

const Notification = ({ contents }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setVisible(false), 5000);
  }, [setVisible]);

  return (
    <NotificationBox visible={visible} data-testid="Notification">
      {contents.map((content, idx) => (
        <span key={idx}>{content}</span>
      ))}
    </NotificationBox>
  );
};

const NotificationBox = styled.div<{ visible: boolean }>`
  ${arrangeCenterByFlex};
  flex-direction: column;
  position: absolute;
  top: 720px;
  left: 320px;
  z-index: 10;
  width: 640px;
  height: 120px;
  background-color: ${grayBtnBgColor};
  color: ${grayBtnFtColor};
  font-size: 1.2rem;
  font-family: 'LG Smart 2.0 Regular', sans-serif;
  border-radius: 15px;
  line-height: 1.5;
  transition: all 0.3s;
  user-select: none;
  visibility: hidden;

  ${({ visible }) =>
    visible &&
    css`
      visibility: visible;
      top: 570px;
    `}
`;

export default Notification;
