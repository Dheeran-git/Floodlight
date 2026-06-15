// Floodlight Editorial — Command Desk primitives
const FL = {
  paper: '#F6F3EC', paperRaised: '#FBFAF5', card: '#FFFFFF',
  ink: '#16140F', ink2: '#3A362E', ink3: '#6B655A', ink4: '#9A9384',
  rule: '#16140F', ruleSoft: '#DAD4C6',
  accent: '#1B3FA0', accentPress: '#142F7A', accentTint: 'rgba(27,63,160,0.08)',
  emphasis: '#CC3B2B', emphasisTint: 'rgba(204,59,43,0.08)',
  sevCritical: '#CC3B2B', sevHigh: '#C9711B', sevModerate: '#B0860F', sevStable: '#2E7D5B', sevInfo: '#1B3FA0',
  flood1: '#CBD7EE', flood2: '#93AEDC', flood3: '#5C84C8', flood4: '#2A4FA0',
  route: '#1B3FA0', blocked: '#CC3B2B', team: '#C9711B', shelter: '#2E7D5B',
  serif: "'Newsreader', Georgia, serif",
  ui: "'Libre Franklin', Helvetica, Arial, sans-serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace",
};

function Icon({ name, size = 18, stroke = 1.75, color = 'currentColor', style = {} }) {
  const p = {
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    map: <><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    truck: <><path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l3 3v5h-2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></>,
    home: <><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 21V12h6v9"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    radio: <><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    send: <><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7Z"/></>,
    chevron: <path d="M9 18l6-6-6-6"/>,
    arrow: <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,
  }[name];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>{p}</svg>;
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

function SeverityTag({ level, small }) {
  const s = SEV[level];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FL.mono, fontWeight: 500, fontSize: small ? 10 : 11, letterSpacing: '0.05em', color: s.c, padding: '2px 6px', borderRadius: 2, background: 'rgba(0,0,0,0.02)' }}>
      <span style={{ width: 3, height: small ? 9 : 11, background: s.c, borderRadius: 1 }}></span>{s.label}
    </span>
  );
}

function Button({ children, kind = 'primary', icon, onClick, style = {} }) {
  const base = { height: 38, padding: '0 16px', borderRadius: 3, fontFamily: FL.ui, fontWeight: 600, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', border: '1px solid transparent', transition: 'background 140ms, color 140ms', ...style };
  const kinds = {
    primary: { background: FL.accent, color: '#fff' },
    secondary: { background: FL.paper, color: FL.ink, borderColor: FL.ink },
    critical: { background: FL.emphasis, color: '#fff' },
  };
  return <button onClick={onClick} style={{ ...base, ...kinds[kind] }}>{icon && <Icon name={icon} size={15} color={kinds[kind].color} />}{children}</button>;
}

Object.assign(window, { FL, Icon, Kicker, SeverityTag, SEV, Button });
