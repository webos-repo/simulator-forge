/* eslint-disable prefer-const */
import { get } from 'lodash';
import { generateHash } from '../lib/hash';
import tvSettingsDB from './tvSettingsDB';
import { webOSTVVersion } from '../../../package.json';

const firmwareVersionMap = {
  '6.0': '02.00.94',
  '22': '02.05.69',
  '23': '02.08.09',
  '24': '02.11.66',
};
const platformVersionMap = {
  '6.0': '6.0.0',
  '22': '7.0.0',
  '23': '8.0.0',
  '24': '9.0.0',
};

const chipMap = {
  '6.0': 'O20N',
  '22': 'O22',
  '23': 'O22N',
  '24': 'O24',
};

let LGUDID = '';
const highContrast = 'off';
const voiceControl = 'default';
const modelName = `WEBOS${webOSTVVersion}_SIMULATOR`;
const firmwareVersion = get(firmwareVersionMap, webOSTVVersion, '00.00.00');
const platformVersion = get(platformVersionMap, webOSTVVersion, '00.00.00');
const isUHD = false;
const broadcastType = 'ATSC';
const countryGroup = 'US';
const socChipType = get(chipMap, webOSTVVersion, 'O20');
const boardType = `${socChipType}_${broadcastType}_${countryGroup}`; // ex) O22N_ATSC_US
const panelResolution = 'FHD'; // HD , FHD , UD, 8K
const displayType = 'LCD'; // PDP, LCD, OLED
const ddrSize = '2.5G';
const support3D = false;
const supportHDR = false;
const supportDolbyHDRContents = false;
const supportDolbyTVATMOS = false;
const screenWidth = 1920;
const screenHeight = 1080;
const soundModeType = 'LG Sound Engine';
const platformBizType = 'LG';
const mainboardMaker = 'LG';
const brandName = 'LG';
const manufacturer = 'LG Electronics';
const profileList = [] as const; // for tuner
const supportTunerless = false;

class TVInfo {
  constructor() {
    this.initLGUDID();
  }

  get deviceInfo() {
    return {
      modelName,
      firmwareVersion,
      platformVersion,
      screenWidth,
      screenHeight,
    };
  }
  get systemInfo() {
    return {
      modelName,
      firmwareVersion,
      sdkVersion: platformVersion,
      boardType,
      UHD: isUHD + '',
      _3d: support3D + '',
    };
  }
  get configs() {
    return {
      'tv.model.modelname': modelName,
      'tv.model.sysType': broadcastType,
      'tv.nyx.platformVersion': platformVersion,
      'tv.nyx.firmwareVersion': firmwareVersion,
      'tv.nyx.tvBroadcastSystem': broadcastType,
      'tv.hw.panelResolution': panelResolution,
      'tv.hw.displayType': displayType,
      'tv.hw.ddrSize': ddrSize,
      'tv.hw.SoCChipType': socChipType,
      'tv.model.supportHDR': supportHDR,
      'tv.config.supportDolbyHDRContents': supportDolbyHDRContents,
      'tv.config.supportDolbyTVATMOS': supportDolbyTVATMOS,
      'tv.model.soundModeType': soundModeType,
      'tv.rmm.grpCodeName': countryGroup,
      'tv.model.TVBrandName': brandName,
      'tv.model.TVManufacturer': manufacturer,
      'tv.model.mainboardMaker': mainboardMaker,
      'wee.platformBizType': platformBizType,
      'profile.list': profileList,
      'com.webos.service.utp.supportTunerless': supportTunerless,
    };
  }
  get tvSystemInfo() {
    return {
      countryGroup,
      tvSystemName: broadcastType,
    };
  }
  get highContrast() {
    return highContrast;
  }
  get voiceControl() {
    return voiceControl;
  }
  get LGUDID() {
    return LGUDID;
  }

  private initLGUDID = () => {
    if (!tvSettingsDB.has('LGUDID')) {
      const hash = generateHash({ length: 32, encoding: 'hex' });
      const newLGUDID = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(
        12,
        16
      )}-${hash.slice(16, 20)}-${hash.slice(20)}`;
      tvSettingsDB.set('LGUDID', newLGUDID);
      LGUDID = newLGUDID;
    } else {
      LGUDID = tvSettingsDB.get('LGUDID');
    }
  };
}

export default TVInfo;
