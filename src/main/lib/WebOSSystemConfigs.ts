import { tvInfo, tvLocation } from '@tvSettings/index';

type WebOSSystemConf = {
  deviceInfo: string;
  country: string;
  timeZone: string;
};

class WebOSSystemConfigs {
  get deviceInfo() {
    const {
      modelName,
      firmwareVersion,
      platformVersion,
      screenWidth,
      screenHeight,
    } = tvInfo.deviceInfo;
    const [platformVersionMajor, platformVersionMinor, platformVersionDot] =
      firmwareVersion.split('.').map((n) => +n);

    return {
      modelName,
      platformVersion: firmwareVersion,
      platformVersionMajor,
      platformVersionMinor,
      platformVersionDot,
      sdkVersion: platformVersion,
      screenWidth,
      screenHeight,
    };
  }

  get country() {
    return {
      country: tvLocation.country,
      smartServiceCountry: tvLocation.country,
    };
  }

  get timeZone() {
    return tvLocation.timeZoneAbbr;
  }

  getInjectionString = (): WebOSSystemConf => {
    return {
      deviceInfo: JSON.stringify(this.deviceInfo, null, 4),
      country: JSON.stringify(this.country),
      timeZone: this.timeZone,
    };
  };
}

const webOSSystemConfigs = new WebOSSystemConfigs();
export default webOSSystemConfigs;
export type { WebOSSystemConf };
