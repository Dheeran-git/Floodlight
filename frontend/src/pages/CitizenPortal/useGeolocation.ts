import { useState } from 'react'

/** Captured coordinates plus geolocation request state. */
export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

const INITIAL: GeolocationState = {
  latitude: null,
  longitude: null,
  error: null,
  loading: false,
}

/** Wraps the browser Geolocation API with loading/error state. */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(INITIAL)

  function locate() {
    if (!('geolocation' in navigator)) {
      setState({ ...INITIAL, error: 'Geolocation is not supported.' })
      return
    }
    setState({ ...INITIAL, loading: true })
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          error: null,
          loading: false,
        }),
      (err) => setState({ ...INITIAL, error: err.message || 'Location denied.' }),
    )
  }

  function setCoords(latitude: number | null, longitude: number | null) {
    setState((prev) => ({ ...prev, latitude, longitude, error: null }))
  }

  return { ...state, locate, setCoords }
}
