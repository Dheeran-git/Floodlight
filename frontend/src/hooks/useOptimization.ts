import { useMutation } from '@tanstack/react-query'

import { api } from '@/services/api/client'

/** Shape of an optimization run result (partial — deployment plan only). */
export interface OptimizationResult {
  deployment_plan?: unknown[]
  [key: string]: unknown
}

/** Run the resource optimizer and fetch its result in one mutation. */
export function useOptimization() {
  return useMutation({
    mutationFn: async (): Promise<OptimizationResult> => {
      const { run_id } = await api.optimization.run()
      return (await api.optimization.getResult(run_id)) as OptimizationResult
    },
  })
}
