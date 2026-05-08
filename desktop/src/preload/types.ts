export type Theme = 'dark' | 'light';
export type Density = 'comfortable' | 'compact';

// Mirrors NodeJS.Platform — duplicated here so this file can be consumed by
// the renderer's tsconfig (which doesn't pull in @types/node).
export type Platform =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd';

export interface Settings {
  theme: Theme;
  density: Density;
  vaultPath: string;
}

export interface GbBridge {
  settings: {
    getAll(): Promise<Settings>;
    set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
  };
  dialogs: {
    pickVaultFolder(): Promise<string | null>;
  };
  shell: {
    openPath(path: string): Promise<string>;
  };
  platform: Platform;
}

declare global {
  interface Window {
    gb: GbBridge;
  }
}
