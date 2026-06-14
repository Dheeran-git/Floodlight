import { Suspense, lazy } from 'react'

import type { MapData } from './mapMarkers'

// Code-split Mapbox into its own chunk so the app shell loads without it.
const MapContainer = lazy(() =>
  import('./MapContainer').then((m) => ({ default: m.MapContainer })),
)

/** Loading placeholder shown while the Mapbox chunk is fetched. */
function MapLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-900">
      <div className="space-y-2 text-center">
        <p className="animate-pulse text-3xl">🗺️</p>
        <p className="text-sm text-gray-400">Loading crisis map…</p>
      </div>
    </div>
  )
}

interface LazyMapProps {
  data?: MapData
}

/** Suspense-wrapped, lazily loaded crisis map. */
export function LazyMap({ data }: LazyMapProps) {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapContainer data={data} />
    </Suspense>
  )
}
