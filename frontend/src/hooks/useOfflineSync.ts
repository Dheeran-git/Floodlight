import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  countQueuedReports,
  enqueueReport,
  flushQueue,
} from '@/services/offline/reportQueue'
import type { QueuedReportInput } from '@/services/offline/reportQueue'

/** Public surface for offline-aware report syncing. */
export interface OfflineSync {
  queuedCount: number
  enqueue: (input: QueuedReportInput) => Promise<void>
  flush: () => Promise<void>
}

/**
 * Manage the offline report queue: expose the pending count, enqueue
 * reports, and flush them on reconnect and on mount.
 *
 * Keeps React components thin — the durable storage and POST logic live
 * in the reportQueue module; this hook wires it to the app lifecycle.
 */
export function useOfflineSync(): OfflineSync {
  const queryClient = useQueryClient()
  const [queuedCount, setQueuedCount] = useState(0)

  const refreshCount = useCallback(async () => {
    setQueuedCount(await countQueuedReports())
  }, [])

  const flush = useCallback(async () => {
    const result = await flushQueue()
    if (result.flushed > 0) {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
    setQueuedCount(result.remaining)
  }, [queryClient])

  const enqueue = useCallback(
    async (input: QueuedReportInput) => {
      await enqueueReport(input)
      await refreshCount()
    },
    [refreshCount],
  )

  useEffect(() => {
    void flush()
    const onOnline = () => void flush()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [flush])

  return { queuedCount, enqueue, flush }
}
