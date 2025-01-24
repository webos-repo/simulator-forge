import styled from '@emotion/styled';
import React from 'react';
import ButtonTouch from '../component/rcuButton/ButtonTouch';
import ButtonTouchArrow from '../component/rcuButton/ButtonTouchArrow';
import ButtonTouchColor from '../component/rcuButton/ButtonTouchColor';

import homeImage from 'assets/ui_icons/home.png';
import backImage from 'assets/ui_icons/back.png';
import settingsImage from 'assets/ui_icons/settings.png';
import dotImage from 'assets/ui_icons/dot.png';
import upImage from 'assets/ui_icons/up.png';
import downImage from 'assets/ui_icons/down.png';
import rightImage from 'assets/ui_icons/right.png';
import leftImage from 'assets/ui_icons/left.png';
import { ipcSender } from '../lib/utils';

function TouchRemoteScreen() {
  return (
    <TouchRemoteScreenLayout
      onFocusCapture={ipcSender('overlay-focused')}
      data-testid="TouchRemoteScreenLayout"
    >
      <MainSection>
        <ButtonTouch unused iconImage={settingsImage} />
        <ButtonTouchArrow direction="ArrowUp" iconImage={upImage} />
        <ButtonTouch unused iconImage={dotImage} />
        <ButtonTouchArrow direction="ArrowLeft" iconImage={leftImage} />
        <ButtonTouchArrow direction="Enter" />
        <ButtonTouchArrow direction="ArrowRight" iconImage={rightImage} />
        <ButtonTouch keyCode="Back" iconImage={backImage} />
        <ButtonTouchArrow direction="ArrowDown" iconImage={downImage} />
        <ButtonTouch keyCode="Home" useOnClick iconImage={homeImage} />
      </MainSection>
      <ColorSection>
        <ButtonTouchColor color="Red" />
        <ButtonTouchColor color="Green" />
        <ButtonTouchColor color="Yellow" />
        <ButtonTouchColor color="Blue" />
      </ColorSection>
    </TouchRemoteScreenLayout>
  );
}

const TouchRemoteScreenLayout = styled.main`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(64, 64, 64, 0.9);
  font-size: 1.2rem;
  display: grid;
  grid-template-columns: 3.21fr 1fr;
  box-sizing: border-box;
`;

const MainSection = styled.section`
  display: grid;
  grid-template: 1fr 0.6fr 1fr / 1fr 0.6fr 1fr;
`;

const ColorSection = styled.section`
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  justify-items: center;
  align-items: center;
`;

export default TouchRemoteScreen;
