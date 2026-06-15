import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { renderMarkers } from './mapMarkers'
import type { MapData } from './mapMarkers'

/** Bengaluru city center as [longitude, latitude]. */
const BENGALURU_CENTER: [number, number] = [77.59, 12.97]
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'
const MAP_ZOOM = 11

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const EMPTY_DATA: MapData = { reports: [], incidents: [], units: [], shelters: [] }

/** Placeholder shown when no Mapbox token is configured. */
function MapPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-900 text-center">
      <div className="space-y-2">
        <p className="text-3xl">🗺️</p>
        <p className="text-sm text-gray-300">Crisis map unavailable</p>
        <p className="text-xs text-gray-500">
          Set <code className="text-amber-400">VITE_MAPBOX_TOKEN</code> to enable
          the live map.
        </p>
      </div>
    </div>
  )
}

interface MapContainerProps {
  data?: MapData
}

/** Mapbox GL map centered on Bengaluru with live data-layer markers. */
export function MapContainer({ data = EMPTY_DATA }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: BENGALURU_CENTER,
      zoom: MAP_ZOOM,
    })
    mapRef.current = map
    map.on('load', () => setReady(true))

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    // Markers are recreated whenever data changes; the cleanup removes the
    // previous set before the next run and on unmount (no leaked DOM/popups).
    const markers = renderMarkers(map, data)
    return () => markers.forEach((m) => m.remove())
  }, [data, ready])

  if (!MAPBOX_TOKEN) return <MapPlaceholder />

  return <div ref={containerRef} className="h-full w-full" />
}
