import { useEffect, useMemo } from 'react'

import { CommandPanel, OptimizeButton, SimulationButton } from '@/components/command'
import { DashboardShell, DegradedBanner } from '@/components/dashboard'
import { IncidentList } from '@/components/incidents'
import { LazyMap, MapLegend } from '@/components/maps'
import type { MapData } from '@/components/maps'
import { ResourceList } from '@/components/resources'
import { ShelterList } from '@/components/shelters'
import { Card, SidePanel } from '@/components/ui'
import {
  useIncidents,
  useOnlineStatus,
  useReports,
  useResources,
  useShelters,
} from '@/hooks'
import { useUiStore } from '@/state'

/** Main operations dashboard: live crisis map with incident/resource panels. */
export function OperationsDesk() {
  const incidents = useIncidents()
  const reports = useReports()
  const resources = useResources()
  const shelters = useShelters()
  const online = useOnlineStatus()

  const setConnection = useUiStore((state) => state.setConnection)
  const leftCollapsed = useUiStore((state) => state.leftPanelCollapsed)
  const rightCollapsed = useUiStore((state) => state.rightPanelCollapsed)
  const toggleLeft = useUiStore((state) => state.toggleLeftPanel)
  const toggleRight = useUiStore((state) => state.toggleRightPanel)

  const anyError = incidents.isError || resources.isError || shelters.isError
  const anyLoading =
    incidents.isLoading || resources.isLoading || shelters.isLoading
  const degraded = !online || anyError

  useEffect(() => {
    if (degraded) setConnection('disconnected')
    else if (anyLoading) setConnection('connecting')
    else setConnection('connected')
  }, [degraded, anyLoading, setConnection])

  const mapData: MapData = useMemo(
    () => ({
      reports: reports.data ?? [],
      incidents: incidents.data ?? [],
      units: resources.data ?? [],
      shelters: shelters.data ?? [],
    }),
    [reports.data, incidents.data, resources.data, shelters.data],
  )

  return (
    <DashboardShell
      incidentCount={incidents.data?.length ?? 0}
      unitCount={resources.data?.length ?? 0}
      shelterCount={shelters.data?.length ?? 0}
    >
      {degraded && <DegradedBanner />}
      <div className="flex h-full">
        <SidePanel
          title="Incidents"
          side="left"
          collapsed={leftCollapsed}
          onToggle={toggleLeft}
        >
          <IncidentList
            incidents={incidents.data ?? []}
            isLoading={incidents.isLoading}
          />
        </SidePanel>

        <div className="relative flex-1">
          <LazyMap data={mapData} />
          <MapLegend />
        </div>

        <SidePanel
          title="Resources & Shelters"
          side="right"
          collapsed={rightCollapsed}
          onToggle={toggleRight}
        >
          <ResourceList units={resources.data ?? []} isLoading={resources.isLoading} />
          <ShelterList shelters={shelters.data ?? []} isLoading={shelters.isLoading} />
          <Card title="Optimization">
            <OptimizeButton />
          </Card>
          <Card title="Simulation">
            <SimulationButton />
          </Card>
          <CommandPanel />
        </SidePanel>
      </div>
    </DashboardShell>
  )
}
