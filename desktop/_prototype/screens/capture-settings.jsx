// screens/capture-settings.jsx — capture inbox + settings

// ── Capture Inbox ─────────────────────────────────────────────────────────
const CAPTURE_ITEMS = [
  { id: 1, source: 'gmail',   title: 're: design crit moved',     snippet: 'works for me — moving the 11am to thursday next week. can you ping mira if she\'s in?', from: 'theo · 8:14am', tags: ['followup'], unread: true },
  { id: 2, source: 'slack',   title: '#product-feedback',         snippet: 'users keep asking for keyboard shortcuts on the meetings view. ranked it as p1.', from: 'mira · 8:01am', tags: ['feedback', 'p1'], unread: true },
  { id: 3, source: 'linear',  title: 'GHO-241 closed',            snippet: 'recording auto-pause when system sleeps. shipped in 1.4.2. nice work everyone.', from: 'jules · 7:48am', tags: ['shipped'] },
  { id: 4, source: 'notion',  title: 'Q2 roadmap · edited',       snippet: 'theo updated the connector roadmap. drive moved up, hubspot moved down.', from: 'theo · 7:32am', tags: ['roadmap'] },
  { id: 5, source: 'calendar',title: 'design crit moved',         snippet: 'time changed: thursday 11:00 → 11:30. 30 min. attendees notified.', from: 'cal · 7:15am', tags: [] },
  { id: 6, source: 'gmail',   title: 'invoice from lattice',      snippet: 'payment received. attached pdf. nothing for you to do.', from: 'billing · yesterday', tags: ['archived'] },
  { id: 7, source: 'slack',   title: '@you in #design',           snippet: 'sam: "love the new ghost float — felt like a real ghost for half a second"', from: 'sam · yesterday', tags: ['mention'] },
  { id: 8, source: 'github',  title: 'PR #482 merged',            snippet: 'feat: live transcript diarization. +482 / -91. tests green.', from: 'jules · 2d', tags: ['shipped'] },
];

const CaptureScreen = () => {
  const [selected, setSelected] = React.useState(1);
  const [filter, setFilter] = React.useState('all');
  const item = CAPTURE_ITEMS.find(c => c.id === selected);
  const filtered = CAPTURE_ITEMS.filter(c => filter === 'all' || c.source === filter);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-paper)' }}>
      <TopBar
        title="capture"
        subtitle={`${CAPTURE_ITEMS.filter(c => c.unread).length} unread · ${CAPTURE_ITEMS.length} today`}
        right={<div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" icon={<Lucide name="check-check" size={13} />}>mark all read</Btn>
          <Btn variant="secondary" size="sm" icon={<Lucide name="filter" size={13} />}>filters</Btn>
        </div>}
      />

      {/* source filter strip */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => setFilter('all')} style={chipStyle(filter === 'all')}>all</button>
        {['gmail', 'slack', 'notion', 'linear', 'calendar', 'github'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={chipStyle(filter === s)}>
            <img src={`assets/connectors/${s}.svg`} alt="" style={{ width: 11, height: 11, marginRight: 4, verticalAlign: -1 }} />
            {s}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 480px', overflow: 'hidden' }}>
        {/* List */}
        <div style={{ overflowY: 'auto', padding: '12px 8px' }}>
          {filtered.map(c => (
            <CaptureRow key={c.id} c={c} selected={selected === c.id} onClick={() => setSelected(c.id)} />
          ))}
        </div>

        {/* Detail */}
        {item && <CaptureDetail c={item} />}
      </div>
    </div>
  );
};

const chipStyle = (active) => ({
  fontFamily: 'var(--font-mono)', fontSize: 11,
  padding: '4px 10px', borderRadius: 4,
  background: active ? 'rgba(197,255,61,0.16)' : 'transparent',
  color: active ? 'var(--neon)' : 'var(--ink-1)',
  border: `1px solid ${active ? 'rgba(197,255,61,0.30)' : 'var(--hairline-2)'}`,
  cursor: 'pointer',
});

const CaptureRow = ({ c, selected, onClick }) => (
  <div onClick={onClick} style={{
    display: 'grid', gridTemplateColumns: '20px 14px 1fr auto', gap: 10, alignItems: 'center',
    padding: '10px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
    background: selected ? 'var(--bg-vellum)' : 'transparent',
    borderLeft: selected ? '2px solid var(--neon)' : '2px solid transparent',
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.unread ? 'var(--neon)' : 'transparent', justifySelf: 'center' }}></span>
    <img src={`assets/connectors/${c.source}.svg`} alt="" style={{ width: 13, height: 13 }} />
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-0)', fontWeight: c.unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{c.from}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{c.snippet}</div>
    </div>
    <div style={{ display: 'flex', gap: 4 }}>
      {c.tags.slice(0, 1).map(t => <Pill key={t} tone="outline">{t}</Pill>)}
    </div>
  </div>
);

const CaptureDetail = ({ c }) => (
  <aside style={{ borderLeft: '1px solid var(--hairline)', background: 'var(--bg-vellum)', overflowY: 'auto', padding: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <img src={`assets/connectors/${c.source}.svg`} alt="" style={{ width: 18, height: 18 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>{c.source} · {c.from}</span>
      <div style={{ flex: 1 }}></div>
      <Btn variant="ghost" size="sm" icon={<Lucide name="external-link" size={12} />}></Btn>
      <Btn variant="ghost" size="sm" icon={<Lucide name="archive" size={12} />}></Btn>
    </div>
    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.025em', lineHeight: 1.15 }}>{c.title}</h3>
    <p style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-0)', lineHeight: 1.55 }}>"{c.snippet}"</p>

    <div style={{ marginTop: 24 }}>
      <Eyebrow style={{ marginBottom: 10 }}>ghostbrain extracted</Eyebrow>
      <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--hairline)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Catch icon="check-square" text="action: ping mira about thursday" />
        <Catch icon="link" text="ref: design crit · onboarding v3" />
        <Catch icon="user" text="people: theo, mira" />
      </div>
    </div>

    <div style={{ marginTop: 20 }}>
      <Eyebrow style={{ marginBottom: 10 }}>destination</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-paper)', border: '1px solid var(--hairline)', borderRadius: 6 }}>
        <Lucide name="folder" size={13} color="var(--ink-2)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-0)', flex: 1 }}>~/brain/Daily/2026-05-08.md</span>
      </div>
    </div>

    <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
      <Btn variant="primary" size="sm" icon={<Lucide name="file-down" size={13} color="#0E0F12" />}>save to vault</Btn>
      <Btn variant="ghost" size="sm" icon={<Lucide name="bell-off" size={13} />}>mute thread</Btn>
    </div>
  </aside>
);

// ── Settings ──────────────────────────────────────────────────────────────
const SettingsScreen = ({ tweaks, setTweak }) => {
  const [section, setSection] = React.useState('vault');
  const sections = [
    { id: 'vault',   label: 'vault',    icon: 'hard-drive' },
    { id: 'privacy', label: 'privacy',  icon: 'shield' },
    { id: 'meeting', label: 'meetings', icon: 'mic' },
    { id: 'hotkeys', label: 'hotkeys',  icon: 'command' },
    { id: 'account', label: 'account',  icon: 'user' },
    { id: 'about',   label: 'about',    icon: 'info' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-paper)' }}>
      <TopBar title="settings" subtitle="ghostbrain v 1.4.2" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
        <nav style={{ borderRight: '1px solid var(--hairline)', padding: '16px 8px', overflowY: 'auto' }}>
          {sections.map(s => (
            <div key={s.id} onClick={() => setSection(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
              background: section === s.id ? 'var(--bg-vellum)' : 'transparent',
              fontSize: 13, color: section === s.id ? 'var(--ink-0)' : 'var(--ink-1)',
              fontWeight: section === s.id ? 500 : 400, marginBottom: 2,
            }}>
              <Lucide name={s.icon} size={14} color={section === s.id ? 'var(--neon)' : 'var(--ink-2)'} />
              {s.label}
            </div>
          ))}
        </nav>
        <div style={{ overflowY: 'auto', padding: '24px 32px', maxWidth: 720 }}>
          {section === 'vault' && <VaultSettings />}
          {section === 'privacy' && <PrivacySettings />}
          {section === 'meeting' && <MeetingSettings />}
          {section === 'hotkeys' && <HotkeySettings />}
          {section === 'account' && <AccountSettings />}
          {section === 'about' && <AboutSettings />}
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, sub, control }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: 'var(--ink-0)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
    </div>
    <div>{control}</div>
  </div>
);

const SectionHeader = ({ title, sub }) => (
  <header style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.025em' }}>{title}</h2>
    {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>{sub}</p>}
  </header>
);

const VaultSettings = () => (
  <div>
    <SectionHeader title="vault" sub="where ghostbrain writes everything it catches." />
    <SettingRow label="vault path" sub="~/Obsidian/brain · 2,489 notes · 142 mb" control={<Btn variant="secondary" size="sm" icon={<Lucide name="folder-open" size={13} />}>change</Btn>} />
    <SettingRow label="folder structure" sub="how ghostbrain organizes captured items" control={<select style={selectStyle}><option>by source</option><option>by date</option><option>by person</option></select>} />
    <SettingRow label="daily note" sub="capture digest appended to today's daily note" control={<Toggle label="" on />} />
    <SettingRow label="markdown frontmatter" sub="add yaml metadata to every captured file" control={<Toggle label="" on />} />
    <SettingRow label="auto-link mentions" sub='turn @names and #tags into [[wikilinks]]' control={<Toggle label="" on />} />
  </div>
);

const PrivacySettings = () => (
  <div>
    <SectionHeader title="privacy" sub="ghostbrain is local-first. nothing leaves your machine unless you flip a switch." />
    <SettingRow label="cloud sync" sub="opt-in. encrypted at rest. you hold the key." control={<Toggle label="" on={false} />} />
    <SettingRow label="end-to-end encryption" sub="vault encrypted on disk with your passphrase" control={<Toggle label="" on />} />
    <SettingRow label="telemetry" sub="anonymous crash reports. no message contents, ever." control={<Toggle label="" on={false} />} />
    <SettingRow label="LLM provider" sub="for transcript summarization & query" control={<select style={selectStyle}><option>local (ollama)</option><option>anthropic</option><option>openai</option></select>} />
  </div>
);

const MeetingSettings = () => (
  <div>
    <SectionHeader title="meetings" sub="how ghostbrain records, transcribes, and summarizes." />
    <SettingRow label="auto-record from calendar" sub="meetings tagged ⏺ in your calendar are auto-recorded" control={<Toggle label="" on />} />
    <SettingRow label="diarize speakers" sub="separate who-said-what in the transcript" control={<Toggle label="" on />} />
    <SettingRow label="extract action items" sub="ghostbrain pulls todos automatically" control={<Toggle label="" on />} />
    <SettingRow label="audio retention" sub="how long to keep raw audio after transcription" control={<select style={selectStyle}><option>30 days</option><option>7 days</option><option>delete immediately</option><option>keep forever</option></select>} />
    <SettingRow label="transcript model" sub="whisper · runs locally" control={<select style={selectStyle}><option>whisper-large-v3</option><option>whisper-medium</option></select>} />
  </div>
);

const HotkeySettings = () => (
  <div>
    <SectionHeader title="hotkeys" sub="global shortcuts — work even when ghostbrain isn't focused." />
    {[
      ['ask the archive', '⌘ ⇧ K'],
      ['quick capture', '⌘ ⇧ C'],
      ['start recording', '⌘ ⇧ R'],
      ['stop recording', '⌘ ⇧ S'],
      ['open vault', '⌘ ⇧ V'],
      ['toggle ghostbrain window', '⌘ ⇧ G'],
    ].map(([label, key]) => (
      <SettingRow key={label} label={label} control={
        <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'var(--bg-vellum)', border: '1px solid var(--hairline-2)', color: 'var(--ink-0)' }}>{key}</kbd>
      } />
    ))}
  </div>
);

const AccountSettings = () => (
  <div>
    <SectionHeader title="account" sub="theo · ghostbrain pro" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--bg-vellum)', border: '1px solid var(--hairline)', borderRadius: 10, marginBottom: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--neon)', color: '#0E0F12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>T</div>
      <div style={{ flex: 1, lineHeight: 1.3 }}>
        <div style={{ fontSize: 14, color: 'var(--ink-0)', fontWeight: 500 }}>theo</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>theo@ghostbrain.app</div>
      </div>
      <Pill tone="neon">pro</Pill>
    </div>
    <SettingRow label="plan" sub="pro · $8/month · renews jun 1" control={<Btn variant="secondary" size="sm">manage</Btn>} />
    <SettingRow label="connected devices" sub="this mac · iphone (last seen 2h ago)" control={<Btn variant="ghost" size="sm">view all</Btn>} />
    <SettingRow label="sign out" control={<Btn variant="danger" size="sm">sign out</Btn>} />
  </div>
);

const AboutSettings = () => (
  <div>
    <SectionHeader title="about" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 24, background: 'var(--bg-vellum)', border: '1px solid var(--hairline)', borderRadius: 12 }}>
      <Ghost size={56} floating />
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>ghostbrain</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>1.4.2 · build 2026-05-07 · macos</div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-1)', marginTop: 8 }}>"a friendly poltergeist on your shoulder."</div>
      </div>
    </div>
  </div>
);

const selectStyle = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  padding: '6px 10px', borderRadius: 4,
  background: 'var(--bg-vellum)', color: 'var(--ink-0)',
  border: '1px solid var(--hairline-2)',
  cursor: 'pointer',
};

Object.assign(window, { CaptureScreen, SettingsScreen });
