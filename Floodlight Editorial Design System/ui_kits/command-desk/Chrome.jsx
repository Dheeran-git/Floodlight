// Floodlight Editorial — Command Desk chrome (masthead + left rail)

function Masthead({ dateline }) {
  return (
    <header style={{ background: FL.paper, borderBottom: `1px solid ${FL.rule}`, position: 'relative', zIndex: 5 }}>
      <div style={{ height: 3, background: FL.ink }}></div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '12px 24px 11px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 27, color: FL.ink, letterSpacing: '-0.01em', lineHeight: 1 }}>
            Floodlight<span style={{ color: FL.emphasis }}>.</span>
          </div>
          <Kicker style={{ fontSize: 11.5 }}>RESPONDER COMMAND DESK</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: FL.mono, fontSize: 11.5, color: FL.ink2, letterSpacing: '0.04em' }}>{dateline}</span>
          <span style={{ width: 1, height: 16, background: FL.ruleSoft }}></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FL.mono, fontSize: 11, color: FL.sevStable }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: FL.sevStable }}></span>SYNC OK
          </span>
          <button style={{ width: 34, height: 34, border: `1px solid ${FL.ruleSoft}`, borderRadius: 3, background: FL.paper, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="moon" size={16} color={FL.ink2} />
          </button>
        </div>
      </div>
    </header>
  );
}

function LeftRail({ active, onSelect }) {
  const items = [
    { k: 'situation', icon: 'activity', label: 'Situation' },
    { k: 'map', icon: 'map', label: 'Crisis map' },
    { k: 'reports', icon: 'list', label: 'Reports', badge: '14' },
    { k: 'teams', icon: 'truck', label: 'Teams' },
    { k: 'shelters', icon: 'home', label: 'Shelters' },
    { k: 'query', icon: 'search', label: 'AI query desk' },
  ];
  return (
    <nav style={{ width: 224, flexShrink: 0, background: FL.paperRaised, borderRight: `1px solid ${FL.rule}`, padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
      <Kicker style={{ padding: '0 20px 12px' }}>SECTIONS</Kicker>
      {items.map(it => {
        const on = active === it.k;
        return (
          <button key={it.k} onClick={() => onSelect(it.k)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 20px', background: on ? FL.paper : 'transparent', border: 0, borderLeft: `2px solid ${on ? FL.ink : 'transparent'}`, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <Icon name={it.icon} size={17} color={on ? FL.ink : FL.ink3} />
            <span style={{ flex: 1, fontFamily: FL.ui, fontWeight: on ? 700 : 500, fontSize: 14, color: on ? FL.ink : FL.ink2 }}>{it.label}</span>
            {it.badge && <span style={{ fontFamily: FL.mono, fontSize: 11, color: FL.emphasis, fontWeight: 500 }}>{it.badge}</span>}
          </button>
        );
      })}
      <div style={{ flex: 1 }}></div>
      <div style={{ margin: '0 20px', paddingTop: 16, borderTop: `1px solid ${FL.ruleSoft}` }}>
        <Kicker style={{ marginBottom: 8 }}>OPERATOR</Kicker>
        <div style={{ fontFamily: FL.serif, fontSize: 15, color: FL.ink }}>Desk 02 · A. Rao</div>
        <div style={{ fontFamily: FL.mono, fontSize: 10.5, color: FL.ink3, marginTop: 3 }}>SHIFT 18:00–06:00</div>
      </div>
    </nav>
  );
}

// Pull-stat strip above the map
function StatStrip() {
  const stats = [
    { k: 'ACTIVE REPORTS', v: '48', emph: true },
    { k: 'P0 / SOS OPEN', v: '6', emph: true },
    { k: 'TEAMS DEPLOYED', v: '11' },
    { k: 'SHELTERS · CAPACITY', v: '7 / 82%' },
  ];
  return (
    <div style={{ display: 'flex', background: FL.paper, borderBottom: `1px solid ${FL.rule}` }}>
      {stats.map((s, i) => (
        <div key={i} style={{ flex: 1, padding: '13px 20px', borderRight: i < stats.length - 1 ? `1px solid ${FL.ruleSoft}` : 'none' }}>
          <Kicker style={{ fontSize: 10 }}>{s.k}</Kicker>
          <div style={{ fontFamily: FL.serif, fontWeight: 600, fontSize: 30, lineHeight: 1, marginTop: 6, letterSpacing: '-0.02em', color: s.emph ? FL.emphasis : FL.ink, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Masthead, LeftRail, StatStrip });
