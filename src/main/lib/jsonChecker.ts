export const isJsonStrValid = (jsonStr: string) => {
  try {
    JSON.parse(jsonStr);
  } catch (e) {
    return false;
  }
  return true;
};
