import { useQuery } from '@tanstack/react-query'

import { api } from '@/services/api/client'
import type { Report } from '@/types'

/** Fetch the list of citizen SOS reports from the backend. */
export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => api.reports.list() as Promise<Report[]>,
  })
}
