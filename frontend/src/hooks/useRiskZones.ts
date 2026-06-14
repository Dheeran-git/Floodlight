import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api/client'
import type { RiskZone } from '@/types'

/** Fetch forecasted risk zones for the crisis map's risk layer. */
export function useRiskZones() {
  return useQuery({
    queryKey: ['prediction', 'risk'],
    queryFn: () => api.prediction.risk() as Promise<RiskZone[]>,
  })
}
