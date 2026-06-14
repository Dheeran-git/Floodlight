import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api/client'
import type { RescueUnit } from '@/types'

/** Fetch the list of rescue units from the backend. */
export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => api.resources.list() as Promise<RescueUnit[]>,
  })
}
