import { contextBridge, ipcRenderer } from 'electron';
import type { GbBridge, Settings } from './types';

const bridge: GbBridge = {
  settings: {
    getAll: () => ipcRenderer.invoke('gb:settings:getAll'),
    set: (key, value) => ipcRenderer.invoke('gb:settings:set', key, value),
  },
  dialogs: {
    pickVaultFolder: () => ipcRenderer.invoke('gb:dialogs:pickVaultFolder'),
  },
  shell: {
    openPath: (path: string) => ipcRenderer.invoke('gb:shell:openPath', path),
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld('gb', bridge);

// Re-export so Settings stays referenced (required by tsc for noUnusedLocals).
export type { Settings };
