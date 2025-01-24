import { makeDB } from '@controller/dbController';
import { webOSTVVersion, version } from '../../../package.json';

const simulInfoDB = makeDB('simulatorInfo');

export function setSimulInfoToDB() {
  simulInfoDB.set('webOSTVVersion', webOSTVVersion);
  simulInfoDB.set('simulatorVersion', version);
}
