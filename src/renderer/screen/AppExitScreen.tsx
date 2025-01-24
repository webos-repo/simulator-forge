import styled from '@emotion/styled';
import AppExitButton from '../component/AppExitButton';
import { ipcSender } from '../lib/utils';
import { fontColorWhite, viewBgColor } from '../styles/colors';
import { arrangeCenterByFlex } from '../styles/partials';

function AppExitScreen() {
  return (
    <AppExitLayout
      onFocusCapture={ipcSender('overlay-focused')}
      data-testid="AppExitLayout"
    >
      <CommentParagraph>Do you want to exit the app?</CommentParagraph>
      <ButtonBox>
        <AppExitButton clickHandler={ipcSender('close-fg-app')} value="Exit" />
        <AppExitButton
          clickHandler={ipcSender('app-exit-cancel')}
          value="Cancel"
        />
      </ButtonBox>
    </AppExitLayout>
  );
}

const AppExitLayout = styled.section`
  ${arrangeCenterByFlex};
  height: 100vh;
  background-color: ${viewBgColor};
  font-family: 'LG Smart 2.0 Regular', sans-serif;
  font-size: 1.2rem;
  overflow: hidden;
`;

const CommentParagraph = styled.p`
  display: flex;
  align-items: center;
  flex-grow: 2.5;
  color: ${fontColorWhite};
  padding-left: 5vw;
`;

const ButtonBox = styled.div`
  ${arrangeCenterByFlex};
  flex-direction: column;
  flex-grow: 1;
`;

export default AppExitScreen;
