class ConstStore {
  private store = {
    mainWindowYDiff: 28,
  };

  getMainWindowYDiff = (): number => {
    return this.store.mainWindowYDiff;
  };

  setMainWindowYDiff = (h: number) => {
    this.store.mainWindowYDiff = h;
  };
}

export const constStore = new ConstStore();
