import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderMarkers } from '../mapMarkers'
import type { MapData } from '../mapMarkers'
import type { Incident, RescueUnit, Report, Shelter } from '@/types'

// Track every Marker that gets constructed so tests can assert positions/count.
const markerInstances: Array<{ lngLat: [number, number] | null }> = []

vi.mock('maplibre-gl', () => {
  class Popup {
    setHTML() {
      return this
    }
  }
  class Marker {
    private record: { lngLat: [number, number] | null }
    constructor() {
      this.record = { lngLat: null }
      markerInstances.push(this.record)
    }
    setLngLat(coords: [number, number]) {
      this.record.lngLat = coords
      return this
    }
    setPopup() {
      return this
    }
    addTo() {
      return this
    }
  }
  return { default: { Popup, Marker } }
})

const fakeMap = {} as never

function makeReport(overrides: Partial<Report>): Report {
  return {
    id: 'r',
    text: 'help',
    latitude: 1,
    longitude: 2,
    source: 'sms',
    severity: 'P1',
    credibility: 0.8,
    status: 'pending',
    created_at: '2026-06-14T00:00:00Z',
    ...overrides,
  }
}

function makeIncident(overrides: Partial<Incident>): Incident {
  return {
    id: 'i',
    title: 'Incident',
    severity: 'P0',
    priority_score: 90,
    status: 'active',
    latitude: 3,
    longitude: 4,
    ...overrides,
  }
}

function makeUnit(overrides: Partial<RescueUnit>): RescueUnit {
  return {
    id: 'u',
    name: 'Boat',
    type: 'boat',
    status: 'available',
    latitude: 5,
    longitude: 6,
    capacity: 6,
    last_updated: '2026-06-14T00:00:00Z',
    ...overrides,
  }
}

function makeShelter(overrides: Partial<Shelter>): Shelter {
  return {
    id: 's',
    name: 'Shelter',
    capacity: 100,
    current_occupancy: 10,
    latitude: 7,
    longitude: 8,
    risk_score: 0.1,
    ...overrides,
  }
}

beforeEach(() => {
  markerInstances.length = 0
})

describe('renderMarkers', () => {
  it('creates one marker per data point', () => {
    const data: MapData = {
      reports: [makeReport({ id: 'r1' }), makeReport({ id: 'r2' })],
      incidents: [makeIncident({ id: 'i1' })],
      units: [makeUnit({ id: 'u1' })],
      shelters: [makeShelter({ id: 's1' }), makeShelter({ id: 's2' })],
    }
    const markers = renderMarkers(fakeMap, data)
    expect(markers).toHaveLength(6)
    expect(markerInstances).toHaveLength(6)
  })

  it('returns an empty array for empty data', () => {
    const markers = renderMarkers(fakeMap, {
      reports: [],
      incidents: [],
      units: [],
      shelters: [],
    })
    expect(markers).toHaveLength(0)
  })

  it('skips incidents without numeric coordinates', () => {
    const withCoords = makeIncident({ id: 'i1' })
    const noLat = makeIncident({
      id: 'i2',
      latitude: undefined as unknown as number,
    })
    const noLng = makeIncident({
      id: 'i3',
      longitude: undefined as unknown as number,
    })
    const markers = renderMarkers(fakeMap, {
      reports: [],
      incidents: [withCoords, noLat, noLng],
      units: [],
      shelters: [],
    })
    expect(markers).toHaveLength(1)
  })

  it('places each marker at its [lng, lat]', () => {
    renderMarkers(fakeMap, {
      reports: [makeReport({ longitude: 12, latitude: 34 })],
      incidents: [],
      units: [],
      shelters: [],
    })
    expect(markerInstances[0].lngLat).toEqual([12, 34])
  })

  it('renders a marker for each forecasted risk zone', () => {
    const markers = renderMarkers(fakeMap, {
      reports: [],
      incidents: [],
      units: [],
      shelters: [],
      riskZones: [
        {
          center_lat: 12.97,
          center_lon: 77.59,
          radius_km: 1.5,
          risk_score: 90,
          predicted_risk_score: 95,
          escalation_probability: 0.9,
          incident_count: 3,
          reasoning: 'cluster of P0 incidents',
        },
      ],
    })
    expect(markers).toHaveLength(1)
    expect(markerInstances[0].lngLat).toEqual([77.59, 12.97])
  })
})
