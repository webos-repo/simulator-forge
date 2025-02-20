import { ipcSender } from "@/renderer/lib/utils";

export default function TvSettingScreen() {
  return (
    <div className="tv-setting-screen">
      <div className="optionDiv">
        <span className="optionLabel">TV Model</span>
      </div>
      <p />
      <div className="optionDiv">
        <span className="optionLabel">Options #1</span>
        <input className="optionCol" type="text" />
      </div>
      <div className="optionDiv">
        <span className="optionLabel">Options #2</span>
        <input className="optionCol" type="text" />
      </div>
      <div className="optionDiv">
        <span className="optionLabel">Options #3</span>
        <input className="optionCol" type="text" />
      </div>
      <div className="buttonDiv">
        <button type="button" onClick={ipcSender("setting-cancel")}>
          Cancel
        </button>
        <button type="button" onClick={ipcSender("setting-save")}>
          OK
        </button>
      </div>
    </div>
  );
}
