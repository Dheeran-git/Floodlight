import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  EVENT_QUERY_KEYS,
  connectEventFeed,
  eventFeedUrl,
} from '../index'
import type { FloodlightEvent } from '../index'

/** Minimal fake WebSocket capturing handlers and the constructed URL. */
class FakeWebSocket {
  static last: FakeWebSocket | null = null
  url: string
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null
  closed = false

  constructor(url: string) {
    this.url = url
    FakeWebSocket.last = this
  }

  close() {
    this.closed = true
    this.onclose?.()
  }
}

beforeEach(() => {
  FakeWebSocket.last = null
  vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('connectEventFeed', () => {
  it('connects to the /api/v1/ws feed on the current origin', () => {
    connectEventFeed(() => {})
    expect(FakeWebSocket.last?.url).toContain('/api/v1/ws')
    expect(eventFeedUrl()).toMatch(/^wss?:\/\/.+\/api\/v1\/ws$/)
  })

  it('parses JSON frames and forwards them to onEvent', () => {
    const received: FloodlightEvent[] = []
    connectEventFeed((e) => received.push(e))
    const event = { type: 'report_created', data: { report_id: 'r1' }, timestamp: 't' }
    FakeWebSocket.last?.onmessage?.({ data: JSON.stringify(event) })
    expect(received).toEqual([event])
  })

  it('ignores malformed frames without throwing', () => {
    const received: FloodlightEvent[] = []
    connectEventFeed((e) => received.push(e))
    expect(() =>
      FakeWebSocket.last?.onmessage?.({ data: 'not json' }),
    ).not.toThrow()
    expect(received).toHaveLength(0)
  })

  it('reports connection status on open and close', () => {
    const statuses: boolean[] = []
    const feed = connectEventFeed(() => {}, (c) => statuses.push(c))
    FakeWebSocket.last?.onopen?.()
    feed.close()
    expect(statuses[0]).toBe(true)
    expect(statuses[statuses.length - 1]).toBe(false)
  })

  it('does not reconnect after close() is called', () => {
    vi.useFakeTimers()
    const feed = connectEventFeed(() => {})
    const first = FakeWebSocket.last
    feed.close()
    vi.advanceTimersByTime(60_000)
    expect(FakeWebSocket.last).toBe(first) // no new socket created
    vi.useRealTimers()
  })

  it('maps event types to the query keys to refetch', () => {
    expect(EVENT_QUERY_KEYS.report_created).toContainEqual(['reports'])
    expect(EVENT_QUERY_KEYS.incident_updated).toContainEqual(['incidents'])
    expect(EVENT_QUERY_KEYS.resource_assigned).toContainEqual(['resources'])
  })
})
