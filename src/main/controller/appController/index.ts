import { listenAppEvent } from "./appHandler";

export default class AppController {
  static init() {
    listenAppEvent();
  }
}
