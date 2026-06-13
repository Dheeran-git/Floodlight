/**
 * Shared TypeScript type definitions for Floodlight.
 *
 * Domain types matching backend Pydantic schemas.
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
