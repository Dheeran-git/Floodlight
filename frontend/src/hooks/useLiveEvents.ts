import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  EVENT_QUERY_KEYS,
  connectEventFeed,
} from '@/services/websocket'

/**
 * Subscribe to the backend event feed and refresh affected data live.
 *
 * On each operational event (report_created, incident_*, resource_assigned,
 * optimization_complete) the matching React Query caches are invalidated, so
 * the map and panels update in real time without polling. The connection is
 * torn down on unmount.
 */
export function useLiveEvents(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const feed = connectEventFeed((event) => {
      const keys = EVENT_QUERY_KEYS[event.type] ?? []
      for (const queryKey of keys) {
        queryClient.invalidateQueries({ queryKey: [...queryKey] })
      }
    })
    return () => feed.close()
  }, [queryClient])
}
