/**
 * Zustand stores for Floodlight state management.
 *
 * Stores are organized by domain:
 * - incidents: Active incidents and selected incident
 * - resources: Rescue units and assignment state
 * - shelters: Shelter capacity and risk data
 * - ui: UI state (selected panel, map view, filters)
 */

export { useIncidentStore } from './incidentStore'
export { useResourceStore } from './resourceStore'
export { useShelterStore } from './shelterStore'
export { useUiStore } from './uiStore'
