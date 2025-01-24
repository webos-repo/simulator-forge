import plusImage from 'assets/ui_icons/js-service-plus.png';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  plusButtonHandler: () => void;
  children: ReactNode;
};

function ListViewer({ title, plusButtonHandler, children }: Props) {
  return (
    <ListViewerLayout>
      <TopSection>
        <TitleSpan>{title}</TitleSpan>
        <PlusButton onClick={plusButtonHandler} data-testid="PlusButton" />
      </TopSection>
      <ListSection>{children}</ListSection>
    </ListViewerLayout>
  );
}

const ListViewerLayout = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-image: linear-gradient(#303030 20%, #101010 50%, #303030 80%);
  user-select: none;
  position: relative;
`;

const TopSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  min-height: 50px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(70, 70, 70, 1);
  padding: 0 15px;
`;

const TitleSpan = styled.span`
  font-size: 18pt;
  color: rgba(255, 255, 255, 0.9);
`;

const PlusButton = styled.button`
  width: 30px;
  height: 30px;
  background-image: url(${plusImage});
  background-size: cover;
  background-position: center;
  filter: invert(70%);
  transition: all 200ms;
  cursor: pointer;

  &:hover {
    filter: invert(100%);
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.9);
  }
`;

const ListSection = styled.section`
  padding: 5px 15px 0 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 13px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.8);
    background-clip: padding-box;
    border: 2px solid transparent;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-left: 1px solid rgba(70, 70, 70, 1);
  }
`;

export default ListViewer;
