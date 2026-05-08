import { useToasts } from '../stores/toast';

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: 'var(--bg-vellum)',
            border: '1px solid var(--hairline-2)',
            borderRadius: 8,
            padding: '10px 14px',
            color: 'var(--ink-0)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
