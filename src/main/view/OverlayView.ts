import { BrowserView } from 'electron';

abstract class OverlayView extends BrowserView {
  abstract name: string;
  abstract isShowing: boolean;
  removeCallbackHandler?: NodeJS.Timeout;

  abstract show(data?: any): void;
  abstract hide(): void;
}

export default OverlayView;
