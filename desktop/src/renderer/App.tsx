import { useEffect } from 'react';
import { useSettings } from './stores/settings';

export default function App() {
  const { theme, density, ready, hydrate } = useSettings();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    document.body.dataset.theme = theme;
    document.body.dataset.density = density;
  }, [theme, density, ready]);

  if (!ready) {
    return <div className="bg-paper text-ink-2 grid h-full place-items-center">…</div>;
  }
  return (
    <div className="bg-paper text-ink-0 h-full p-6 font-body">
      <h1 className="font-display text-4xl tracking-tight">ghostbrain</h1>
      <p className="text-ink-2 font-mono text-xs uppercase tracking-widest">stores online</p>
    </div>
  );
}
