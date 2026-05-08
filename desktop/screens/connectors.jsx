// screens/connectors.jsx — connectors hub: list + detail panel

const CONNECTORS = [
  { id: 'gmail', name: 'gmail', src: 'assets/connectors/gmail.svg', state: 'on', count: 14820, last: '2m ago', account: 'theo@ghostbrain.app',
    scopes: ['read messages', 'read labels', 'read attachments'], pulls: ['threads', 'attachments', 'contacts'], throughput: '~340 msgs/day', color: '#EA4335' },
  { id: 'slack', name: 'slack', src: 'assets/connectors/slack.svg', state: 'on', count: 9412, last: '1m ago', account: 'ghostbrain-team',
    scopes: ['channels:history', 'users:read', 'files:read'], pulls: ['public channels', 'mentions', 'threads'], throughput: '~1.2k msgs/day', color: '#4A154B' },
  { id: 'notion', name: 'notion', src: 'assets/connectors/notion.svg', state: 'on', count: 1108, last: '5m ago', account: 'product workspace',
    scopes: ['read content'], pulls: ['pages', 'databases', 'comments'], throughput: '~24 docs/day', color: '#000' },
  { id: 'linear', name: 'linear', src: 'assets/connectors/linear.svg', state: 'on', count: 824, last: '4m ago', account: 'ghostbrain',
    scopes: ['read issues'], pulls: ['issues', 'comments', 'cycles'], throughput: '~18 issues/day', color: '#5E6AD2' },
  { id: 'calendar', name: 'calendar', src: 'assets/connectors/calendar.svg', state: 'on', count: 412, last: '12m ago', account: 'theo@ghostbrain.app',
    scopes: ['read events'], pulls: ['events', 'attendees', 'descriptions'], throughput: '~8 events/day', color: '#4285F4' },
  { id: 'github', name: 'github', src: 'assets/connectors/github.svg', state: 'err', count: 0, last: 'token expired 2d ago', account: 'theo-haunts',
    scopes: ['repo:read'], pulls: ['issues', 'PRs', 'commits'], throughput: 'paused', color: '#181717' },
  { id: 'drive', name: 'drive', src: 'assets/connectors/drive.svg', state: 'off', count: 0, last: 'never', account: '—',
    scopes: ['drive.metadata.readonly', 'drive.readonly'], pulls: ['docs', 'sheets', 'slides'], throughput: '—', color: '#1FA463' },
];

const ConnectorsScreen = () => {
  const [selectedId, setSelectedId] = React.useState('gmail');
  const [filter, setFilter] = React.useState('all');
  const filtered = CONNECTORS.filter(c => filter === 'all' || c.state === filter);
  const selected = CONNECTORS.find(c => c.id === selectedId);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-paper)' }}>
      <TopBar
        title="connectors"
        subtitle="6 of 7 · syncing live"
        right={<div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={<Lucide name="refresh-cw" size={13} />}>sync all</Btn>
          <Btn variant="primary" size="sm" icon={<Lucide name="plus" size={13} color="#0E0F12" />}>add connector</Btn>
        </div>}
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', overflow: 'hidden' }}>
        {/* List */}
        <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
          {/* filter chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
            <Eyebrow style={{ marginRight: 4 }}>filter</Eyebrow>
            {['all', 'on', 'err', 'off'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '4px 10px', borderRadius: 4,
                background: filter === f ? 'rgba(197,255,61,0.16)' : 'transparent',
                color: filter === f ? 'var(--neon)' : 'var(--ink-1)',
                border: `1px solid ${filter === f ? 'rgba(197,255,61,0.30)' : 'var(--hairline-2)'}`,
                cursor: 'pointer',
              }}>{f === 'on' ? 'connected' : f === 'err' ? 'error' : f === 'off' ? 'disconnected' : 'all'}</button>
            ))}
          </div>

          {/* table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 100px 120px 120px 90px',
            gap: 12, padding: '0 14px 8px',
            borderBottom: '1px solid var(--hairline)',
          }}>
            <div></div>
            <Eyebrow>app</Eyebrow>
            <Eyebrow style={{ textAlign: 'right' }}>indexed</Eyebrow>
            <Eyebrow>last sync</Eyebrow>
            <Eyebrow>throughput</Eyebrow>
            <Eyebrow style={{ textAlign: 'right' }}>status</Eyebrow>
          </div>

          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map(c => (
              <ConnectorRow key={c.id} c={c} selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} />
            ))}
            <AddConnectorRow />
          </div>
        </div>

        {/* Detail panel */}
        {selected && <ConnectorDetail c={selected} />}
      </div>
    </div>
  );
};

const ConnectorRow = ({ c, selected, onClick }) => {
  const [hover, setHover] = React.useState(false);
  const tones = { on: 'neon', err: 'oxblood', off: 'outline' };
  const labels = { on: 'connected', err: 'error', off: 'off' };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '32px 1fr 100px 120px 120px 90px',
        gap: 12, alignItems: 'center',
        padding: '12px 14px', borderRadius: 6, cursor: 'pointer',
        background: selected ? 'var(--bg-vellum)' : (hover ? 'var(--bg-vellum)' : 'transparent'),
        border: `1px solid ${selected ? 'var(--hairline-2)' : 'transparent'}`,
        opacity: c.state === 'off' ? 0.65 : 1,
      }}
    >
      <img src={c.src} alt="" style={{ width: 22, height: 22, filter: c.state === 'off' ? 'grayscale(1)' : 'none' }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-0)', fontWeight: 500 }}>{c.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{c.account}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-1)', textAlign: 'right' }}>
        {c.state === 'off' ? '—' : c.count.toLocaleString()}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: c.state === 'err' ? 'var(--oxblood)' : 'var(--ink-2)' }}>
        {c.last}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>{c.throughput}</span>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Pill tone={tones[c.state]}>{labels[c.state]}</Pill>
      </div>
    </div>
  );
};

const AddConnectorRow = () => (
  <div style={{
    marginTop: 8,
    padding: '14px', borderRadius: 6,
    border: '1px dashed var(--hairline-2)',
    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    color: 'var(--ink-2)', fontSize: 13,
  }}>
    <Lucide name="plus" size={14} />
    <span>request a connector — figma, intercom, hubspot, anywhere else</span>
  </div>
);

const ConnectorDetail = ({ c }) => {
  return (
    <aside style={{
      borderLeft: '1px solid var(--hairline)',
      background: 'var(--bg-vellum)',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* hero */}
      <div className="gb-noise" style={{ padding: 24, borderBottom: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          background: `radial-gradient(circle, ${c.color}22 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}></div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--bg-paper)',
            border: '1px solid var(--hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={c.src} alt="" style={{ width: 32, height: 32 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.025em' }}>{c.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', marginTop: 2 }}>{c.account}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {c.state === 'off' && <Btn variant="primary" size="sm" icon={<Lucide name="link" size={13} color="#0E0F12" />}>connect {c.name}</Btn>}
          {c.state === 'err' && <Btn variant="primary" size="sm" icon={<Lucide name="refresh-cw" size={13} color="#0E0F12" />}>reauthorize</Btn>}
          {c.state === 'on' && <>
            <Btn variant="secondary" size="sm" icon={<Lucide name="refresh-cw" size={13} />}>sync now</Btn>
            <Btn variant="ghost" size="sm" icon={<Lucide name="pause" size={13} />}>pause</Btn>
          </>}
        </div>
      </div>

      {/* details */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {c.state === 'err' && (
          <div style={{
            background: 'rgba(255,107,90,0.08)',
            border: '1px solid rgba(255,107,90,0.25)',
            borderRadius: 6, padding: 12,
            display: 'flex', gap: 10,
          }}>
            <Lucide name="alert-triangle" size={14} color="var(--oxblood)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--oxblood)', fontWeight: 500 }}>oauth token expired</div>
              <div style={{ fontSize: 11, color: 'var(--ink-1)', marginTop: 2, lineHeight: 1.4 }}>github stopped accepting our token 2 days ago. one click and it's quiet again.</div>
            </div>
          </div>
        )}

        <DetailBlock label="indexed">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Stat label="items" value={c.state === 'off' ? '—' : c.count.toLocaleString()} delta={c.throughput} />
            <Stat label="last sync" value={c.last} delta="auto · every 5m" />
          </div>
        </DetailBlock>

        <DetailBlock label="what ghostbrain pulls">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.pulls.map(p => <Pill key={p} tone="fog">{p}</Pill>)}
          </div>
        </DetailBlock>

        <DetailBlock label="oauth scopes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.scopes.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-1)' }}>
                <Lucide name="check" size={12} color="var(--neon)" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </DetailBlock>

        <DetailBlock label="vault destination">
          <div style={{
            background: 'var(--bg-paper)',
            border: '1px solid var(--hairline)',
            borderRadius: 6, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Lucide name="folder" size={13} color="var(--ink-2)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-0)', flex: 1 }}>~/brain/sources/{c.name}</span>
            <Lucide name="external-link" size={11} color="var(--ink-3)" />
          </div>
        </DetailBlock>

        <DetailBlock label="filters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Toggle label="ignore promotional & social" on />
            <Toggle label="skip messages older than 90 days" on={false} />
            <Toggle label="extract action items" on />
          </div>
        </DetailBlock>

        {c.state !== 'off' && (
          <Btn variant="danger" size="sm" icon={<Lucide name="unplug" size={13} />} style={{ alignSelf: 'flex-start', marginTop: 8 }}>disconnect</Btn>
        )}
      </div>
    </aside>
  );
};

const DetailBlock = ({ label, children }) => (
  <div>
    <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
    {children}
  </div>
);

const Toggle = ({ label, on: initial }) => {
  const [on, setOn] = React.useState(initial);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-1)', cursor: 'pointer' }}>
      <button onClick={() => setOn(!on)} style={{
        width: 28, height: 16, borderRadius: 999,
        background: on ? 'var(--neon)' : 'var(--bg-fog)',
        border: '1px solid var(--hairline-2)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 120ms',
      }}>
        <span style={{
          position: 'absolute', top: 1, left: on ? 13 : 1,
          width: 12, height: 12, borderRadius: '50%',
          background: on ? '#0E0F12' : 'var(--ink-2)',
          transition: 'left 160ms cubic-bezier(.2,.8,.2,1)',
        }}></span>
      </button>
      <span>{label}</span>
    </label>
  );
};

Object.assign(window, { ConnectorsScreen, Toggle });
