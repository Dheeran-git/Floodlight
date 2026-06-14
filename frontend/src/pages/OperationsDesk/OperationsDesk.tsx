import { useEffect } from 'react'

import { DashboardShell } from '@/components/dashboard'
import { IncidentList } from '@/components/incidents'
import { MapContainer } from '@/components/maps'
import { ResourceList } from '@/components/resources'
import { ShelterList } from '@/components/shelters'
import { SidePanel } from '@/components/ui'
import { useIncidents, useResources, useShelters } from '@/hooks'
import { useUiStore } from '@/state'

/** Main operations dashboard: live crisis map with incident/resource panels. */
export function OperationsDesk() {
  const incidents = useIncidents()
  const resources = useResources()
  const shelters = useShelters()

  const setConnection = useUiStore((state) => state.setConnection)
  const leftCollapsed = useUiStore((state) => state.leftPanelCollapsed)
  const rightCollapsed = useUiStore((state) => state.rightPanelCollapsed)
  const toggleLeft = useUiStore((state) => state.toggleLeftPanel)
  const toggleRight = useUiStore((state) => state.toggleRightPanel)

  const anyError = incidents.isError || resources.isError || shelters.isError
  const anyLoading = incidents.isLoading || resources.isLoading || shelters.isLoading

  useEffect(() => {
    if (anyError) setConnection('disconnected')
    else if (anyLoading) setConnection('connecting')
    else setConnection('connected')
  }, [anyError, anyLoading, setConnection])

  return (
    <DashboardShell
      incidentCount={incidents.data?.length ?? 0}
      unitCount={resources.data?.length ?? 0}
      shelterCount={shelters.data?.length ?? 0}
    >
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

        <div className="flex-1">
          <MapContainer />
        </div>

        <SidePanel
          title="Resources & Shelters"
          side="right"
          collapsed={rightCollapsed}
          onToggle={toggleRight}
        >
          <ResourceList units={resources.data ?? []} isLoading={resources.isLoading} />
          <ShelterList shelters={shelters.data ?? []} isLoading={shelters.isLoading} />
        </SidePanel>
      </div>
    </DashboardShell>
  )
}
