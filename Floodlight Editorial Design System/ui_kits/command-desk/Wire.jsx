// Floodlight Editorial — Command Desk "wire" column
// Severity list (ruled rows) + AI query desk.

function ReportRow({ r, selected, onSelect, onDispatch }) {
  const c = SEV[r.lvl].c;
  const on = selected === r.id;
  return (
    <div onClick={() => onSelect(r.id)} style={{ display: 'flex', gap: 12, padding: '13px 18px', borderBottom: `1px solid ${FL.ruleSoft}`, background: on ? FL.accentTint : 'transparent', cursor: 'pointer' }}>
      <span style={{ width: 3, background: c, borderRadius: 1, flexShrink: 0 }}></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <SeverityTag level={r.lvl} small />
          <span style={{ fontFamily: FL.mono, fontSize: 10.5, color: FL.ink3 }}>{r.t}</span>
        </div>
        <div style={{ fontFamily: FL.serif, fontSize: 16, lineHeight: 1.25, color: FL.ink, marginTop: 6 }}>
          {r.sum} — {r.place}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: FL.mono, fontSize: 10.5, color: FL.ink3 }}>{r.id} · {r.coord}</span>
          <button onClick={(e) => { e.stopPropagation(); onDispatch(r); }} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: FL.ui, fontWeight: 600, fontSize: 12.5, color: r.lvl === 'P0' ? FL.emphasis : FL.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}>
            {r.lvl === 'P0' ? 'Dispatch SOS' : 'Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QueryDesk() {
  const [q, setQ] = React.useState('');
  const [asked, setAsked] = React.useState(false);
  const sample = 'which shelter exceeds capacity next?';
  return (
    <div style={{ borderTop: `1px solid ${FL.rule}`, background: FL.paperRaised, padding: 18 }}>
      <Kicker style={{ marginBottom: 10 }}>AI QUERY DESK</Kicker>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: FL.card, border: `1px solid ${asked ? FL.accent : FL.ruleSoft}`, borderRadius: 3, padding: '10px 12px' }}>
        <span style={{ fontFamily: FL.mono, fontSize: 12, color: FL.ink3, flexShrink: 0 }}>QUERY —</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={sample}
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: q ? FL.ui : FL.serif, fontStyle: q ? 'normal' : 'italic', fontSize: 15, color: q ? FL.ink : FL.ink3, minWidth: 0 }} />
        <button onClick={() => setAsked(true)} style={{ width: 30, height: 30, borderRadius: 3, border: 0, background: FL.accent, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="send" size={14} color="#fff" />
        </button>
      </div>
      {asked && (
        <div style={{ marginTop: 14, borderLeft: `3px solid ${FL.emphasis}`, paddingLeft: 14 }}>
          <div style={{ fontFamily: FL.serif, fontSize: 16, lineHeight: 1.4, color: FL.ink }}>
            <strong style={{ color: FL.emphasis, fontFamily: FL.serif }}>Community Hall</strong> reaches capacity in <strong style={{ color: FL.emphasis }}>~40 min</strong> at the current intake rate.
          </div>
          <div style={{ fontFamily: FL.mono, fontSize: 10.5, color: FL.ink3, marginTop: 8 }}>SH-2 · 94% · INTAKE 12/HR · MODEL OSC-1.0</div>
        </div>
      )}
    </div>
  );
}

function WireColumn({ selected, onSelect, onDispatch }) {
  return (
    <aside style={{ width: 392, flexShrink: 0, borderLeft: `1px solid ${FL.rule}`, background: FL.paper, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px 13px', borderBottom: `1px solid ${FL.rule}` }}>
        <Kicker color={FL.ink}>INCOMING WIRE · LIVE</Kicker>
        <span style={{ fontFamily: FL.mono, fontSize: 11, color: FL.emphasis }}>6 SOS</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {REPORTS.map(r => (
          <ReportRow key={r.id} r={r} selected={selected} onSelect={onSelect} onDispatch={onDispatch} />
        ))}
      </div>
      <QueryDesk />
    </aside>
  );
}

Object.assign(window, { ReportRow, QueryDesk, WireColumn });
