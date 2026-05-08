// app-shell.jsx — window chrome + left sidebar nav

const TRAFFIC = ({ small }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ width: small ? 11 : 12, height: small ? 11 : 12, borderRadius: '50%', background: '#FF5F57', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.2)' }}></div>
    <div style={{ width: small ? 11 : 12, height: small ? 11 : 12, borderRadius: '50%', background: '#FEBC2E', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.2)' }}></div>
    <div style={{ width: small ? 11 : 12, height: small ? 11 : 12, borderRadius: '50%', background: '#28C840', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.2)' }}></div>
  </div>
);

// ghost glyph (matches design system)
const Ghost = ({ size = 22, color = 'var(--neon)', floating = false }) => (
  <svg viewBox="0 0 100 110" style={{ width: size, height: size * 1.1, flexShrink: 0, animation: floating ? 'gb-float 4s cubic-bezier(.4,0,.2,1) infinite' : 'none' }} aria-hidden="true">
    <path d="M 50 6 C 24 6, 10 24, 10 50 L 10 94 Q 17 102, 24 95 Q 31 88, 38 95 Q 44 102, 50 95 Q 56 88, 62 95 Q 69 102, 76 95 Q 83 88, 90 94 L 90 50 C 90 24, 76 6, 50 6 Z" fill={color}/>
    <circle cx="38" cy="48" r="3.2" fill="var(--bg-paper)"/>
    <circle cx="62" cy="48" r="3.2" fill="var(--bg-paper)"/>
  </svg>
);

const Lucide = ({ name, size = 16, color, style }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (!ref.current || !window.lucide || !window.lucide.icons) return;
    const camel = name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
    const node = window.lucide.icons[camel];
    if (!Array.isArray(node)) return;
    const children = node.map(([tag, attrs]) =>
      `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`
    ).join('');
    ref.current.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
      `viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" ` +
      `stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  }, [name, size, color]);
  return <span ref={ref} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: color || 'currentColor', ...style }}></span>;
};

const Pill = ({ tone = 'neon', children, style }) => {
  const palettes = {
    neon:    { bg: 'rgba(197,255,61,0.15)', fg: 'var(--neon)' },
    moss:    { bg: 'rgba(92,124,79,0.18)',  fg: '#A2C795' },
    oxblood: { bg: 'rgba(255,107,90,0.14)', fg: '#FF8A7C' },
    fog:     { bg: 'var(--bg-fog)',         fg: 'var(--ink-1)' },
    outline: { bg: 'transparent',           fg: 'var(--ink-2)', border: '1px solid var(--hairline-2)' },
  };
  const p = palettes[tone];
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
      padding: '2px 7px', borderRadius: 4,
      background: p.bg, color: p.fg, border: p.border || 'none',
      display: 'inline-flex', alignItems: 'center', gap: 5,
      textTransform: 'lowercase', letterSpacing: 0,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
};

const Eyebrow = ({ children, style }) => (
  <div style={{
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.14em',
    color: 'var(--ink-2)', ...style,
  }}>{children}</div>
);

const Btn = ({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, style, disabled }) => {
  const [hover, setHover] = React.useState(false);
  const sizes = {
    sm: { padding: '6px 10px', fontSize: 12, gap: 6 },
    md: { padding: '8px 14px', fontSize: 13, gap: 7 },
    lg: { padding: '11px 18px', fontSize: 14, gap: 8 },
  };
  const variants = {
    primary: { bg: hover ? 'var(--neon-dark)' : 'var(--neon)', fg: '#0E0F12', border: 'transparent' },
    secondary: { bg: hover ? 'var(--bg-fog)' : 'var(--bg-vellum)', fg: 'var(--ink-0)', border: 'var(--hairline-2)' },
    ghost: { bg: hover ? 'var(--bg-vellum)' : 'transparent', fg: 'var(--ink-1)', border: 'transparent' },
    danger: { bg: hover ? 'rgba(255,107,90,0.20)' : 'rgba(255,107,90,0.12)', fg: 'var(--oxblood)', border: 'rgba(255,107,90,0.30)' },
    record: { bg: hover ? '#E8584C' : 'var(--oxblood)', fg: '#0E0F12', border: 'transparent' },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...sizes[size],
        background: v.bg, color: v.fg,
        border: `1px solid ${v.border}`,
        borderRadius: 6, fontWeight: 500,
        fontFamily: 'var(--font-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 120ms cubic-bezier(.2,.8,.2,1)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

// ── Window chrome ───────────────────────────────────────────────────────────
const WindowChrome = ({ children, density = 'comfortable' }) => {
  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 12, overflow: 'hidden',
      background: 'var(--bg-paper)',
      boxShadow: '0 0 0 1px var(--hairline-2), 0 24px 64px rgba(0,0,0,0.45)',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {children}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'today', icon: 'sparkles', label: 'today' },
  { id: 'connectors', icon: 'plug', label: 'connectors' },
  { id: 'meetings', icon: 'mic', label: 'meetings' },
  { id: 'capture', icon: 'inbox', label: 'capture' },
  { id: 'vault', icon: 'book-open', label: 'vault' },
  { id: 'settings', icon: 'settings', label: 'settings' },
];

const Sidebar = ({ active, setActive, density, recordingState }) => {
  const compact = density === 'compact';
  return (
    <aside style={{
      width: compact ? 200 : 220, flexShrink: 0,
      background: 'var(--bg-paper)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column',
      WebkitAppRegion: 'drag',
    }}>
      {/* titlebar — traffic lights + brand */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 14px',
        borderBottom: '1px solid var(--hairline)',
      }}>
        <TRAFFIC small />
      </div>

      {/* brand block */}
      <div style={{ padding: '14px 14px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Ghost size={20} floating />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>ghostbrain</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>v 1.4.2 · haunting</span>
        </div>
      </div>

      {/* nav */}
      <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto', WebkitAppRegion: 'no-drag' }}>
        <Eyebrow style={{ padding: '6px 10px' }}>workspace</Eyebrow>
        {NAV_ITEMS.map(item => (
          <NavRow
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => setActive(item.id)}
            badge={item.id === 'meetings' && recordingState === 'recording' ? <RecordingDot /> : item.id === 'capture' ? '12' : null}
          />
        ))}

        <Eyebrow style={{ padding: '6px 10px', marginTop: 16 }}>vault</Eyebrow>
        <VaultRow icon="folder" label="Daily" count={284} />
        <VaultRow icon="folder" label="Meetings" count={47} />
        <VaultRow icon="folder" label="People" count={91} />
        <VaultRow icon="folder" label="Projects" count={23} />
        <VaultRow icon="hash" label="#followup" count={8} />
      </nav>

      {/* footer — vault path */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', gap: 8,
        WebkitAppRegion: 'no-drag',
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 4,
          background: 'var(--bg-fog)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Lucide name="hard-drive" size={13} color="var(--ink-1)" />
        </div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-0)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>~/Obsidian/brain</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)' }}>2,489 notes · synced</div>
        </div>
      </div>
    </aside>
  );
};

const NavRow = ({ item, active, onClick, badge }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
        background: active ? 'rgba(197,255,61,0.12)' : (hover ? 'var(--bg-vellum)' : 'transparent'),
        color: active ? 'var(--ink-0)' : 'var(--ink-1)',
        fontSize: 13, fontWeight: active ? 500 : 400,
        position: 'relative',
        transition: 'background 120ms',
      }}
    >
      {active && <div style={{ position: 'absolute', left: -8, top: 6, bottom: 6, width: 2, background: 'var(--neon)', borderRadius: 2 }}></div>}
      <Lucide name={item.icon} size={15} color={active ? 'var(--neon)' : 'var(--ink-2)'} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge && (typeof badge === 'string'
        ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{badge}</span>
        : badge)}
    </div>
  );
};

const VaultRow = ({ icon, label, count }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
        background: hover ? 'var(--bg-vellum)' : 'transparent',
        fontSize: 12, color: 'var(--ink-1)',
      }}
    >
      <Lucide name={icon} size={12} color="var(--ink-3)" />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{count}</span>
    </div>
  );
};

const RecordingDot = () => (
  <span style={{
    width: 8, height: 8, borderRadius: '50%', background: 'var(--oxblood)',
    boxShadow: '0 0 0 0 rgba(255,107,90,0.6)',
    animation: 'gb-pulse 1.4s ease-out infinite',
  }}></span>
);

// ── Top bar ────────────────────────────────────────────────────────────────
const TopBar = ({ title, subtitle, right, leftExtra }) => (
  <div style={{
    height: 56, padding: '0 24px',
    borderBottom: '1px solid var(--hairline)',
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--bg-paper)',
    flexShrink: 0,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.15 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>{title}</h1>
      {subtitle && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{subtitle}</span>}
    </div>
    {leftExtra}
    <div style={{ flex: 1 }}></div>
    {right}
  </div>
);

Object.assign(window, { Ghost, Lucide, Pill, Eyebrow, Btn, WindowChrome, Sidebar, TopBar, RecordingDot, TRAFFIC });
