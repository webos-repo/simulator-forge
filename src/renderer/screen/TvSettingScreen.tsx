/* eslint-disable react-hooks/exhaustive-deps */
// TODO: This is prototype. Do Implementation
import React, { useState, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { ipcRenderer } from 'electron';
import { ipcSender } from '../lib/utils';

const TvSettingScreen = () => {
  const models = useMemo(
    () => [
      // TODO: load model list from the local preset file
      { value: 'o20n', label: 'O20N' },
      { value: 'e60n', label: 'E60N' },
      { value: 'k7lp', label: 'K7LP' },
      { value: 'lm21an', label: 'LM21AN' },
    ],
    []
  );

  const [model, setModel] = useState();
  const handleModelChange = useCallback((inputValue: any) => {
    setModel(inputValue);
  }, []);

  return (
    <div className="tv-setting-screen">
      <div className="optionDiv">
        <span className="optionLabel">TV Model</span>
        <Select
          isSearchable
          className="optionCol"
          placeholder="TV Model"
          value={model}
          options={models}
          onChange={handleModelChange}
        />
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
        <button type="button" onClick={ipcSender('setting-cancel')}>
          Cancel
        </button>
        <button type="button" onClick={ipcSender('setting-save')}>
          OK
        </button>
      </div>
    </div>
  );
};

export default TvSettingScreen;
