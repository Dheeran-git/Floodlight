/*
 * Floodlight service worker.
 *
 * - App shell is cached on install for offline load.
 * - Static GET requests: cache-first, falling back to network (and caching
 *   the fetched response for next time).
 * - API requests (/api): network-only passthrough — never cached, so the
 *   operator dashboard never shows stale data from the SW layer.
 */

const CACHE_VERSION = 'floodlight-v2'
const APP_SHELL = ['/', '/index.html', '/favicon.svg', '/icons.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  // Never cache API traffic — always go to the network.
  if (url.pathname.startsWith('/api')) {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match('/index.html'))
    }),
  )
})
