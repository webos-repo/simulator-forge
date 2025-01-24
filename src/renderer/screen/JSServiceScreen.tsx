import { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { ipcHandler } from '@share/lib/utils';
import JSService from '../component/JSService';
import type { JSServiceProps } from '../component/JSService';
import ListViewer from '../component/ListViewer';
import { ipcSender } from '../lib/utils';

export default function JSServiceScreen() {
  const [jsServiceDataList, setJsServiceDataList] = useState<JSServiceProps[]>(
    []
  );

  useEffect(() => {
    ipcRenderer.on(
      'update-js-service-list',
      ipcHandler((data: string) => {
        setJsServiceDataList(JSON.parse(data));
      })
    );
    ipcRenderer.send('js-service-screen-loaded');
  }, []);

  return (
    <ListViewer
      title="JS Service"
      plusButtonHandler={ipcSender('open-service-dialog')}
    >
      {jsServiceDataList?.map((jsServiceData, idx) => (
        <JSService {...jsServiceData} key={idx} />
      ))}
    </ListViewer>
  );
}
