import { simulConfig } from "@/../simul.config";
import { makeDB } from "@/main/controller/dbController";
const simulInfoDB = makeDB("simulatorInfo");

export function setSimulInfoToDB() {
  simulInfoDB.set("webOSTVVersion", simulConfig.webOSTVVersion);
  simulInfoDB.set("simulatorVersion", simulConfig.version);
}
