import { create } from 'zustand';
import type { Settings } from '../../preload/types';

interface SettingsState extends Settings {
  ready: boolean;
  hydrate: () => Promise<void>;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

export const useSettings = create<SettingsState>((set) => ({
  theme: 'dark',
  density: 'comfortable',
  vaultPath: '',
  ready: false,
  hydrate: async () => {
    const all = await window.gb.settings.getAll();
    set({ ...all, ready: true });
  },
  set: async (key, value) => {
    await window.gb.settings.set(key, value);
    set({ [key]: value } as Pick<Settings, typeof key>);
  },
}));
