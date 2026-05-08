export type Theme = 'dark' | 'light';
export type Density = 'comfortable' | 'compact';

export interface Settings {
  theme: Theme;
  density: Density;
  vaultPath: string;
}

export interface GbBridge {
  settings: {
    getAll(): Promise<Settings>;
    set<K extends keyof Settings>(
      key: K,
      value: Settings[K],
    ): Promise<{ ok: true } | { ok: false; error: string }>;
  };
  dialogs: {
    pickVaultFolder(): Promise<string | null>;
  };
  shell: {
    openPath(path: string): Promise<{ ok: true } | { ok: false; error: string }>;
  };
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    gb: GbBridge;
  }
}
