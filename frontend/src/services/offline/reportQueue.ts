/**
 * IndexedDB-backed queue for citizen reports submitted while offline.
 *
 * Stores pending reports durably so they survive reloads, then flushes
 * them to the backend when connectivity returns. Uses the native
 * IndexedDB API — no extra dependencies.
 */

import { api } from '@/services/api/client'

/** A report awaiting submission. */
export interface QueuedReport {
  id?: number
  text: string
  latitude: number
  longitude: number
  queuedAt: number
}

/** Payload portion of a queued report (without queue metadata). */
export type QueuedReportInput = Pick<
  QueuedReport,
  'text' | 'latitude' | 'longitude'
>

const DB_NAME = 'floodlight-offline'
const DB_VERSION = 1
const STORE = 'pending-reports'

/** Open (and lazily create) the IndexedDB database. */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Promisify an IDBRequest. */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Add a report to the offline queue. */
export async function enqueueReport(input: QueuedReportInput): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    const entry: QueuedReport = { ...input, queuedAt: Date.now() }
    tx.objectStore(STORE).add(entry)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

/** List all queued reports, oldest first. */
export async function getQueuedReports(): Promise<QueuedReport[]> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const all = await promisifyRequest(tx.objectStore(STORE).getAll())
    return (all as QueuedReport[]).sort((a, b) => a.queuedAt - b.queuedAt)
  } finally {
    db.close()
  }
}

/** Count queued reports. */
export async function countQueuedReports(): Promise<number> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readonly')
    return await promisifyRequest(tx.objectStore(STORE).count())
  } finally {
    db.close()
  }
}

/** Remove a queued report by its auto-increment id. */
async function removeReport(id: number): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

/** Outcome of a queue flush. */
export interface FlushResult {
  flushed: number
  remaining: number
}

/**
 * Attempt to POST every queued report, removing each on success.
 *
 * Stops early on the first failure (likely still offline) and reports
 * how many were sent and how many remain.
 */
export async function flushQueue(): Promise<FlushResult> {
  const pending = await getQueuedReports()
  let flushed = 0
  for (const report of pending) {
    try {
      await api.reports.create({
        text: report.text,
        latitude: report.latitude,
        longitude: report.longitude,
      })
      if (report.id !== undefined) await removeReport(report.id)
      flushed += 1
    } catch {
      break
    }
  }
  const remaining = await countQueuedReports()
  return { flushed, remaining }
}
