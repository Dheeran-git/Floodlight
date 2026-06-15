import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api/client'
import type { Shelter, ShelterRisk } from '@/types'

/** Fetch the list of shelters from the backend. */
export function useShelters() {
  return useQuery({
    queryKey: ['shelters'],
    queryFn: () => api.shelters.list() as Promise<Shelter[]>,
  })
}

/** Fetch shelter overflow risk predictions from the backend. */
export function useShelterRisks() {
  return useQuery({
    queryKey: ['shelters', 'risk'],
    queryFn: () => api.shelters.risks() as Promise<ShelterRisk[]>,
  })
}
