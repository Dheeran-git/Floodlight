// Floodlight Editorial — Citizen Reporter (mobile PWA) screens
// State machine: home → triage → compose → queued

function Masthead({ sub }) {
  return (
    <div style={{ background: FL.paper, padding: '54px 16px 0' }}>
      <div style={{ height: 3, background: FL.ink }}></div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '8px 0 10px' }}>
        <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 22, color: FL.ink, letterSpacing: '-0.01em' }}>
          Floodlight<span style={{ color: FL.emphasis }}>.</span>
        </div>
        <Kicker>{sub || 'CITIZEN REPORTER'}</Kicker>
      </div>
      <div style={{ height: 1, background: FL.rule }}></div>
    </div>
  );
}

function OfflineBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: FL.paperRaised, border: `1px solid ${FL.ruleSoft}`, borderLeft: `3px solid ${FL.sevModerate}`, borderRadius: 3, padding: '10px 12px', margin: '14px 16px 0' }}>
      <Icon name="wifiOff" size={17} color={FL.sevModerate} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FL.mono, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.06em', color: FL.ink }}>OFFLINE — REPORTS QUEUE LOCALLY</div>
        <div style={{ fontFamily: FL.ui, fontSize: 12, color: FL.ink3, marginTop: 2 }}>Nothing is lost. We send the moment a signal returns.</div>
      </div>
    </div>
  );
}

// ---------- HOME ----------
function HomeScreen({ onReport }) {
  const nearby = [
    { lvl: 'P0', sum: 'Elderly trapped, 2nd floor — Whitefield', meta: 'RPT-2048 · 0.4 km · 12 min ago' },
    { lvl: 'P1', sum: 'Water entering ground-floor homes', meta: 'RPT-2051 · 0.9 km · 26 min ago' },
    { lvl: 'P2', sum: 'Sarjapur junction impassable', meta: 'RPT-2053 · 1.2 km · 41 min ago' },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <Masthead />
      <OfflineBanner />
      <div style={{ padding: '20px 16px 0' }}>
        <Kicker style={{ marginBottom: 10 }}>BELLANDUR · WARD 174</Kicker>
        <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 30, lineHeight: 1.12, color: FL.ink, letterSpacing: '-0.01em' }}>
          See something? Report it.
        </div>
        <div style={{ fontFamily: FL.ui, fontSize: 15, lineHeight: 1.55, color: FL.ink2, marginTop: 10 }}>
          A voice note, a photo, or a line of text — with your location attached. It reaches the response desk even on a weak signal.
        </div>
      </div>
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 9, borderBottom: `1px solid ${FL.rule}` }}>
          <Kicker color={FL.ink}>NEAR YOU</Kicker>
          <span style={{ fontFamily: FL.mono, fontSize: 11, color: FL.ink3 }}>3 ACTIVE</span>
        </div>
        {nearby.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: `1px solid ${FL.ruleSoft}` }}>
            <span style={{ width: 3, background: SEV[r.lvl].c, borderRadius: 1, flexShrink: 0 }}></span>
            <div>
              <div style={{ fontFamily: FL.serif, fontSize: 16, lineHeight: 1.25, color: FL.ink }}>{r.sum}</div>
              <div style={{ fontFamily: FL.mono, fontSize: 11, color: FL.ink3, marginTop: 5 }}>{r.meta}</div>
            </div>
          </div>
        ))}
      </div>
      <EmergencyButton onClick={onReport} />
    </div>
  );
}

// ---------- TRIAGE ----------
function TriageScreen({ onBack, onPick }) {
  const opts = [
    { lvl: 'P0', t: 'Someone is trapped or in danger', d: 'Life threat — needs rescue now' },
    { lvl: 'P1', t: 'Water rising fast / entering home', d: 'Urgent — situation worsening' },
    { lvl: 'P2', t: 'Road blocked or impassable', d: 'Hazard — affects movement' },
    { lvl: 'INFO', t: 'Standing water or general report', d: 'For the record — non-urgent' },
  ];
  return (
    <div style={{ paddingBottom: 30 }}>
      <Masthead sub="STEP 1 OF 2" />
      <div style={{ padding: '14px 16px 0' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: FL.ui, fontWeight: 600, fontSize: 13, color: FL.accent }}>
          <Icon name="back" size={16} color={FL.accent} />Back
        </button>
        <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 28, lineHeight: 1.12, color: FL.ink, marginTop: 14, letterSpacing: '-0.01em' }}>
          What's happening?
        </div>
        <div style={{ fontFamily: FL.ui, fontSize: 14, color: FL.ink3, marginTop: 8 }}>Pick the closest match. You can add detail next.</div>
      </div>
      <div style={{ padding: '18px 16px 0' }}>
        {opts.map((o, i) => (
          <button key={i} onClick={() => onPick(o.lvl)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '16px 0', background: 'none', border: 0, borderTop: i === 0 ? `1px solid ${FL.rule}` : 'none', borderBottom: `1px solid ${FL.ruleSoft}`, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 4, alignSelf: 'stretch', background: SEV[o.lvl].c, borderRadius: 1 }}></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FL.serif, fontSize: 18, lineHeight: 1.25, color: FL.ink }}>{o.t}</div>
              <div style={{ fontFamily: FL.ui, fontSize: 12.5, color: FL.ink3, marginTop: 3 }}>{o.d}</div>
            </div>
            <Icon name="chevron" size={18} color={FL.ink4} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- COMPOSE ----------
function ComposeScreen({ level, onBack, onSubmit }) {
  const [mode, setMode] = React.useState('voice');
  const [recording, setRecording] = React.useState(false);
  const [hasMedia, setHasMedia] = React.useState(false);
  const modes = [
    { k: 'voice', icon: 'mic', label: 'Voice' },
    { k: 'text', icon: 'type', label: 'Text' },
    { k: 'photo', icon: 'camera', label: 'Photo' },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <Masthead sub="STEP 2 OF 2" />
      <div style={{ padding: '14px 16px 0' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: FL.ui, fontWeight: 600, fontSize: 13, color: FL.accent }}>
          <Icon name="back" size={16} color={FL.accent} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <SeverityTag level={level} />
          <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 24, color: FL.ink, letterSpacing: '-0.01em' }}>Add detail</div>
        </div>
      </div>

      {/* mode segmented control */}
      <div style={{ display: 'flex', margin: '18px 16px 0', border: `1px solid ${FL.rule}`, borderRadius: 3, overflow: 'hidden' }}>
        {modes.map((m, i) => (
          <button key={m.k} onClick={() => setMode(m.k)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: mode === m.k ? FL.ink : FL.paper, color: mode === m.k ? FL.paper : FL.ink, border: 0, borderLeft: i > 0 ? `1px solid ${FL.rule}` : 'none', cursor: 'pointer', fontFamily: FL.ui, fontWeight: 600, fontSize: 13 }}>
            <Icon name={m.icon} size={16} color={mode === m.k ? FL.paper : FL.ink} />{m.label}
          </button>
        ))}
      </div>

      {/* mode body */}
      <div style={{ margin: '16px 16px 0', background: FL.card, border: `1px solid ${FL.ruleSoft}`, borderRadius: 4, padding: 18, minHeight: 150 }}>
        {mode === 'voice' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <button onClick={() => { setRecording(!recording); setHasMedia(true); }} style={{ width: 76, height: 76, borderRadius: '50%', border: `2px solid ${recording ? FL.emphasis : FL.ink}`, background: recording ? FL.emphasisTint : FL.paper, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mic" size={30} color={recording ? FL.emphasis : FL.ink} />
            </button>
            <div style={{ fontFamily: FL.mono, fontSize: 12, color: recording ? FL.emphasis : FL.ink3, marginTop: 14, letterSpacing: '0.06em' }}>
              {recording ? '● RECORDING — 0:08' : hasMedia ? 'VOICE NOTE ATTACHED · 0:08' : 'TAP TO RECORD'}
            </div>
            <div style={{ fontFamily: FL.ui, fontSize: 13, color: FL.ink3, marginTop: 8 }}>Speak in any language. We transcribe on the desk.</div>
          </div>
        )}
        {mode === 'text' && (
          <textarea defaultValue="Two people on the terrace at 14 Lake Road, water past the gate." placeholder="Describe what you see…" style={{ width: '100%', minHeight: 120, border: 0, outline: 'none', resize: 'none', fontFamily: FL.ui, fontSize: 15, lineHeight: 1.55, color: FL.ink, background: 'transparent', boxSizing: 'border-box' }} />
        )}
        {mode === 'photo' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: 96, border: `1px dashed ${FL.ink4}`, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: FL.ink3 }}>
              <Icon name="image" size={26} color={FL.ink3} />
              <span style={{ fontFamily: FL.ui, fontSize: 13 }}>Tap to attach a photo</span>
            </div>
          </div>
        )}
      </div>

      {/* GPS captured */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 16px 0', padding: '11px 13px', border: `1px solid ${FL.ruleSoft}`, borderRadius: 3, background: FL.paperRaised }}>
        <Icon name="pin" size={18} color={FL.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FL.ui, fontWeight: 600, fontSize: 13, color: FL.ink }}>Location attached</div>
          <div style={{ fontFamily: FL.mono, fontSize: 11, color: FL.ink3, marginTop: 2 }}>12.9352°N · 77.6245°E · ±8 m</div>
        </div>
        <span style={{ fontFamily: FL.mono, fontSize: 10, color: FL.sevStable, letterSpacing: '0.06em' }}>GPS LOCK</span>
      </div>

      <button onClick={onSubmit} style={{ position: 'absolute', left: 16, right: 16, bottom: 30, height: 56, background: FL.emphasis, color: '#fff', border: 0, borderRadius: 3, fontFamily: FL.ui, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', zIndex: 40 }}>
        <Icon name="send" size={18} color="#fff" />SUBMIT REPORT
      </button>
    </div>
  );
}

// ---------- QUEUED ----------
function QueuedScreen({ level, onDone }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <Masthead sub="SUBMITTED" />
      <div style={{ padding: '40px 16px 0', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${FL.sevStable}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color={FL.sevStable} />
        </div>
        <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 28, color: FL.ink, marginTop: 18, letterSpacing: '-0.01em' }}>Report queued</div>
        <div style={{ fontFamily: FL.ui, fontSize: 15, lineHeight: 1.55, color: FL.ink2, marginTop: 10, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
          You're offline, so it's saved on this phone. It sends automatically the moment a signal returns.
        </div>
      </div>
      <div style={{ margin: '26px 16px 0', border: `1px solid ${FL.ruleSoft}`, borderTop: `3px solid ${FL.ink}`, borderRadius: 4, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 11, borderBottom: `1px solid ${FL.ruleSoft}` }}>
          <Kicker color={FL.ink}>RECEIPT</Kicker>
          <SeverityTag level={level} />
        </div>
        {[['Report ID', 'RPT-2061'], ['Location', '12.9352°N 77.6245°E'], ['Captured', 'T+04:21 · 18 MAY'], ['Status', 'QUEUED — 1 OF 1 PENDING']].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 3 ? `1px solid ${FL.ruleSoft}` : 'none' }}>
            <span style={{ fontFamily: FL.ui, fontSize: 13, color: FL.ink3 }}>{r[0]}</span>
            <span style={{ fontFamily: FL.mono, fontSize: 12, color: i === 3 ? FL.sevModerate : FL.ink, fontVariantNumeric: 'tabular-nums' }}>{r[1]}</span>
          </div>
        ))}
      </div>
      <button onClick={onDone} style={{ position: 'absolute', left: 16, right: 16, bottom: 30, height: 52, background: FL.paper, color: FL.ink, border: `1px solid ${FL.ink}`, borderRadius: 3, fontFamily: FL.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer', zIndex: 40 }}>
        Back to home
      </button>
    </div>
  );
}

function CitizenApp() {
  const [screen, setScreen] = React.useState('home');
  const [level, setLevel] = React.useState('P1');
  return (
    <div style={{ minHeight: '100%', background: FL.paper, fontFamily: FL.ui }}>
      {screen === 'home' && <HomeScreen onReport={() => setScreen('triage')} />}
      {screen === 'triage' && <TriageScreen onBack={() => setScreen('home')} onPick={(l) => { setLevel(l); setScreen('compose'); }} />}
      {screen === 'compose' && <ComposeScreen level={level} onBack={() => setScreen('triage')} onSubmit={() => setScreen('queued')} />}
      {screen === 'queued' && <QueuedScreen level={level} onDone={() => setScreen('home')} />}
    </div>
  );
}

Object.assign(window, { Masthead, OfflineBanner, HomeScreen, TriageScreen, ComposeScreen, QueuedScreen, CitizenApp });
