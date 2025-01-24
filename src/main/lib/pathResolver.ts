import { isDevBuild } from '@share/constant/env';
import path from 'path';

function resolveHtmlPath(htmlFileName: string, hash?: string) {
  return isDevBuild
    ? makeDevURL(htmlFileName, hash)
    : makeProdURL(htmlFileName, hash);
}

function makeDevURL(htmlFileName: string, hash?: string) {
  const devURL = new URL(
    `http://localhost:${process.env.PORT || 1212}/${htmlFileName}`
  );
  devURL.hash = hash ? `/${hash}` : '';
  return devURL.toString();
}

function makeProdURL(htmlFileName: string, hash?: string) {
  const prodURL = new URL(
    path.join('file://', __dirname, '../renderer/', htmlFileName)
  );
  prodURL.hash = hash ? `/${hash}` : '';
  return prodURL.toString();
}

function splitServiceURL(serviceURL: string) {
  const serviceName = serviceURL.slice(
    serviceURL.indexOf('com'),
    serviceURL.indexOf('/', 7)
  );
  let [categoryName, methodName] = serviceURL
    .slice(serviceURL.indexOf('/', 7) + 1)
    .split('/');
  if (!categoryName && !methodName) {
    [categoryName, methodName] = ['', ''];
  } else if (!methodName) {
    [categoryName, methodName] = ['', categoryName];
  }

  return { serviceName, categoryName, methodName };
}

function extractIdFromToken(token: string) {
  return token.slice(0, token.lastIndexOf('.'));
}

export { resolveHtmlPath, splitServiceURL, extractIdFromToken };
