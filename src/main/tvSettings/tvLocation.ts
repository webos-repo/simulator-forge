/* eslint-disable prefer-const */

import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
import { Navigator } from 'node-navigator';
import tzlookup from 'tz-lookup';
import wc from 'which-country';

const locale = 'en-US'; // TODO
const localeRegion = 'US'; // TODO
let country = 'USA'; // ex) 'KOR', 'USA'
let timeZone = 'America/New_York'; // ex) 'Asia/Seoul', 'America/New_York'
let zoneAbbr = 'EST'; // ex) 'KST', 'EST'

const setDefaultLocation = () => {
  country = 'USA';
  timeZone = 'America/New_York';
  zoneAbbr = 'EST';
};

class TVLocation {
  get locale() {
    return locale;
  }
  get localeRegion() {
    return localeRegion;
  }
  get country() {
    return country;
  }
  get countryAlpha2() {
    return countries.alpha3ToAlpha2(this.country); // 'KR', 'US'
  }
  get timeZone() {
    return timeZone;
  }
  get currentTime() {
    return moment().tz(this.timeZone);
  }
  get timeZoneAbbr() {
    return zoneAbbr;
  }

  updateLocationData = () => {
    const navigator = new Navigator();

    try {
      navigator.geolocation.getCurrentPosition((position) => {
        try {
          if (!position) {
            return;
          }
          const { latitude, longitude } = position;
          country = wc([longitude, latitude]);
          timeZone = tzlookup(latitude, longitude);
          zoneAbbr = moment().tz(timeZone)?.zoneAbbr();
        } catch {
          setDefaultLocation();
        }
      });
    } catch {
      setDefaultLocation();
    }
  };
}

export default TVLocation;
