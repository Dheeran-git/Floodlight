import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  countQueuedReports,
  enqueueReport,
  flushQueue,
  getQueuedReports,
} from '../reportQueue'
import { api } from '@/services/api/client'

vi.mock('@/services/api/client', () => ({
  api: {
    reports: {
      create: vi.fn(),
    },
  },
}))

const mockedCreate = vi.mocked(api.reports.create)

/** Wipe the IndexedDB database between tests for isolation. */
function deleteDb(): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase('floodlight-offline')
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })
}

beforeEach(async () => {
  await deleteDb()
  mockedCreate.mockReset()
})

afterEach(async () => {
  await deleteDb()
})

describe('reportQueue', () => {
  it('enqueues a report and reads it back', async () => {
    await enqueueReport({ text: 'help', latitude: 1, longitude: 2 })
    const queued = await getQueuedReports()
    expect(queued).toHaveLength(1)
    expect(queued[0]).toMatchObject({ text: 'help', latitude: 1, longitude: 2 })
    expect(typeof queued[0].queuedAt).toBe('number')
  })

  it('counts queued reports', async () => {
    await enqueueReport({ text: 'a', latitude: 0, longitude: 0 })
    await enqueueReport({ text: 'b', latitude: 0, longitude: 0 })
    expect(await countQueuedReports()).toBe(2)
  })

  it('returns reports oldest first', async () => {
    await enqueueReport({ text: 'first', latitude: 0, longitude: 0 })
    await enqueueReport({ text: 'second', latitude: 0, longitude: 0 })
    const queued = await getQueuedReports()
    expect(queued.map((r) => r.text)).toEqual(['first', 'second'])
  })

  it('drains the queue when the API succeeds', async () => {
    mockedCreate.mockResolvedValue({ success: true, report_id: 'x' })
    await enqueueReport({ text: 'a', latitude: 0, longitude: 0 })
    await enqueueReport({ text: 'b', latitude: 0, longitude: 0 })

    const result = await flushQueue()

    expect(mockedCreate).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ flushed: 2, remaining: 0 })
    expect(await countQueuedReports()).toBe(0)
  })

  it('persists the queue and stops early when the API fails', async () => {
    mockedCreate.mockRejectedValue(new Error('offline'))
    await enqueueReport({ text: 'a', latitude: 0, longitude: 0 })
    await enqueueReport({ text: 'b', latitude: 0, longitude: 0 })

    const result = await flushQueue()

    expect(mockedCreate).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ flushed: 0, remaining: 2 })
    expect(await countQueuedReports()).toBe(2)
  })

  it('flushes the first then stops if a later send fails', async () => {
    mockedCreate
      .mockResolvedValueOnce({ success: true, report_id: 'x' })
      .mockRejectedValueOnce(new Error('offline'))
    await enqueueReport({ text: 'a', latitude: 0, longitude: 0 })
    await enqueueReport({ text: 'b', latitude: 0, longitude: 0 })

    const result = await flushQueue()

    expect(result).toEqual({ flushed: 1, remaining: 1 })
    const remaining = await getQueuedReports()
    expect(remaining.map((r) => r.text)).toEqual(['b'])
  })

  it('flush on an empty queue is a no-op', async () => {
    const result = await flushQueue()
    expect(result).toEqual({ flushed: 0, remaining: 0 })
    expect(mockedCreate).not.toHaveBeenCalled()
  })
})
