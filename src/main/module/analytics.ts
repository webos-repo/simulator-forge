import { isDev } from '@share/constant/env';
import axios from 'axios';
import { machineIdSync } from 'node-machine-id';
import { v4 as uuidV4 } from 'uuid';
import { webOSTVVersion, version as simulVersion } from '../../../package.json';

const MEASUREMENT_ID_KEY = {
  dev: {
    id: 'G-H2BRSMHP0S',
    apiKey: 'l9Sg8JtxSGqzflzKuSU9QQ',
  },
  prod: {
    id: 'G-452KJ9BF77',
    apiKey: 'vLu6x4NBS3e4riVT6SadWQ',
  },
};

class Analytics {
  private readonly machineId = machineIdSync();
  private readonly sessionId = uuidV4();
  private readonly measurementApiKey =
    MEASUREMENT_ID_KEY[isDev ? 'dev' : 'prod'].apiKey;
  private readonly measurementId =
    MEASUREMENT_ID_KEY[isDev ? 'dev' : 'prod'].id;

  init = () => {
    this.sendVersionInfo();
  };

  sendAnalytics = async (eventName: string, params: any) => {
    return axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.measurementApiKey}`,
      {
        client_id: this.machineId,
        events: [
          {
            name: eventName,
            params: {
              machineId: this.machineId,
              sessionId: this.sessionId,
              ...params,
            },
          },
        ],
      }
    );
  };

  sendVersionInfo = () => {
    this.sendAnalytics('version_info', {
      webOSTVVersion,
      simulVersion,
    }).catch((e) => {
      console.log(e);
    });
  };
}

const analytics = new Analytics();
export default analytics;
