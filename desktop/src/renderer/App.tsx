import { useEffect, useState } from 'react';
import type { Settings } from '../preload/types';

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    window.gb.settings.getAll().then(setSettings);
  }, []);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', color: 'white', background: '#0E0F12' }}>
      <h1>ghostbrain — bridge online</h1>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
      <p>platform: {window.gb.platform}</p>
    </div>
  );
}
