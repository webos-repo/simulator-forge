import { listenAppEvent } from "./appHandler";

export class AppController {
  static init() {
    listenAppEvent();
  }
}
