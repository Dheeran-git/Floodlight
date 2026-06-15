import { create } from 'zustand'

import type { Incident } from '@/types'

interface IncidentStore {
  incidents: Incident[]
  selectedIncidentId: string | null
  setIncidents: (incidents: Incident[]) => void
  selectIncident: (id: string | null) => void
}

/** Store for the incident list and the currently selected incident. */
export const useIncidentStore = create<IncidentStore>((set) => ({
  incidents: [],
  selectedIncidentId: null,
  setIncidents: (incidents) => set({ incidents }),
  selectIncident: (id) => set({ selectedIncidentId: id }),
}))
