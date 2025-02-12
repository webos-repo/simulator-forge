import { makeDB } from "@/main/controller/dbController";
import { simulConfig } from "@/../simul.config";
const simulInfoDB = makeDB("simulatorInfo");

export function setSimulInfoToDB() {
  simulInfoDB.set("webOSTVVersion", simulConfig.webOSTVVersion);
  simulInfoDB.set("simulatorVersion", simulConfig.version);
}
