import { HashRouter as Router, Route, Routes } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import AppExitScreen from "./screen/AppExitScreen";
import AppListScreen from "./screen/AppListScreen";
import JSServiceScreen from "./screen/JSServiceScreen";
import MainScreen from "./screen/MainScreen";
import RCUScreen from "./screen/RCUScreen";
import TouchRemoteScreen from "./screen/TouchRemoteScreen";
import TouchScreen from "./screen/TouchScreen";
import TvSettingScreen from "./screen/TvSettingScreen";
import VKBScreen from "./screen/VKBScreen";
import ScreenSaverScreen from "./screen/ScreenSaverScreen";

function App() {
  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/rcu" element={<RCUScreen />} />
          <Route path="/app_list" element={<AppListScreen />} />
          <Route path="/app_exit" element={<AppExitScreen />} />
          <Route path="/js_service" element={<JSServiceScreen />} />
          <Route path="/tv_setting" element={<TvSettingScreen />} />
          <Route path="/touch" element={<TouchScreen />} />
          <Route path="/touch_remote" element={<TouchRemoteScreen />} />
          <Route path="/screen_saver" element={<ScreenSaverScreen />} />
          <Route
            path="/keyboard/:inputType/:initOrn"
            element={<VKBScreen />}
          />{" "}
        </Routes>
      </Router>
    </>
  );
}

export default App;
