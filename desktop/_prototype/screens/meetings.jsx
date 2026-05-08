// screens/meetings.jsx — pre / recording / post / history

const PARTICIPANTS = [
  { name: 'mira', role: 'design lead', color: '#C5FF3D' },
  { name: 'jules', role: 'eng', color: '#FF6B5A' },
  { name: 'sam', role: 'pm', color: '#7FB3D5' },
  { name: 'you', role: 'host', color: '#A2C795' },
];

const MeetingsScreen = ({ recordingState, setRecordingState }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-paper)' }}>
      <TopBar
        title="meetings"
        subtitle={recordingState === 'recording' ? '· recording in progress' : '47 in vault · 2 today'}
        right={<div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" icon={<Lucide name="settings-2" size={13} />}>audio</Btn>
          <Btn variant="secondary" size="sm" icon={<Lucide name="upload" size={13} />}>import recording</Btn>
        </div>}
      />

      {recordingState === 'pre' && <PreMeeting onStart={() => setRecordingState('recording')} />}
      {recordingState === 'recording' && <ActiveRecording onStop={() => setRecordingState('post')} />}
      {recordingState === 'post' && <PostMeeting onClose={() => setRecordingState('pre')} />}

      {/* History always visible at bottom */}
      <MeetingHistory />
    </div>
  );
};

// ── Pre-meeting (lobby) ────────────────────────────────────────────────────
const PreMeeting = ({ onStart }) => {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100 }}>
      <div className="gb-noise" style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--bg-vellum)',
        border: '1px solid var(--hairline)',
        borderRadius: 12, padding: 32,
        display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 32,
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(197,255,61,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}></div>

        <div style={{ position: 'relative' }}>
          <Pill tone="neon" style={{ marginBottom: 14 }}>
            <Lucide name="clock" size={9} /> starts in 23m
          </Pill>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            design crit · onboarding v3
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
            <span><Lucide name="calendar" size={11} style={{ marginRight: 5, verticalAlign: -2 }} /> today · 11:00 — 11:30</span>
            <span><Lucide name="map-pin" size={11} style={{ marginRight: 5, verticalAlign: -2 }} /> google meet</span>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-paper)', borderRadius: 8, border: '1px solid var(--hairline)' }}>
            <Eyebrow style={{ marginBottom: 8 }}>ghostbrain primed</Eyebrow>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'pulled 14 messages from #design-crit since last session',
                'linked GHO-241, GHO-247 from linear',
                '2 onboarding mocks in notion, last edited 2h ago',
                'transcript will land in ~/brain/Meetings/2026-05-08-design-crit.md',
              ].map((line, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--ink-1)' }}>
                  <Lucide name="check" size={11} color="var(--neon)" style={{ marginTop: 4 }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Btn variant="record" size="lg" icon={<span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E0F12' }}></span>} onClick={onStart}>
              start recording
            </Btn>
            <Btn variant="secondary" size="lg" icon={<Lucide name="external-link" size={14} />}>open meet</Btn>
            <Btn variant="ghost" size="lg">configure…</Btn>
          </div>
        </div>

        {/* Right: participants + audio preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <Eyebrow>participants · 4</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PARTICIPANTS.map(p => <ParticipantRow key={p.name} {...p} />)}
          </div>

          <div style={{ marginTop: 8 }}>
            <Eyebrow style={{ marginBottom: 8 }}>audio source</Eyebrow>
            <AudioSource icon="mic" label="MacBook Pro Microphone" sub="default · 48 kHz" active />
            <AudioSource icon="volume-2" label="System audio (loopback)" sub="capture both sides of meet" active />
            <AudioSource icon="bluetooth" label="AirPods Pro" sub="not connected" />
          </div>

          <div style={{ marginTop: 8 }}>
            <Eyebrow style={{ marginBottom: 8 }}>level</Eyebrow>
            <Waveform />
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantRow = ({ name, role, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 4 }}>
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: color, color: '#0E0F12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 600,
    }}>{name[0]}</div>
    <span style={{ fontSize: 12, color: 'var(--ink-0)', flex: 1 }}>{name}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{role}</span>
  </div>
);

const AudioSource = ({ icon, label, sub, active }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 6, marginBottom: 4,
    background: active ? 'rgba(197,255,61,0.08)' : 'transparent',
    border: `1px solid ${active ? 'rgba(197,255,61,0.20)' : 'var(--hairline)'}`,
    cursor: 'pointer',
    opacity: active ? 1 : 0.55,
  }}>
    <Lucide name={icon} size={13} color={active ? 'var(--neon)' : 'var(--ink-2)'} />
    <div style={{ flex: 1, lineHeight: 1.2 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-0)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)' }}>{sub}</div>
    </div>
    {active && <Lucide name="check" size={12} color="var(--neon)" />}
  </div>
);

const Waveform = ({ live = false }) => {
  const bars = 48;
  const heights = React.useMemo(() => Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8), []);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, height: 36,
      padding: '0 12px',
      background: 'var(--bg-paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 6,
    }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h * 100}%`,
          background: live ? 'var(--neon)' : 'var(--ink-3)',
          opacity: live ? (0.5 + h * 0.5) : (0.4 + h * 0.4),
          borderRadius: 1,
          animation: live ? `gb-wave 1.${i % 9}s ease-in-out infinite alternate` : 'none',
        }}></div>
      ))}
    </div>
  );
};

// ── Active recording ───────────────────────────────────────────────────────
const ActiveRecording = ({ onStop }) => {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const transcript = [
    { who: 'mira',  color: '#C5FF3D', t: '00:12', text: "okay so the onboarding flow — i think the third screen is doing too much.", live: false },
    { who: 'jules', color: '#FF6B5A', t: '00:24', text: "agreed. we should split the connector picker out from the vault setup.", live: false },
    { who: 'sam',   color: '#7FB3D5', t: '00:38', text: "what if connectors are deferred entirely? you can install ghostbrain and do it later.", live: false },
    { who: 'you',   color: '#A2C795', t: '00:54', text: "i'd want at least one connected before the welcome state — otherwise the dashboard is empty.", live: false },
    { who: 'mira',  color: '#C5FF3D', t: '01:08', text: "right. minimum one. let's call that out as a soft requirement.", live: true },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100 }}>
      {/* live banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(255,107,90,0.18) 0%, rgba(255,107,90,0.04) 100%)',
        border: '1px solid rgba(255,107,90,0.30)',
        borderRadius: 12,
        padding: 20,
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 12, height: 12, borderRadius: '50%', background: 'var(--oxblood)',
            boxShadow: '0 0 0 0 rgba(255,107,90,0.6)',
            animation: 'gb-pulse 1.4s ease-out infinite',
          }}></span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--oxblood)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>recording · live</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>design crit · onboarding v3</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 280 }}><Waveform live /></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color: 'var(--ink-0)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
          <Btn variant="ghost" size="sm" icon={<Lucide name="pause" size={14} />}>pause</Btn>
          <Btn variant="record" size="md" icon={<span style={{ width: 9, height: 9, background: '#0E0F12' }}></span>} onClick={onStop}>stop</Btn>
        </div>
      </div>

      {/* live transcript + side rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <Panel
          title="live transcript"
          subtitle="diarized · 4 speakers"
          action={<div style={{ display: 'flex', gap: 6 }}>
            <Pill tone="moss"><Lucide name="check" size={9} /> auto-saving</Pill>
            <Btn variant="ghost" size="sm" icon={<Lucide name="bookmark" size={12} />}>mark</Btn>
          </div>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 4px', maxHeight: 360, overflowY: 'auto' }}>
            {transcript.map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, opacity: line.live ? 1 : 0.92 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: line.color, color: '#0E0F12',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600,
                  }}>{line.who[0]}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{line.t}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', marginBottom: 2, textTransform: 'lowercase' }}>{line.who}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink-0)', lineHeight: 1.55 }}>
                    {line.text}
                    {line.live && <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--neon)', verticalAlign: -2, marginLeft: 4, animation: 'gb-blink 1s steps(2) infinite' }}></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Panel title="speakers" subtitle="airtime">
            {PARTICIPANTS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.color }}></div>
                <span style={{ fontSize: 12, color: 'var(--ink-0)', flex: 1 }}>{p.name}</span>
                <div style={{ width: 90, height: 4, background: 'var(--bg-paper)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${[34, 28, 22, 16][i]}%`, height: '100%', background: p.color }}></div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', width: 32, textAlign: 'right' }}>{[34, 28, 22, 16][i]}%</span>
              </div>
            ))}
          </Panel>

          <Panel title="ghost catches" subtitle="auto-extracted · live">
            <Catch icon="check-square" text="split connector picker out from vault setup" />
            <Catch icon="alert-circle" text="minimum one connected = soft requirement" />
            <Catch icon="link" text="ref: GHO-241, GHO-247" />
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Catch = ({ icon, text }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '8px 6px', borderRadius: 4,
    fontSize: 12, color: 'var(--ink-0)', lineHeight: 1.4,
  }}>
    <Lucide name={icon} size={12} color="var(--neon)" style={{ marginTop: 3 }} />
    <span>{text}</span>
  </div>
);

// ── Post-meeting summary ──────────────────────────────────────────────────
const PostMeeting = ({ onClose }) => (
  <div style={{ padding: '24px 32px', maxWidth: 1100 }}>
    <div style={{
      background: 'var(--bg-vellum)',
      border: '1px solid var(--hairline)',
      borderRadius: 12, padding: 28,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Pill tone="moss"><Lucide name="check" size={9} /> wrapped · 28:14</Pill>
        <Pill tone="fog">just now</Pill>
        <div style={{ flex: 1 }}></div>
        <Btn variant="ghost" size="sm" icon={<Lucide name="x" size={13} />} onClick={onClose}></Btn>
      </div>

      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--ink-0)' }}>
        design crit · onboarding v3
      </h2>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>
        ~/brain/Meetings/2026-05-08-design-crit.md · 4 speakers · 312 lines
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--hairline)', borderRadius: 8, padding: 18 }}>
          <Eyebrow style={{ marginBottom: 10 }}>tl;dr</Eyebrow>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-0)', lineHeight: 1.5 }}>
            "the third onboarding screen is doing too much. split the connector picker out, but require at least one connected before showing the dashboard — otherwise the welcome state is empty."
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Btn variant="primary" size="sm" icon={<Lucide name="file-down" size={13} color="#0E0F12" />}>save to vault</Btn>
            <Btn variant="secondary" size="sm" icon={<Lucide name="share" size={13} />}>share md</Btn>
            <Btn variant="ghost" size="sm" icon={<Lucide name="play" size={13} />}>play audio</Btn>
          </div>
        </div>

        <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--hairline)', borderRadius: 8, padding: 18 }}>
          <Eyebrow style={{ marginBottom: 10 }}>action items · 3</Eyebrow>
          <Action who="jules" text="split connector picker into its own screen" />
          <Action who="mira"  text="document 'min one connected' rule" />
          <Action who="you"   text="redo welcome state mock by friday" />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <SmallStat label="words" value="3,841" />
        <SmallStat label="speakers" value="4" />
        <SmallStat label="links extracted" value="6" />
      </div>
    </div>
  </div>
);

const Action = ({ who, text }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
    <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid var(--ink-3)', flexShrink: 0, marginTop: 3 }}></div>
    <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-0)', lineHeight: 1.5 }}>
      {text} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--neon)' }}>@{who}</span>
    </div>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div style={{ background: 'var(--bg-paper)', border: '1px solid var(--hairline)', borderRadius: 6, padding: 12 }}>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.02em', marginTop: 4 }}>{value}</div>
  </div>
);

// ── History ────────────────────────────────────────────────────────────────
const HISTORY = [
  { date: 'mon · may 5',  title: 'weekly with theo',         dur: '47:22', speakers: 2, tags: ['1:1', 'roadmap'] },
  { date: 'fri · may 2',  title: 'q2 planning offsite',      dur: '2:12:08', speakers: 6, tags: ['planning'] },
  { date: 'thu · may 1',  title: 'design crit · onboarding v2', dur: '32:14', speakers: 4, tags: ['design'] },
  { date: 'tue · apr 29', title: 'jules <> mira pairing',    dur: '54:01', speakers: 2, tags: ['eng'] },
  { date: 'mon · apr 28', title: 'all hands',                dur: '1:04:33', speakers: 12, tags: ['team'] },
];

const MeetingHistory = () => (
  <div style={{ padding: '8px 32px 40px', maxWidth: 1100 }}>
    <Panel title="past meetings" subtitle="47 in vault" action={<Btn variant="ghost" size="sm" iconRight={<Lucide name="arrow-right" size={12} />}>vault</Btn>}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 80px 1fr', gap: 12, padding: '4px 8px 8px', borderBottom: '1px solid var(--hairline)' }}>
        <Eyebrow>date</Eyebrow><Eyebrow>title</Eyebrow><Eyebrow>length</Eyebrow><Eyebrow>speakers</Eyebrow><Eyebrow>tags</Eyebrow>
      </div>
      {HISTORY.map((m, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 80px 80px 1fr',
          gap: 12, alignItems: 'center',
          padding: '10px 8px', borderRadius: 4, cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-paper)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>{m.date}</span>
          <span style={{ fontSize: 13, color: 'var(--ink-0)' }}>{m.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{m.dur}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{m.speakers}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {m.tags.map(t => <Pill key={t} tone="outline">{t}</Pill>)}
          </div>
        </div>
      ))}
    </Panel>
  </div>
);

Object.assign(window, { MeetingsScreen });
