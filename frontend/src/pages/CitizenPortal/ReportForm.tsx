import { useState } from 'react'
import type { FormEvent } from 'react'

import { useCreateReport } from '@/hooks'
import { useGeolocation } from './useGeolocation'

/** Parse a coordinate text input into a number or null. */
function parseCoord(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const INPUT_CLASS =
  'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm ' +
  'text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:outline-none'

/** Citizen SOS report form with geolocation capture and manual fallback. */
export function ReportForm() {
  const [text, setText] = useState('')
  const geo = useGeolocation()
  const mutation = useCreateReport()

  const lat = geo.latitude
  const lng = geo.longitude
  const canSubmit =
    text.trim() !== '' && lat !== null && lng !== null && !mutation.isPending

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (lat === null || lng === null) return
    mutation.mutate({ text: text.trim(), latitude: lat, longitude: lng })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-gray-400">
          What is happening?
        </label>
        <textarea
          className={`${INPUT_CLASS} h-28 resize-none`}
          placeholder="Describe the flooding, hazard, or rescue request…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={geo.locate}
          disabled={geo.loading}
          className="w-full rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
        >
          {geo.loading ? 'Locating…' : 'Use my location'}
        </button>
        {geo.error && <p className="text-xs text-red-400">{geo.error}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input
            className={INPUT_CLASS}
            type="number"
            step="any"
            placeholder="Latitude"
            value={lat ?? ''}
            onChange={(e) => geo.setCoords(parseCoord(e.target.value), lng)}
          />
          <input
            className={INPUT_CLASS}
            type="number"
            step="any"
            placeholder="Longitude"
            value={lng ?? ''}
            onChange={(e) => geo.setCoords(lat, parseCoord(e.target.value))}
          />
        </div>
        {lat !== null && lng !== null && (
          <p className="text-xs text-gray-500">
            Captured: {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit report'}
      </button>

      {mutation.isSuccess && (
        <p className="rounded border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-300">
          Report received. ID: {mutation.data.report_id}
        </p>
      )}
      {mutation.isError && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {(mutation.error as Error).message || 'Submission failed.'}
        </p>
      )}
    </form>
  )
}
