import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { Orientation } from '@share/structure/orientations';
import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { range } from 'lodash';
import { ipcHandler } from '@share/lib/utils';
import ButtonRCUArrow from '../component/rcuButton/ButtonRCUArrow';
import ButtonRCU from '../component/rcuButton/ButtonRCU';
import ButtonRCUColor from '../component/rcuButton/ButtonRCUColor';
import ButtonRCUFunc from '../component/rcuButton/ButtonRCUFunc';
import ButtonRCULong from '../component/rcuButton/ButtonRCULong';
import ButtonRCUMedia from '../component/rcuButton/ButtonRCUMedia';
import ButtonRCUPower from '../component/rcuButton/ButtonRCUPower';

import powerImage from 'assets/ui_icons/power.png';
import muteImage from 'assets/ui_icons/mute.png';
import micImage from 'assets/ui_icons/mic.png';
import homeImage from 'assets/ui_icons/home.png';
import backImage from 'assets/ui_icons/back.png';
import settingImage from 'assets/ui_icons/settings.png';
import supplyImage from 'assets/ui_icons/supply.png';
import upImage from 'assets/ui_icons/up.png';
import downImage from 'assets/ui_icons/down.png';
import rightImage from 'assets/ui_icons/right.png';
import leftImage from 'assets/ui_icons/left.png';
import plusImage from 'assets/ui_icons/plus.png';
import minusImage from 'assets/ui_icons/minus.png';
import playImage from 'assets/ui_icons/play.png';
import pauseImage from 'assets/ui_icons/pause.png';
import stopImage from 'assets/ui_icons/stop.png';
import backwardImage from 'assets/ui_icons/backward.png';
import dotdotdot from 'assets/ui_icons/dotdotdot.png';
import asterisk from 'assets/ui_icons/asterisk.png';
import { arrangeCenterByFlex, arrangeCenterByGrid } from '../styles/partials';

const forwardImage = backwardImage;
const handleLaunchApp = () => ipcRenderer.send('open-app-dialog');
const handleAddService = () => ipcRenderer.send('open-service-dialog');
const handleCloseApp = () => ipcRenderer.send('close-fg-app');
const handleInspector = () => ipcRenderer.send('toggle-inspector');
const handleTouchMode = () => ipcRenderer.send('rcu-touch-mode-clicked');
const handlePortrait = () => ipcRenderer.send('rcu-portrait-clicked');

const RCUScreen = () => {
  const [touchMode, setTouchMode] = useState(false);
  const [screenOrientation, setScreenOrientation] =
    useState<Orientation>('landscape');

  useEffect(() => {
    ipcRenderer
      .on('touch-mode-changed', ipcHandler(setTouchMode))
      .on('screen-orientation-changed', ipcHandler(setScreenOrientation));
  }, []);

  return (
    <RCUScreenLayout>
      <TopSection>
        <PowerBox>
          <ButtonRCUPower
            iconImage={powerImage}
            iconNoInvert
            iconAdditionalCSS={css`
              width: 16vw;
              height: 17vw;
            `}
          />
        </PowerBox>
        {...range(1, 10).map((n) => (
          <ButtonRCU keyCode={`${n}`}>{n}</ButtonRCU>
        ))}
        <ButtonRCU unused iconImage={asterisk} />
        <ButtonRCU keyCode="0">{0}</ButtonRCU>
        <ButtonRCU unused iconImage={dotdotdot} />
      </TopSection>
      <MidSection>
        <LongButtonBox>
          <ButtonRCULong type="top" unused iconImage={plusImage} iconNoInvert />
          <ButtonRCULong
            type="bottom"
            unused
            iconImage={minusImage}
            iconNoInvert
          />
        </LongButtonBox>
        <ButtonRCU keyCode="Mute" useOnClick iconImage={muteImage} />
        <LongButtonBox>
          <ButtonRCULong type="top" unused iconImage={upImage} iconNoInvert />
          <ButtonRCULong
            type="bottom"
            unused
            iconImage={downImage}
            iconNoInvert
          />
        </LongButtonBox>
        <ButtonRCU keyCode="Home" useOnClick iconImage={homeImage} />
        <ButtonRCU unused iconImage={micImage} />
        <ButtonRCU unused iconImage={supplyImage} />
      </MidSection>
      <BottomSection>
        <ArrowContainer>
          <ButtonRCUArrow direction="Enter" />
          <ButtonRCUArrow direction="ArrowUp" iconImage={upImage} />
          <ButtonRCUArrow direction="ArrowRight" iconImage={rightImage} />
          <ButtonRCUArrow direction="ArrowDown" iconImage={downImage} />
          <ButtonRCUArrow direction="ArrowLeft" iconImage={leftImage} />
        </ArrowContainer>
        <IconBox>
          <ButtonRCU keyCode="Back" iconImage={backImage} />
          <ButtonRCUMedia type="Stop" iconImage={stopImage} />
          <ButtonRCU unused iconImage={settingImage} />
        </IconBox>
        <MediaBox>
          <ButtonRCUMedia type="Backward" iconImage={backwardImage} />
          <ButtonRCUMedia type="Play" iconImage={playImage} />
          <ButtonRCUMedia type="Pause" iconImage={pauseImage} />
          <ButtonRCUMedia type="Forward" iconImage={forwardImage} />
        </MediaBox>
        <ColorBox>
          <ButtonRCUColor color="Red" />
          <ButtonRCUColor color="Green" />
          <ButtonRCUColor color="Yellow" />
          <ButtonRCUColor color="Blue" />
        </ColorBox>
      </BottomSection>

      <FunctionSection>
        <ButtonRCUFunc value="App" onClick={() => handleLaunchApp()} />
        <ButtonRCUFunc value="Service" onClick={() => handleAddService()} />
        <ButtonRCUFunc value="Inspect" onClick={() => handleInspector()} />
        <ButtonRCUFunc value="Close" onClick={() => handleCloseApp()} />
        <ButtonRCUFunc
          value="Touch"
          onClick={() => handleTouchMode()}
          active={touchMode}
        />
        <ButtonRCUFunc
          value="Portrait"
          onClick={() => handlePortrait()}
          active={
            screenOrientation === 'portrait' ||
            screenOrientation === 'reversed_portrait'
          }
        />
      </FunctionSection>
    </RCUScreenLayout>
  );
};

const RCUScreenLayout = styled.main`
  box-sizing: border-box;
  padding-top: 8vw;
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  background-image: radial-gradient(#303030 10%, black);
  display: grid;
  grid-template-rows: 28vh 17vh 32.5vh 1fr;
  font-size: 12vw;
`;

const TopSection = styled.section`
  ${arrangeCenterByGrid};
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1.2fr repeat(4, 1fr);
  color: white;
`;

const PowerBox = styled.div`
  ${arrangeCenterByFlex};
  grid-area: 1/1/2/4;
  width: 100%;
  height: 100%;
`;

const MidSection = styled.section`
  ${arrangeCenterByGrid};
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 2.6fr 1fr;
`;

const LongButtonBox = styled.div`
  ${arrangeCenterByFlex};
  width: 100%;
  height: 100%;
  flex-direction: column;
`;

const BottomSection = styled.section`
  ${arrangeCenterByGrid};
  grid-template-rows: 1fr 4.5vh 5vh 5vh;
`;

const ArrowContainer = styled.div`
  ${arrangeCenterByGrid};
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
  width: 80vw;
  height: 80vw;
  border-radius: 100%;
  background: radial-gradient(#404040, black);
  position: relative;
`;

const IconBox = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: flex-end;
  justify-items: center;
`;

const MediaBox = styled.div`
  ${arrangeCenterByGrid};
  width: 100%;
  height: 80%;
  margin-top: 0.7vh;
  padding: 0.5vh 2vw 0 2vw;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  box-sizing: border-box;
`;

const ColorBox = styled.div`
  ${arrangeCenterByGrid};
  padding: 0.5vh 2vw 0 2vw;
  box-sizing: border-box;
  width: 100%;
  height: 80%;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const FunctionSection = styled.section`
  ${arrangeCenterByGrid};
  margin: 0 4vw 12vw 4vw;
  align-self: end;
  row-gap: 4vw;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  font-size: 9.5vw;
`;

export default RCUScreen;
