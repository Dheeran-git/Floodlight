import { beforeEach, describe, expect, it } from 'vitest'

import { useIncidentStore } from '../incidentStore'
import { useResourceStore } from '../resourceStore'
import { useShelterStore } from '../shelterStore'
import { useUiStore } from '../uiStore'
import type { Incident, RescueUnit, Shelter } from '@/types'

const incident: Incident = {
  id: 'i1',
  title: 'Flood',
  severity: 'P0',
  priority_score: 90,
  status: 'active',
  latitude: 0,
  longitude: 0,
}

const unit: RescueUnit = {
  id: 'u1',
  name: 'Boat',
  type: 'boat',
  status: 'available',
  latitude: 0,
  longitude: 0,
  capacity: 6,
  last_updated: '2026-06-14T00:00:00Z',
}

const shelter: Shelter = {
  id: 's1',
  name: 'Shelter',
  capacity: 100,
  current_occupancy: 10,
  latitude: 0,
  longitude: 0,
  risk_score: 0.1,
}

describe('incidentStore', () => {
  beforeEach(() => {
    useIncidentStore.setState({ incidents: [], selectedIncidentId: null })
  })

  it('sets the incident list', () => {
    useIncidentStore.getState().setIncidents([incident])
    expect(useIncidentStore.getState().incidents).toEqual([incident])
  })

  it('selects and clears the selected incident', () => {
    useIncidentStore.getState().selectIncident('i1')
    expect(useIncidentStore.getState().selectedIncidentId).toBe('i1')
    useIncidentStore.getState().selectIncident(null)
    expect(useIncidentStore.getState().selectedIncidentId).toBeNull()
  })
})

describe('resourceStore', () => {
  beforeEach(() => {
    useResourceStore.setState({ units: [] })
  })

  it('sets the units list', () => {
    useResourceStore.getState().setUnits([unit])
    expect(useResourceStore.getState().units).toEqual([unit])
  })
})

describe('shelterStore', () => {
  beforeEach(() => {
    useShelterStore.setState({ shelters: [] })
  })

  it('sets the shelters list', () => {
    useShelterStore.getState().setShelters([shelter])
    expect(useShelterStore.getState().shelters).toEqual([shelter])
  })
})

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,
      connection: 'connecting',
    })
  })

  it('toggles the left panel', () => {
    expect(useUiStore.getState().leftPanelCollapsed).toBe(false)
    useUiStore.getState().toggleLeftPanel()
    expect(useUiStore.getState().leftPanelCollapsed).toBe(true)
    useUiStore.getState().toggleLeftPanel()
    expect(useUiStore.getState().leftPanelCollapsed).toBe(false)
  })

  it('toggles the right panel independently', () => {
    useUiStore.getState().toggleRightPanel()
    expect(useUiStore.getState().rightPanelCollapsed).toBe(true)
    expect(useUiStore.getState().leftPanelCollapsed).toBe(false)
  })

  it('updates the connection status', () => {
    useUiStore.getState().setConnection('connected')
    expect(useUiStore.getState().connection).toBe('connected')
    useUiStore.getState().setConnection('disconnected')
    expect(useUiStore.getState().connection).toBe('disconnected')
  })
})
