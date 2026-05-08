// screens/today.jsx — dashboard / hero screen

const TodayScreen = ({ recordingState, setActive, density }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-paper)' }}>
      <TopBar
        title="today"
        subtitle="thursday · may 8"
        right={<div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" icon={<Lucide name="search" size={14} />}>ask…
            <kbd style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--bg-fog)', color: 'var(--ink-2)' }}>⌘K</kbd>
          </Btn>
          <Btn variant="secondary" size="sm" icon={<Lucide name="bell" size={14} />}></Btn>
        </div>}
      />

      <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100 }}>

        {/* Hero greeting + ghost activity */}
        <div className="gb-noise" style={{
          position: 'relative', overflow: 'hidden',
          background: 'var(--bg-vellum)',
          border: '1px solid var(--hairline)',
          borderRadius: 12, padding: 28,
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28,
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(197,255,61,0.10) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Eyebrow>good morning</Eyebrow>
            <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>
              while you slept,<br/>
              <span style={{ color: 'var(--neon)' }}>ghostbrain caught</span><br/>
              241 things.
            </h2>
            <p style={{ margin: '14px 0 18px', color: 'var(--ink-1)', fontSize: 14, maxWidth: '46ch', lineHeight: 1.5 }}>
              4 connectors syncing. 2 meetings on your calendar today — one is ready to record.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" size="md" icon={<Lucide name="search" size={14} color="#0E0F12" />}>ask the archive</Btn>
              <Btn variant="secondary" size="md" onClick={() => setActive('meetings')} icon={<Lucide name="mic" size={14} />}>start recording</Btn>
            </div>
          </div>

          {/* mini stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignContent: 'start', position: 'relative', zIndex: 1 }}>
            <Stat label="captured" value="241" delta="+38 vs yest" tone="neon" />
            <Stat label="meetings" value="2" delta="next in 23m" />
            <Stat label="followups" value="8" delta="3 overdue" tone="oxblood" />
            <Stat label="vault size" value="2,489" delta="notes" />
          </div>
        </div>

        {/* Two-column: agenda + activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Agenda */}
          <Panel title="agenda" subtitle="2 events · today" action={<Btn variant="ghost" size="sm" iconRight={<Lucide name="arrow-right" size={12} />}>calendar</Btn>}>
            <AgendaItem
              time="11:00"
              dur="30m"
              title="Design crit · onboarding v3"
              with={['mira', 'jules', 'sam']}
              status="upcoming"
              cta={<Btn variant="primary" size="sm" icon={<Lucide name="mic" size={12} color="#0E0F12" />} onClick={() => setActive('meetings')}>record</Btn>}
            />
            <AgendaItem
              time="14:30"
              dur="60m"
              title="Weekly with Theo"
              with={['theo']}
              status="upcoming"
              cta={<Btn variant="ghost" size="sm" icon={<Lucide name="more-horizontal" size={12} />}></Btn>}
            />
            <AgendaItem
              time="09:00"
              dur="20m"
              title="standup"
              with={['team']}
              status="recorded"
              cta={<Pill tone="moss"><Lucide name="check" size={9} /> recorded</Pill>}
            />
          </Panel>

          {/* Live activity feed */}
          <Panel title="ghost activity" subtitle="last 4 hours" action={<Pill tone="neon"><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--neon)' }}></span> live</Pill>}>
            <ActivityRow source="gmail" verb="archived" subject="3 newsletters" time="2m" />
            <ActivityRow source="slack" verb="captured" subject="#design-crit thread" time="5m" />
            <ActivityRow source="linear" verb="linked" subject="GHO-241 → meeting notes" time="14m" />
            <ActivityRow source="notion" verb="watching" subject="Q2 roadmap" time="22m" />
            <ActivityRow source="calendar" verb="indexed" subject="3 events" time="38m" />
            <ActivityRow source="gmail" verb="extracted" subject="action item from theo" time="1h" />
          </Panel>
        </div>

        {/* Connector pulse strip */}
        <Panel title="connectors" subtitle="6 of 7 connected" action={<Btn variant="ghost" size="sm" onClick={() => setActive('connectors')} iconRight={<Lucide name="arrow-right" size={12} />}>manage</Btn>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {[
              { name: 'gmail', state: 'on', count: '14.8k' },
              { name: 'slack', state: 'on', count: '9.4k' },
              { name: 'notion', state: 'on', count: '1.1k' },
              { name: 'linear', state: 'on', count: '824' },
              { name: 'calendar', state: 'on', count: '412' },
              { name: 'github', state: 'err', count: '—' },
              { name: 'drive', state: 'off', count: '—' },
            ].map(c => <ConnectorPulse key={c.name} {...c} />)}
          </div>
        </Panel>

        {/* Bottom row — recent capture + suggestions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <Panel title="caught lately" action={<Btn variant="ghost" size="sm" onClick={() => setActive('capture')} iconRight={<Lucide name="arrow-right" size={12} />}>inbox</Btn>}>
            <CaptureItem source="gmail" title="re: design crit moved" snippet="works for me — moving the 11am to thursday next week." from="theo · 8:14am" />
            <CaptureItem source="slack" title="#product-feedback" snippet="users keep asking for keyboard shortcuts on the meetings view. ranked it as p1." from="mira · 8:01am" />
            <CaptureItem source="linear" title="GHO-241 closed" snippet="recording auto-pause when system sleeps. shipped in 1.4.2." from="jules · 7:48am" />
          </Panel>

          <Panel title="suggested by ghostbrain" subtitle="quiet hunches">
            <Suggestion icon="link" title="connect drive" body="3 mentions of shared docs in slack this week — none are indexed." />
            <Suggestion icon="user-plus" title="follow up with @sam" body="last reply from sam was 9 days ago. on a thread you starred." />
            <Suggestion icon="sparkles" title="weekly digest is ready" body="summary of 24 captured threads, ready to drop into your daily note." accent />
          </Panel>
        </div>

      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────
const Stat = ({ label, value, delta, tone }) => (
  <div style={{
    background: 'var(--bg-paper)',
    border: '1px solid var(--hairline)',
    borderRadius: 8, padding: 14,
  }}>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: tone === 'neon' ? 'var(--neon)' : 'var(--ink-0)', letterSpacing: '-0.025em', lineHeight: 1.1, marginTop: 4 }}>
      {value}
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-2)', marginTop: 2 }}>{delta}</div>
  </div>
);

const Panel = ({ title, subtitle, action, children, style }) => (
  <section style={{
    background: 'var(--bg-vellum)',
    border: '1px solid var(--hairline)',
    borderRadius: 10, ...style,
  }}>
    <header style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderBottom: '1px solid var(--hairline)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--ink-0)' }}>{title}</h3>
        {subtitle && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{subtitle}</span>}
      </div>
      {action}
    </header>
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
  </section>
);

const AgendaItem = ({ time, dur, title, with: people, status, cta }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 14, alignItems: 'center',
    padding: '10px 8px', borderRadius: 6,
    opacity: status === 'recorded' ? 0.7 : 1,
  }}>
    <div style={{ borderLeft: '2px solid var(--neon)', paddingLeft: 8, lineHeight: 1.15, opacity: status === 'recorded' ? 0.5 : 1 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-0)', fontWeight: 500 }}>{time}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)' }}>{dur}</div>
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: 'var(--ink-0)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>with {people.join(', ')}</div>
    </div>
    {cta}
  </div>
);

const ActivityRow = ({ source, verb, subject, time }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 4 }}>
    <img src={`assets/connectors/${source}.svg`} alt="" style={{ width: 14, height: 14, opacity: 0.9 }} />
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{verb}</span>
    <span style={{ fontSize: 12, color: 'var(--ink-0)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{time}</span>
  </div>
);

const ConnectorPulse = ({ name, state, count }) => {
  const dotColor = state === 'on' ? 'var(--neon)' : state === 'err' ? 'var(--oxblood)' : 'var(--ink-3)';
  return (
    <div style={{
      background: 'var(--bg-paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 6, padding: '10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      cursor: 'pointer',
      opacity: state === 'off' ? 0.5 : 1,
    }}>
      <div style={{ position: 'relative' }}>
        <img src={`assets/connectors/${name}.svg`} alt={name} style={{ width: 22, height: 22, filter: state === 'off' ? 'grayscale(1)' : 'none' }} />
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: dotColor, border: '1.5px solid var(--bg-paper)' }}></span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-1)', textTransform: 'lowercase' }}>{name}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{count}</div>
    </div>
  );
};

const CaptureItem = ({ source, title, snippet, from }) => (
  <div style={{ padding: '10px 8px', borderRadius: 6, cursor: 'pointer' }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-paper)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <img src={`assets/connectors/${source}.svg`} alt="" style={{ width: 12, height: 12 }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-0)' }}>{title}</span>
      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{from}</span>
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-1)', lineHeight: 1.4 }}>"{snippet}"</div>
  </div>
);

const Suggestion = ({ icon, title, body, accent }) => (
  <div style={{
    padding: '10px 12px', borderRadius: 6,
    background: accent ? 'rgba(197,255,61,0.06)' : 'transparent',
    border: accent ? '1px solid rgba(197,255,61,0.18)' : '1px solid transparent',
    display: 'flex', gap: 10, cursor: 'pointer',
  }}>
    <div style={{
      width: 26, height: 26, borderRadius: 5, flexShrink: 0,
      background: accent ? 'rgba(197,255,61,0.15)' : 'var(--bg-paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Lucide name={icon} size={13} color={accent ? 'var(--neon)' : 'var(--ink-1)'} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-0)' }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.4, marginTop: 2 }}>{body}</div>
    </div>
  </div>
);

Object.assign(window, { TodayScreen, Panel, Stat, AgendaItem, ActivityRow, ConnectorPulse, CaptureItem, Suggestion });
