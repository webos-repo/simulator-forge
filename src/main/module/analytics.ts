import { simulConfig } from "@/../simul.config";
import axios from "axios";
import { machineIdSync } from "node-machine-id";
import { v4 as uuidV4 } from "uuid";

const MEASUREMENT_ID_KEY =
  import.meta.env.DEV || simulConfig.isDevBranch
    ? {
        id: "G-H2BRSMHP0S",
        apiKey: "l9Sg8JtxSGqzflzKuSU9QQ",
      }
    : {
        id: "G-452KJ9BF77",
        apiKey: "vLu6x4NBS3e4riVT6SadWQ",
      };

class Analytics {
  private readonly machineId = machineIdSync();
  private readonly sessionId = uuidV4();
  private readonly measurementApiKey = MEASUREMENT_ID_KEY.apiKey;
  private readonly measurementId = MEASUREMENT_ID_KEY.id;

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
      },
    );
  };

  sendVersionInfo = () => {
    this.sendAnalytics("version_info", {
      webOSTVVersion: simulConfig.webOSTVVersion,
      simulVersion: simulConfig.version,
    }).catch((e) => {
      console.log(e);
    });
  };
}

const analytics = new Analytics();
export default analytics;
