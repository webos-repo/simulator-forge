import path from 'path';
import caller from 'caller';

const print = {
  info: (...args: any[]) => {
    const fileName = getFileName(caller());
    console.log(`[${fileName}]->`, ...args);
  },
  error: (...args: any[]) => {
    const fileName = getFileName(caller());
    console.error(`[${fileName}]->`, ...args);
  },
};

function getFileName(filePath?: string) {
  if (!filePath) return null;
  return filePath.slice(filePath.lastIndexOf(path.sep) + 1);
}

export { print };
