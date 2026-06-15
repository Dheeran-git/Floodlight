// Floodlight Editorial — shared primitives (Citizen Reporter)
// Inline Lucide-style stroke icons + editorial UI atoms. Exported to window.

const FL = {
  paper: '#F6F3EC', paperRaised: '#FBFAF5', card: '#FFFFFF',
  ink: '#16140F', ink2: '#3A362E', ink3: '#6B655A', ink4: '#9A9384',
  rule: '#16140F', ruleSoft: '#DAD4C6',
  accent: '#1B3FA0', accentPress: '#142F7A', accentTint: 'rgba(27,63,160,0.08)',
  emphasis: '#CC3B2B', emphasisTint: 'rgba(204,59,43,0.08)',
  sevCritical: '#CC3B2B', sevHigh: '#C9711B', sevModerate: '#B0860F', sevStable: '#2E7D5B', sevInfo: '#1B3FA0',
  serif: "'Newsreader', Georgia, serif",
  ui: "'Libre Franklin', Helvetica, Arial, sans-serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace",
};

// ---- Lucide-style stroke icons (1.75 stroke, currentColor) ----
function Icon({ name, size = 20, stroke = 1.75, color = 'currentColor', style = {} }) {
  const p = {
    mic: <><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></>,
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    wifiOff: <><path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.8a16 16 0 0 1 5-3.1"/><path d="M22 8.8a16 16 0 0 0-5.5-3.3"/><path d="M5 12.9a10 10 0 0 1 4-2.4"/><path d="M19 12.9a10 10 0 0 0-3-2"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    chevron: <path d="M9 18l6-6-6-6"/>,
    back: <path d="M19 12H5M12 19l-7-7 7-7"/>,
    check: <path d="M20 6L9 17l-5-5"/>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
    send: <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    type: <><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></>,
  }[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style}>{p}</svg>
  );
}

function Kicker({ children, color = FL.ink3, style = {} }) {
  return <div style={{ fontFamily: FL.mono, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}

const SEV = {
  P0: { c: FL.sevCritical, label: 'P0 SOS' },
  P1: { c: FL.sevHigh, label: 'P1 URGENT' },
  P2: { c: FL.sevModerate, label: 'P2 WATCH' },
  STABLE: { c: FL.sevStable, label: 'STABLE' },
  INFO: { c: FL.sevInfo, label: 'INFO' },
};

function SeverityTag({ level }) {
  const s = SEV[level];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FL.mono, fontWeight: 500, fontSize: 11, letterSpacing: '0.05em', color: s.c, background: 'rgba(0,0,0,0.015)', padding: '3px 7px', borderRadius: 2 }}>
      <span style={{ width: 3, height: 11, background: s.c, borderRadius: 1 }}></span>{s.label}
    </span>
  );
}

// Bottom-fixed vermillion emergency button
function EmergencyButton({ onClick, label = 'REPORT EMERGENCY' }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', left: 16, right: 16, bottom: 30, height: 56,
      background: FL.emphasis, color: '#fff', border: 0, borderRadius: 3,
      fontFamily: FL.ui, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      cursor: 'pointer', zIndex: 40, boxShadow: '0 -10px 24px -18px rgba(20,18,15,0.4)',
    }}>
      <Icon name="send" size={18} color="#fff" />{label}
    </button>
  );
}

Object.assign(window, { FL, Icon, Kicker, SeverityTag, SEV, EmergencyButton });
