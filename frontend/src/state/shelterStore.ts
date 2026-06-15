import { create } from 'zustand'

import type { Shelter } from '@/types'

interface ShelterStore {
  shelters: Shelter[]
  setShelters: (shelters: Shelter[]) => void
}

/** Store for shelter capacity and risk data. */
export const useShelterStore = create<ShelterStore>((set) => ({
  shelters: [],
  setShelters: (shelters) => set({ shelters }),
}))
