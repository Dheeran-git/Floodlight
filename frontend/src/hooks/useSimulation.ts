import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/services/api/client'

/** Result of a simulation run. */
export interface SimulationResult {
  success: boolean
  scenario: string
  reports_created: number
  report_ids: string[]
}

/**
 * Trigger the heavy-rain simulation scenario.
 *
 * On success, invalidate the report and incident queries so the map and
 * panels reflect the injected data.
 */
export function useSimulation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (): Promise<SimulationResult> => api.simulation.run(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}
