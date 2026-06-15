import { useMutation } from '@tanstack/react-query'

import { api } from '@/services/api/client'

/** Mutation hook for asking the command intelligence assistant a question. */
export function useCommandQuery() {
  return useMutation({
    mutationFn: (query: string) => api.command.query(query),
  })
}
