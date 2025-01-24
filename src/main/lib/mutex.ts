export default class Mutex {
  locked = false;
  unlockTimer?: NodeJS.Timeout;

  isLock = () => {
    return this.locked;
  };

  lock = (ms = 0) => {
    this.locked = true;
    if (ms && !this.unlockTimer) {
      this.unlockTimer = this.unlockFuture(ms);
    }
  };

  isLockOrLock = (ms = 0) => {
    if (this.isLock()) return true;
    this.lock(ms);
    return false;
  };

  private unlockFuture = (ms: number) => {
    return setTimeout(() => {
      this.locked = false;
      this.unlockTimer = undefined;
    }, ms);
  };
}
