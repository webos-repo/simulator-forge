import "react-simple-keyboard/build/css/index.css";
import { ipcSender } from "@/renderer/lib/utils";
import { blackBlue } from "@/renderer/styles/colors";
import getReactSimpleKeyboardCustomCSS from "@/renderer/styles/vkbCustom";
import {
  defaultVKBLayout,
  numberVKBLayout,
  vkbDisplay,
} from "@/renderer/styles/vkbLayouts";
import { ipcHandler } from "@/share/lib/utils";
import type { Orientation2Way } from "@/share/structure/orientations";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import SimpleKeyboard from "react-simple-keyboard";
import keyNavigation from "simple-keyboard-key-navigation";

const unusedKeyNames = ["{eng}", "{aa}", "{voice}", "", "{none}", "{blank}"];
let keyboard: any;
let kbdNavigation: any;

type Params = {
  inputType: string;
};

export default function VkbScreen({ inputType }: Params) {
  const [layoutName, setLayoutName] = useState("default");
  const [orn, setOrn] = useState<Orientation2Way>("landscape");
  const vkbLayout = getVKBLayout(inputType!);

  const handleKeyPress = (pressedKeyName: string) => {
    switch (pressedKeyName) {
      case "{shift}":
        setLayoutName(layoutName === "default" ? "shift" : "default");
        break;
      case "{symbol}":
      case "{symbol_num}":
      case "{abc}":
        setLayoutName(layoutName === "symbol" ? "default" : "symbol");
        break;
      default:
    }
    if (unusedKeyNames.includes(pressedKeyName)) {
      return;
    }
    const pressedKeyValue = convertVKBKey(pressedKeyName);
    if (pressedKeyValue) {
      window.ipcRenderer.send("vkb-key-pressed", pressedKeyValue);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseenter", () => {
      window.ipcRenderer.send("main-window-mouseenter");
    });
    window.ipcRenderer.on("reloaded", ipcHandler(setOrn));
    window.ipcRenderer.on("window-orientation-changed", ipcHandler(setOrn));
    window.ipcRenderer.on("be-hidden", resetMarker);
    window.ipcRenderer.on("rcu-pressed", ipcHandler(handleNavigation));
  }, []);

  return (
    <VKBScreenLayout
      orn={orn}
      data-orn={orn}
      css={getReactSimpleKeyboardCustomCSS(orn)}
      onFocusCapture={ipcSender("overlay-focused")}
      data-testid="VKBScreenLayout"
    >
      <SimpleKeyboard
        layoutName={layoutName}
        layout={vkbLayout}
        display={vkbDisplay}
        onKeyPress={handleKeyPress}
        mergeDisplay
        enableKeyNavigation
        modules={[keyNavigation]}
        onModulesLoaded={(simpleKeyboard: any) => {
          keyboard = simpleKeyboard;
          kbdNavigation = simpleKeyboard.modules.keyNavigation;
          setNavigationHandler();
          makeMouseOverToNavigationMove();
        }}
        onRender={() => {
          if (!keyboard) return;
          makeMouseOverToNavigationMove();
        }}
        theme=""
      />
    </VKBScreenLayout>
  );
}

const VKBScreenLayout = styled.main<{ orn: Orientation2Way }>`
  height: 100vh;
  margin: 0;
  box-sizing: border-box;
  background-color: ${blackBlue};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0 20px 0;

  ${({ orn }) =>
    orn === "portrait" &&
    css`
      padding: 5px 0 5px 0;
    `}
`;

const getVKBLayout = (layoutName: string) => {
  switch (layoutName) {
    case "number":
    case "tel":
      return numberVKBLayout;
    default:
      return defaultVKBLayout;
  }
};

const convertVKBKey = (keyName: string) => {
  let keyValue: string | null;
  switch (keyName) {
    case "{bksp}":
      keyValue = "Backspace";
      break;
    case "{enter}":
      keyValue = "Enter";
      break;
    case "{shift}":
      keyValue = "Shift";
      break;
    case "{symbol}":
      keyValue = null;
      break;
    case "{clearall}":
      keyValue = "ClearAll";
      break;
    case "{arrowleft}":
      keyValue = "ArrowLeft";
      break;
    case "{arrowright}":
      keyValue = "ArrowRight";
      break;
    case "{space}":
      keyValue = " ";
      break;
    default:
      keyValue = keyName;
      break;
  }
  return keyValue;
};

const makeMouseOverToNavigationMove = () => {
  if (!keyboard) return;
  const buttons = document.querySelectorAll(".hg-button");
  buttons.forEach((button: any) => {
    button.addEventListener("mouseover", () => {
      const rawData = button.getAttribute("data-skbtnuid");
      const rawDataSliced = rawData.slice(rawData.indexOf("-") + 1);
      const rowPos = Number.parseInt(
        rawDataSliced.slice(
          rawDataSliced.indexOf("r") + 1,
          rawDataSliced.indexOf("b"),
        ),
        10,
      );
      const btnPos = Number.parseInt(
        rawDataSliced.slice(rawDataSliced.indexOf("b") + 1),
        10,
      );
      keyboard.modules.keyNavigation.setMarker(rowPos, btnPos);
    });
  });
};

const resetMarker = () => {
  if (!keyboard) return;
  keyboard.modules.keyNavigation.setMarker(0, 0);
};

const setNavigationHandler = () => {
  document.addEventListener("keydown", (e) => {
    handleNavigation(e.key);
  });
};

const checkDisabled = (y: number, x: number) => {
  const btn = kbdNavigation.getButtonAt(y, x);
  if (!btn) return true;
  return unusedKeyNames.includes(btn.getAttribute("data-skbtn"));
};

const handleNavigation = (key: string) => {
  if (!keyboard) return;
  const beforePos = kbdNavigation.lastMarkerPos;
  let isVerticalMove = false;
  switch (key) {
    case "ArrowUp":
      kbdNavigation.up();
      isVerticalMove = true;
      break;
    case "ArrowDown":
      kbdNavigation.down();
      isVerticalMove = true;
      break;
    case "ArrowRight":
      kbdNavigation.right();
      break;
    case "ArrowLeft":
      kbdNavigation.left();
      break;
    case "Enter":
      kbdNavigation.press();
      return;
    default:
  }

  if (kbdNavigation.lastMarkerPos === beforePos) {
    if (isVerticalMove) {
      window.ipcRenderer.send("req-vkb-hide");
      return;
    }
    const curY = kbdNavigation.lastMarkerPos[0];
    let x = 0;
    if (key === "ArrowRight") {
      while (checkDisabled(curY, x)) {
        x += 1;
      }
    } else {
      x = 20;
      while (checkDisabled(curY, x)) {
        x -= 1;
      }
    }
    kbdNavigation.setMarker(curY, x);
    return;
  }
  if (
    checkDisabled(
      kbdNavigation.lastMarkerPos[0],
      kbdNavigation.lastMarkerPos[1],
    )
  ) {
    handleNavigation(key);
  }
};
