import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { renderMarkers } from './mapMarkers'
import type { MapData } from './mapMarkers'

/** Bengaluru city center as [longitude, latitude]. */
const BENGALURU_CENTER: [number, number] = [77.59, 12.97]
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const MAP_ZOOM = 11

const EMPTY_DATA: MapData = { reports: [], incidents: [], units: [], shelters: [] }

interface MapContainerProps {
  data?: MapData
}

/** MapLibre GL map centered on Bengaluru with live data-layer markers. */
export function MapContainer({ data = EMPTY_DATA }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
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

  return <div ref={containerRef} className="h-full w-full paper-map" />
}
