/**
 * WebSocket client for real-time operational events.
 *
 * Connects to the backend event feed (`/api/v1/ws`), parses incoming JSON
 * events, and reconnects with exponential backoff if the socket drops. The
 * connection survives until the returned handle's `close()` is called.
 */

/** An operational event pushed from the backend. */
export interface FloodlightEvent {
  type: string
  data: Record<string, unknown>
  timestamp: string
}

/** Handle for an open event-feed connection. */
export interface EventFeed {
  close: () => void
}

const MAX_BACKOFF_MS = 15_000

/**
 * Build the ws(s):// URL for the event feed.
 *
 * In production VITE_API_URL points at the backend on a different origin
 * (e.g. Render), so the socket is derived from it. With no/relative
 * VITE_API_URL (dev), it falls back to the current origin, which Vite proxies.
 */
export function eventFeedUrl(): string {
  const apiBase = import.meta.env.VITE_API_URL
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    const url = new URL(apiBase)
    const protocol = url.protocol === 'https:' ? 'wss' : 'ws'
    const path = url.pathname.replace(/\/$/, '')
    return `${protocol}://${url.host}${path}/ws`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/api/v1/ws`
}

/**
 * Open the event feed.
 *
 * @param onEvent  Called for each parsed event.
 * @param onStatus Called with the live connection state (true = connected).
 * @returns A handle whose `close()` stops reconnection and closes the socket.
 */
export function connectEventFeed(
  onEvent: (event: FloodlightEvent) => void,
  onStatus?: (connected: boolean) => void,
): EventFeed {
  let socket: WebSocket | null = null
  let stopped = false
  let attempt = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const open = () => {
    socket = new WebSocket(eventFeedUrl())
    socket.onopen = () => {
      attempt = 0
      onStatus?.(true)
    }
    socket.onmessage = (message) => {
      try {
        onEvent(JSON.parse(message.data) as FloodlightEvent)
      } catch {
        // Ignore malformed frames rather than tearing down the feed.
      }
    }
    socket.onerror = () => socket?.close()
    socket.onclose = () => {
      onStatus?.(false)
      if (!stopped) scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS)
    attempt += 1
    timer = setTimeout(open, delay)
  }

  open()

  return {
    close: () => {
      stopped = true
      if (timer) clearTimeout(timer)
      socket?.close()
    },
  }
}

/** Query keys to refetch when a given event type arrives. */
export const EVENT_QUERY_KEYS: Record<string, ReadonlyArray<readonly string[]>> = {
  report_created: [['reports']],
  incident_created: [['incidents'], ['reports'], ['prediction', 'risk']],
  incident_updated: [['incidents'], ['reports'], ['prediction', 'risk']],
  resource_assigned: [['resources']],
  optimization_complete: [['incidents'], ['resources']],
}
