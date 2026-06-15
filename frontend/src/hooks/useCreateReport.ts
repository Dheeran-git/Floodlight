import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/services/api/client'

/** Payload for creating a citizen report. */
export interface CreateReportInput {
  text: string
  latitude: number
  longitude: number
}

/** Mutation hook for submitting a citizen SOS report. */
export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReportInput) => api.reports.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
