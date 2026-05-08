import Store from 'electron-store';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Settings } from '../preload/types';

const defaults: Settings = {
  theme: 'dark',
  density: 'comfortable',
  vaultPath: join(homedir(), 'ghostbrain', 'vault'),
};

const store = new Store<Settings>({ name: 'config', defaults });

export function getAll(): Settings {
  return {
    theme: store.get('theme'),
    density: store.get('density'),
    vaultPath: store.get('vaultPath'),
  };
}

export function setKey<K extends keyof Settings>(key: K, value: Settings[K]): void {
  store.set(key, value);
}
