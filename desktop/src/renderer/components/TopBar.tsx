interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function TopBar({ title, subtitle, right }: Props) {
  return (
    <div
      style={{
        height: 56,
        padding: '0 24px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--bg-paper)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.15 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--ink-0)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--ink-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}
