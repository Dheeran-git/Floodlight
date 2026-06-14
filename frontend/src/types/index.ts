/**
 * Shared TypeScript type definitions for Floodlight.
 *
 * Domain types matching backend Pydantic schemas (see backend/app/schemas).
 * These will be expanded as features are implemented.
 */

/** Severity levels per CLAUDE.md triage rules. */
export type Severity = 'P0' | 'P1' | 'P2' | 'P3'

/** Report status. */
export type ReportStatus = 'pending' | 'triaged' | 'merged' | 'dismissed'

/** Rescue unit status. */
export type UnitStatus = 'available' | 'assigned' | 'en_route' | 'on_scene' | 'returning'

/** Incident status. */
export type IncidentStatus = 'active' | 'resolved' | 'merged'

/** Route status. */
export type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled'

/** User roles per ARCHITECTURE.md. */
export type UserRole = 'citizen' | 'operator' | 'commander' | 'admin'

/** A citizen-submitted report. Matches ReportResponse. */
export interface Report {
  id: string
  text: string
  latitude: number
  longitude: number
  source: string
  severity: Severity | null
  credibility: number | null
  status: ReportStatus
  created_at: string
}

/** An incident summary from GET /incidents. Matches IncidentResponse. */
export interface Incident {
  id: string
  severity: Severity
  priority_score: number
}

/** Full incident detail from GET /incidents/{id}. Matches IncidentDetail. */
export interface IncidentDetail extends Incident {
  title: string
  description: string
  status: IncidentStatus
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
  reports: Report[]
}

/** A rescue unit from GET /resources. Matches RescueUnitResponse. */
export interface RescueUnit {
  id: string
  name: string
  type: string
  status: UnitStatus
  latitude: number
  longitude: number
  capacity: number
  last_updated: string
}

/** A shelter from GET /shelters. Matches ShelterResponse. */
export interface Shelter {
  id: string
  name: string
  capacity: number
  current_occupancy: number
  latitude: number
  longitude: number
  risk_score: number
}

/** Shelter overflow prediction from GET /shelters/risk. Matches ShelterRiskResponse. */
export interface ShelterRisk {
  name: string
  overflow_probability: number
}

/** Backend connection state for status indicators. */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
