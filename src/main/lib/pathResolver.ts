import path from "path";

export function splitServiceURL(serviceURL: string) {
  const serviceName = serviceURL.slice(
    serviceURL.indexOf("com"),
    serviceURL.indexOf("/", 7),
  );
  let [categoryName, methodName] = serviceURL
    .slice(serviceURL.indexOf("/", 7) + 1)
    .split("/");
  if (!categoryName && !methodName) {
    [categoryName, methodName] = ["", ""];
  } else if (!methodName) {
    [categoryName, methodName] = ["", categoryName];
  }

  return { serviceName, categoryName, methodName };
}

export function extractIdFromToken(token: string) {
  return token.slice(0, token.lastIndexOf("."));
}

export function getPreloadPath(isAppView = false) {
  return isAppView
    ? path.join(__dirname, "preloadApp.js")
    : path.join(__dirname, "preloadSimul.js");
}
