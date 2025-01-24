export const serviceNotFound = (service: string) => {
  return {
    returnValue: false,
    errorCode: -1,
    errorText: `Service does not exist: ${service}}.`,
  };
};
export const methodNotFound = (category: string, method: string) => {
  return {
    returnValue: false,
    errorCode: -1,
    errorText: `Unknown method "${method}" for category "/${category}"`,
  };
};

export const methodError = (
  errorCode: number | string,
  errorText: string,
  additionalArgs?: any
) => {
  return {
    returnValue: false,
    errorCode,
    errorText,
    ...additionalArgs,
  };
};
