interface Props {
  children: React.ReactNode;
}

export function WindowChrome({ children }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-paper)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}
