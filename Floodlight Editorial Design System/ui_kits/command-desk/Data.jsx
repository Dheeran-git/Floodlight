// Floodlight Editorial — Command Desk shared data
// Geo coords (lat,lng) drive the real Leaflet basemap overlays around
// Bellandur, Bengaluru SE. The wire list reads the same records.

const MAP_CENTER = [12.926, 77.658];
const MAP_ZOOM = 13;

const REPORTS = [
  { id: 'RPT-2048', lvl: 'P0', sum: 'Elderly trapped, 2nd floor', place: 'Whitefield', coord: '12.97°N 77.59°E', t: 'T+04:12', ll: [12.957, 77.706] },
  { id: 'RPT-2051', lvl: 'P0', sum: 'Family on rooftop, water rising', place: 'Bellandur', coord: '12.93°N 77.62°E', t: 'T+04:18', ll: [12.926, 77.668] },
  { id: 'RPT-2053', lvl: 'P1', sum: 'Vehicle submerged, 1 person', place: 'Sarjapur Rd', coord: '12.91°N 77.68°E', t: 'T+04:21', ll: [12.901, 77.692] },
  { id: 'RPT-2054', lvl: 'P1', sum: 'Ground-floor flooding, 8 homes', place: 'Kasavanahalli', coord: '12.90°N 77.66°E', t: 'T+04:24', ll: [12.909, 77.661] },
  { id: 'RPT-2057', lvl: 'P2', sum: 'Road impassable, debris', place: 'ORR Junction', coord: '12.94°N 77.61°E', t: 'T+04:29', ll: [12.944, 77.638] },
  { id: 'RPT-2059', lvl: 'INFO', sum: 'Standing water, ankle deep', place: 'HSR Layout', coord: '12.91°N 77.64°E', t: 'T+04:33', ll: [12.912, 77.642] },
];

const TEAMS = [
  { id: 'TM-04', ll: [12.933, 77.650] },
  { id: 'TM-07', ll: [12.938, 77.685] },
  { id: 'TM-09', ll: [12.910, 77.676] },
];

const SHELTERS = [
  { id: 'SH-1', name: 'Govt School', cap: 0.62, ll: [12.951, 77.636] },
  { id: 'SH-2', name: 'Community Hall', cap: 0.94, ll: [12.917, 77.700] },
];

// Flood-depth polygons (paths of [lat,lng]) — muted depth ramp over the lake basin.
const FLOOD_ZONES = [
  { depth: 2, ll: [[12.936,77.648],[12.931,77.672],[12.918,77.684],[12.905,77.678],[12.901,77.660],[12.910,77.644],[12.924,77.640]] },
  { depth: 3, ll: [[12.930,77.658],[12.926,77.674],[12.916,77.679],[12.908,77.671],[12.908,77.658],[12.918,77.652]] },
  { depth: 4, ll: [[12.924,77.662],[12.921,77.671],[12.914,77.672],[12.912,77.663],[12.917,77.658]] },
  { depth: 1, ll: [[12.955,77.695],[12.948,77.712],[12.938,77.710],[12.940,77.694],[12.949,77.690]] },
];

// Optimized rescue route (ink-blue) — TM-07 → RPT-2051.
const ROUTE = [[12.938,77.685],[12.934,77.676],[12.930,77.671],[12.926,77.668]];

// Blocked road (vermillion dashed).
const BLOCKED = [[12.944,77.638],[12.932,77.640],[12.922,77.643]];

Object.assign(window, { MAP_CENTER, MAP_ZOOM, REPORTS, TEAMS, SHELTERS, FLOOD_ZONES, ROUTE, BLOCKED });
