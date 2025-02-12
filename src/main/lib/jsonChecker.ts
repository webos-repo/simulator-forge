export const isJsonStrValid = (jsonStr: string) => {
  try {
    JSON.parse(jsonStr);
  } catch {
    return false;
  }
  return true;
};
