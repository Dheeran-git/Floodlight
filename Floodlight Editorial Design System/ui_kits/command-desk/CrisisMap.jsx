// Floodlight Editorial — Crisis map (REAL desaturated Bengaluru basemap)
// Leaflet + CARTO light tiles, CSS-filtered to the warm paper palette, with
// Floodlight overlays: flood-depth polygons, ink-blue route, vermillion dashed
// blocked road, ochre teams, green shelters, severity report markers, serif
// place labels, and a boxed mono legend. Leaflet is loaded from CDN in index.html.

function CrisisMap({ selected, onSelect }) {
  const elRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const reportLayers = React.useRef({});
  const ringRef = React.useRef(null);
  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;

  const sevColor = (l) => SEV[l].c;

  React.useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, dragging: true, doubleClickZoom: false,
      center: MAP_CENTER, zoom: MAP_ZOOM,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    // ---- flood-depth polygons ----
    const floodFill = { 1: FL.flood1, 2: FL.flood2, 3: FL.flood3, 4: FL.flood4 };
    FLOOD_ZONES.forEach(z => {
      L.polygon(z.ll, { stroke: false, fillColor: floodFill[z.depth], fillOpacity: 0.55, interactive: false }).addTo(map);
    });

    // ---- blocked road (vermillion dashed) ----
    L.polyline(BLOCKED, { color: FL.blocked, weight: 4, dashArray: '10 8', opacity: 0.95, interactive: false }).addTo(map);
    // ---- optimized rescue route (ink-blue) ----
    L.polyline(ROUTE, { color: FL.route, weight: 4, opacity: 0.95, interactive: false }).addTo(map);

    // ---- shelters (green house tick) ----
    SHELTERS.forEach(s => {
      const icon = L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9], html:
        `<div style="width:16px;height:16px;background:${FL.card};border:2px solid ${FL.shelter};position:relative;">
           <div style="position:absolute;left:1px;right:1px;top:-5px;height:5px;border-top:2px solid ${FL.shelter};border-left:2px solid ${FL.shelter};border-right:2px solid ${FL.shelter};transform:skewX(0);"></div>
         </div>` });
      L.marker(s.ll, { icon, interactive: false }).addTo(map);
    });

    // ---- teams (ochre flag) ----
    TEAMS.forEach(t => {
      const icon = L.divIcon({ className: '', iconSize: [16, 20], iconAnchor: [2, 20], html:
        `<div style="width:2px;height:20px;background:${FL.team};position:relative;">
           <div style="position:absolute;left:2px;top:0;width:0;height:0;border-left:11px solid ${FL.team};border-top:5px solid transparent;border-bottom:5px solid transparent;"></div>
         </div>` });
      L.marker(t.ll, { icon, interactive: false }).addTo(map);
    });

    // ---- serif place labels ----
    const labels = [
      { ll: [12.920, 77.666], text: 'Bellandur Lake' },
      { ll: [12.953, 77.701], text: 'Whitefield' },
    ];
    labels.forEach(l => {
      const icon = L.divIcon({ className: '', iconSize: [140, 20], iconAnchor: [0, 10], html:
        `<div style="font-family:${FL.serif};font-style:italic;font-size:15px;color:${FL.ink2};text-shadow:0 0 3px ${FL.paper},0 0 3px ${FL.paper};white-space:nowrap;">${l.text}</div>` });
      L.marker(l.ll, { icon, interactive: false }).addTo(map);
    });

    // ---- selection ring (under markers) ----
    ringRef.current = L.circleMarker(MAP_CENTER, { radius: 13, color: FL.ink, weight: 1.5, opacity: 0, fill: false, interactive: false }).addTo(map);

    // ---- report markers (severity dots) ----
    REPORTS.forEach(r => {
      const m = L.circleMarker(r.ll, {
        radius: 7, fillColor: sevColor(r.lvl), fillOpacity: 1,
        color: FL.paper, weight: 2,
      }).addTo(map);
      m.on('click', () => onSelectRef.current(r.id));
      reportLayers.current[r.id] = m;
    });

    // keep sized to its flex container
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);

    return () => { ro.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  // restyle on selection
  React.useEffect(() => {
    Object.entries(reportLayers.current).forEach(([id, m]) => {
      m.setStyle({ radius: id === selected ? 9 : 7, weight: id === selected ? 2.5 : 2 });
      if (id === selected) m.bringToFront();
    });
    const ring = ringRef.current;
    const r = REPORTS.find(x => x.id === selected);
    if (ring && r) {
      ring.setLatLng(r.ll);
      ring.setStyle({ color: sevColor(r.lvl), opacity: 0.7 });
    } else if (ring) {
      ring.setStyle({ opacity: 0 });
    }
  }, [selected]);

  return (
    <div style={{ flex: 1, position: 'relative', background: FL.paperRaised, overflow: 'hidden' }}>
      <div ref={elRef} className="paper-map" style={{ position: 'absolute', inset: 0, background: FL.paper }}></div>

      {/* boxed mono legend */}
      <div style={{ position: 'absolute', left: 16, bottom: 16, zIndex: 500, background: FL.card, border: `1px solid ${FL.rule}`, borderRadius: 3, padding: 12, width: 186 }}>
        <div style={{ fontFamily: FL.mono, fontSize: 10, letterSpacing: '0.1em', color: FL.ink3, paddingBottom: 8, borderBottom: `1px solid ${FL.ruleSoft}`, marginBottom: 9 }}>LEGEND · BENGALURU SE</div>
        {[
          ['sw', FL.flood4, 'Deep / inundated'],
          ['sw', FL.flood2, 'Shallow / rising'],
          ['ln', FL.route, 'Rescue route'],
          ['dash', FL.blocked, 'Blocked road'],
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: FL.mono, fontSize: 11, color: FL.ink2, marginBottom: 7 }}>
            {row[0] === 'sw' && <span style={{ width: 14, height: 10, background: row[1], borderRadius: 1 }}></span>}
            {row[0] === 'ln' && <span style={{ width: 16, borderTop: `2px solid ${row[1]}` }}></span>}
            {row[0] === 'dash' && <span style={{ width: 16, borderTop: `2px dashed ${row[1]}` }}></span>}
            {row[2]}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 14, fontFamily: FL.mono, fontSize: 11, color: FL.ink2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: FL.team }}></span>Team</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: FL.shelter }}></span>Shelter</span>
        </div>
      </div>

      {/* dateline chip — keeps it reading like a printed figure */}
      <div style={{ position: 'absolute', right: 16, top: 14, zIndex: 500, fontFamily: FL.mono, fontSize: 10, letterSpacing: '0.08em', color: FL.ink3, background: FL.paper, border: `1px solid ${FL.ruleSoft}`, borderRadius: 2, padding: '4px 8px' }}>
        FIG. 1 · INUNDATION + ACTIVE REPORTS · 22:14 IST
      </div>
    </div>
  );
}

Object.assign(window, { CrisisMap });
