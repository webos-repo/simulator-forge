import { branch } from '../../../package.json';

const isDevBuild = process.env.NODE_ENV === 'development';
const isProdBuild = process.env.NODE_ENV === 'production';
const isDev = isDevBuild || branch === 'develop';

export { isDev, isDevBuild, isProdBuild };
