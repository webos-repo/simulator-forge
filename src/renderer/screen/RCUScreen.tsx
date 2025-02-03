import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { Orientation } from "@share/structure/orientations";
import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { range } from "lodash";
import { ipcHandler } from "@share/lib/utils";
import ButtonRCUArrow from "../component/rcuButton/ButtonRCUArrow";
import ButtonRCU from "../component/rcuButton/ButtonRCU";
import ButtonRCUColor from "../component/rcuButton/ButtonRCUColor";
import ButtonRCUFunc from "../component/rcuButton/ButtonRCUFunc";
import ButtonRCULong from "../component/rcuButton/ButtonRCULong";
import ButtonRCUMedia from "../component/rcuButton/ButtonRCUMedia";
import ButtonRCUPower from "../component/rcuButton/ButtonRCUPower";

import { arrangeCenterByFlex, arrangeCenterByGrid } from "../styles/partials";

const handleLaunchApp = () => ipcRenderer.send("open-app-dialog");
const handleAddService = () => ipcRenderer.send("open-service-dialog");
const handleCloseApp = () => ipcRenderer.send("close-fg-app");
const handleInspector = () => ipcRenderer.send("toggle-inspector");
const handleTouchMode = () => ipcRenderer.send("rcu-touch-mode-clicked");
const handlePortrait = () => ipcRenderer.send("rcu-portrait-clicked");

const RCUScreen = () => {
  const [touchMode, setTouchMode] = useState(false);
  const [screenOrientation, setScreenOrientation] =
    useState<Orientation>("landscape");

  useEffect(() => {
    ipcRenderer
      .on("touch-mode-changed", ipcHandler(setTouchMode))
      .on("screen-orientation-changed", ipcHandler(setScreenOrientation));
  }, []);

  return (
    <RCUScreenLayout>
      <TopSection>
        <PowerBox>
          <ButtonRCUPower
            iconImage={"/assets/ui_icons/power.png"}
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
        <ButtonRCU unused iconImage={"/assets/ui_icons/asterisk.png"} />
        <ButtonRCU keyCode="0">{0}</ButtonRCU>
        <ButtonRCU unused iconImage={"/assets/ui_icons/dotdotdot.png"} />
      </TopSection>
      <MidSection>
        <LongButtonBox>
          <ButtonRCULong
            type="top"
            unused
            iconImage={"/assets/ui_icons/plus.png"}
            iconNoInvert
          />
          <ButtonRCULong
            type="bottom"
            unused
            iconImage={"/assets/ui_icons/minus.png"}
            iconNoInvert
          />
        </LongButtonBox>
        <ButtonRCU
          keyCode="Mute"
          useOnClick
          iconImage={"/assets/ui_icons/mute.png"}
        />
        <LongButtonBox>
          <ButtonRCULong
            type="top"
            unused
            iconImage={"/assets/ui_icons/up.png"}
            iconNoInvert
          />
          <ButtonRCULong
            type="bottom"
            unused
            iconImage={"/assets/ui_icons/down.png"}
            iconNoInvert
          />
        </LongButtonBox>
        <ButtonRCU
          keyCode="Home"
          useOnClick
          iconImage={"/assets/ui_icons/home.png"}
        />
        <ButtonRCU unused iconImage={"/assets/ui_icons/mic.png"} />
        <ButtonRCU unused iconImage={"/assets/ui_icons/supply.png"} />
      </MidSection>
      <BottomSection>
        <ArrowContainer>
          <ButtonRCUArrow direction="Enter" />
          <ButtonRCUArrow
            direction="ArrowUp"
            iconImage={"/assets/ui_icons/up.png"}
          />
          <ButtonRCUArrow
            direction="ArrowRight"
            iconImage={"/assets/ui_icons/right.png"}
          />
          <ButtonRCUArrow
            direction="ArrowDown"
            iconImage={"/assets/ui_icons/down.png"}
          />
          <ButtonRCUArrow
            direction="ArrowLeft"
            iconImage={"/assets/ui_icons/left.png"}
          />
        </ArrowContainer>
        <IconBox>
          <ButtonRCU keyCode="Back" iconImage={"/assets/ui_icons/back.png"} />
          <ButtonRCUMedia type="Stop" iconImage={"/assets/ui_icons/stop.png"} />
          <ButtonRCU unused iconImage={"/assets/ui_icons/settings.png"} />
        </IconBox>
        <MediaBox>
          <ButtonRCUMedia
            type="Backward"
            iconImage={"/assets/ui_icons/backward.png"}
          />
          <ButtonRCUMedia type="Play" iconImage={"/assets/ui_icons/play.png"} />
          <ButtonRCUMedia
            type="Pause"
            iconImage={"/assets/ui_icons/pause.png"}
          />
          <ButtonRCUMedia
            type="Forward"
            iconImage={"/assets/ui_icons/forward.png"}
          />
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
            screenOrientation === "portrait" ||
            screenOrientation === "reversed_portrait"
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
