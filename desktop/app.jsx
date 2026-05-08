// app.jsx — main app: combines screens + tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "screen": "today",
  "recording": "pre",
  "density": "comfortable",
  "showNoise": true
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = React.useState(tweaks.screen);
  const [recordingState, setRecordingState] = React.useState(tweaks.recording);

  // sync tweaks → state
  React.useEffect(() => { setActive(tweaks.screen); }, [tweaks.screen]);
  React.useEffect(() => { setRecordingState(tweaks.recording); }, [tweaks.recording]);

  // sync state → tweaks (so nav reflects in panel)
  const onSetActive = (s) => { setActive(s); setTweak('screen', s); };
  const onSetRecording = (s) => { setRecordingState(s); setTweak('recording', s); };

  // theme on body
  React.useEffect(() => {
    document.body.dataset.theme = tweaks.theme;
    document.body.classList.toggle('no-noise', !tweaks.showNoise);
  }, [tweaks.theme, tweaks.showNoise]);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: tweaks.theme === 'dark' ? '#06070A' : '#D8DBE0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 18,
      backgroundImage: tweaks.theme === 'dark'
        ? 'radial-gradient(circle at 20% 20%, rgba(197,255,61,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,107,90,0.03) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 20%, rgba(0,0,0,0.04) 0%, transparent 50%)',
    }}>
      <WindowChrome density={tweaks.density}>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar active={active} setActive={onSetActive} density={tweaks.density} recordingState={recordingState} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {active === 'today' && <TodayScreen recordingState={recordingState} setActive={onSetActive} density={tweaks.density} />}
            {active === 'connectors' && <ConnectorsScreen />}
            {active === 'meetings' && <MeetingsScreen recordingState={recordingState} setRecordingState={onSetRecording} />}
            {active === 'capture' && <CaptureScreen />}
            {active === 'vault' && <VaultPlaceholder />}
            {active === 'settings' && <SettingsScreen tweaks={tweaks} setTweak={setTweak} />}
          </main>
        </div>
        <StatusBar recordingState={recordingState} />
      </WindowChrome>

      <GhostbrainTweaks tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
};

// ── Status bar ─────────────────────────────────────────────────────────────
const StatusBar = ({ recordingState }) => (
  <footer style={{
    height: 26, flexShrink: 0,
    borderTop: '1px solid var(--hairline)',
    background: 'var(--bg-vellum)',
    display: 'flex', alignItems: 'center', gap: 16, padding: '0 14px',
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)',
    textTransform: 'lowercase',
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon)' }}></span>
      6 connectors live
    </span>
    <span>·</span>
    <span>2,489 indexed</span>
    <span>·</span>
    <span>last sync 1m ago</span>
    {recordingState === 'recording' && <>
      <span>·</span>
      <span style={{ color: 'var(--oxblood)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--oxblood)', animation: 'gb-pulse 1.4s ease-out infinite' }}></span>
        recording
      </span>
    </>}
    <div style={{ flex: 1 }}></div>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Lucide name="cpu" size={9} /> 0.4% cpu</span>
    <span>·</span>
    <span>vault encrypted</span>
  </footer>
);

const VaultPlaceholder = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-paper)' }}>
    <TopBar title="vault" subtitle="opens in obsidian" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 48 }}>
      <Ghost size={72} floating />
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--ink-0)' }}>your vault is in obsidian.</h2>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', textAlign: 'center', maxWidth: 380 }}>
        ghostbrain doesn't replace it — it feeds it. open the vault to see everything as markdown.
      </p>
      <Btn variant="primary" size="lg" icon={<Lucide name="external-link" size={14} color="#0E0F12" />}>open in obsidian</Btn>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>~/Obsidian/brain · 2,489 notes</span>
    </div>
  </div>
);

// ── Tweaks panel ──────────────────────────────────────────────────────────
const GhostbrainTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSelect } = window;
  return (
    <TweaksPanel>
      <TweakSection title="theme">
        <TweakRadio label="" value={tweaks.theme} onChange={v => setTweak('theme', v)}
          options={[{ value: 'dark', label: 'dark' }, { value: 'light', label: 'light' }]} />
      </TweakSection>
      <TweakSection title="screen">
        <TweakSelect label="active screen" value={tweaks.screen} onChange={v => setTweak('screen', v)}
          options={[
            { value: 'today', label: 'today' },
            { value: 'connectors', label: 'connectors' },
            { value: 'meetings', label: 'meetings' },
            { value: 'capture', label: 'capture' },
            { value: 'vault', label: 'vault' },
            { value: 'settings', label: 'settings' },
          ]} />
      </TweakSection>
      <TweakSection title="meeting state">
        <TweakRadio label="" value={tweaks.recording} onChange={v => setTweak('recording', v)}
          options={[
            { value: 'pre', label: 'pre' },
            { value: 'recording', label: 'live' },
            { value: 'post', label: 'post' },
          ]} />
      </TweakSection>
      <TweakSection title="display">
        <TweakRadio label="density" value={tweaks.density} onChange={v => setTweak('density', v)}
          options={[{ value: 'comfortable', label: 'comfy' }, { value: 'compact', label: 'compact' }]} />
        <TweakToggle label="noise texture" value={tweaks.showNoise} onChange={v => setTweak('showNoise', v)} />
      </TweakSection>
    </TweaksPanel>
  );
};

// mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
