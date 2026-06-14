import mapboxgl from 'mapbox-gl'

import type { Incident, RescueUnit, Report, RiskZone, Shelter } from '@/types'
import {
  SEVERITY_COLOR,
  UNIT_STATUS_COLOR,
  createDot,
  createPulseMarker,
  createRiskZone,
  popupHtml,
  riskColor,
  shelterColor,
} from './markerStyles'

/** Data layers rendered on the crisis map. */
export interface MapData {
  reports: Report[]
  incidents: Incident[]
  units: RescueUnit[]
  shelters: Shelter[]
  riskZones?: RiskZone[]
}

/** A point with coordinates and a marker element + popup. */
interface MarkerSpec {
  lng: number
  lat: number
  element: HTMLElement
  popup: string
}

function addMarkers(map: mapboxgl.Map, specs: MarkerSpec[]): mapboxgl.Marker[] {
  return specs.map((spec) => {
    const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(spec.popup)
    return new mapboxgl.Marker({ element: spec.element })
      .setLngLat([spec.lng, spec.lat])
      .setPopup(popup)
      .addTo(map)
  })
}

function reportSpecs(reports: Report[]): MarkerSpec[] {
  return reports.map((r) => ({
    lng: r.longitude,
    lat: r.latitude,
    element: createDot(SEVERITY_COLOR[r.severity ?? 'P3']),
    popup: popupHtml('SOS Report', [
      ['Severity', r.severity ?? 'unrated'],
      ['Status', r.status],
      ['Detail', r.text.slice(0, 80)],
    ]),
  }))
}

/** Incidents only render when they carry coordinates (e.g. IncidentDetail). */
function incidentSpecs(incidents: Incident[]): MarkerSpec[] {
  return incidents
    .filter(
      (i): i is Incident & { latitude: number; longitude: number } =>
        typeof (i as { latitude?: number }).latitude === 'number' &&
        typeof (i as { longitude?: number }).longitude === 'number',
    )
    .map((i) => ({
      lng: i.longitude,
      lat: i.latitude,
      element: createPulseMarker(SEVERITY_COLOR[i.severity]),
      popup: popupHtml('Incident', [
        ['Severity', i.severity],
        ['Priority', String(i.priority_score)],
      ]),
    }))
}

function unitSpecs(units: RescueUnit[]): MarkerSpec[] {
  return units.map((u) => ({
    lng: u.longitude,
    lat: u.latitude,
    element: createDot(UNIT_STATUS_COLOR[u.status], 'rotate-45'),
    popup: popupHtml(u.name, [
      ['Type', u.type],
      ['Status', u.status],
      ['Capacity', String(u.capacity)],
    ]),
  }))
}

function shelterSpecs(shelters: Shelter[]): MarkerSpec[] {
  return shelters.map((s) => {
    const ratio = s.capacity ? s.current_occupancy / s.capacity : 0
    return {
      lng: s.longitude,
      lat: s.latitude,
      element: createDot(shelterColor(ratio), 'h-4 w-4'),
      popup: popupHtml(s.name, [
        ['Occupancy', `${s.current_occupancy}/${s.capacity}`],
        ['Load', `${Math.round(ratio * 100)}%`],
      ]),
    }
  })
}

function riskZoneSpecs(zones: RiskZone[]): MarkerSpec[] {
  return zones.map((z) => ({
    lng: z.center_lon,
    lat: z.center_lat,
    element: createRiskZone(riskColor(z.risk_score)),
    popup: popupHtml('Risk Zone', [
      ['Risk', `${Math.round(z.risk_score)} → ${Math.round(z.predicted_risk_score)}`],
      ['Escalation', `${Math.round(z.escalation_probability * 100)}%`],
      ['Incidents', String(z.incident_count)],
      ['Why', z.reasoning],
    ]),
  }))
}

/** Render all data-layer markers; returns them for later cleanup. */
export function renderMarkers(map: mapboxgl.Map, data: MapData): mapboxgl.Marker[] {
  // Risk zones render first so point markers sit on top of the area discs.
  const specs = [
    ...riskZoneSpecs(data.riskZones ?? []),
    ...reportSpecs(data.reports),
    ...incidentSpecs(data.incidents),
    ...unitSpecs(data.units),
    ...shelterSpecs(data.shelters),
  ]
  return addMarkers(map, specs)
}
