import _ from 'lodash';

type MemoryNames = 'toast' | 'launchApp';

const Memories: { [key in MemoryNames]: any[] } = {
  launchApp: [],
  toast: [],
};

export function getMemories(name: MemoryNames) {
  return _.get(Memories, name, null);
}

export function popMemories(name: MemoryNames) {
  return Memories[name].shift();
}

export function pushMemories(name: MemoryNames, data: any) {
  getMemories(name)?.push(data);
}

export function resetMemories(name: MemoryNames) {
  Memories[name] = [];
}
