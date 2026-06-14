import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api/client'
import type { Incident } from '@/types'

/** Fetch the list of active incidents from the backend. */
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.incidents.list() as Promise<Incident[]>,
  })
}
