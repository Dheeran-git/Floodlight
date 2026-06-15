import { create } from 'zustand'

import type { RescueUnit } from '@/types'

interface ResourceStore {
  units: RescueUnit[]
  setUnits: (units: RescueUnit[]) => void
}

/** Store for rescue units available to the operations desk. */
export const useResourceStore = create<ResourceStore>((set) => ({
  units: [],
  setUnits: (units) => set({ units }),
}))
