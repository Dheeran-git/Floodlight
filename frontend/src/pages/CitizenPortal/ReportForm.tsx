/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

import type { Severity } from '@/types'
import { useCreateReport, useOfflineSync, useOnlineStatus } from '@/hooks'
import { useGeolocation } from './useGeolocation'

interface ReportFormProps {
  severity: Severity
  mode: 'voice' | 'text' | 'photo'
  onSubmitSuccess: (result: { reportId: string; text: string; isOffline: boolean; lat: number; lng: number }) => void
}

/** Form compose screen inside the Citizen Portal PWA flow. */
export function ReportForm({ severity, mode, onSubmitSuccess }: ReportFormProps) {
  const [text, setText] = useState('')
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [voiceSeconds, setVoiceSeconds] = useState(0)
  const [hasVoiceAttached, setHasVoiceAttached] = useState(false)
  const [hasPhotoAttached, setHasPhotoAttached] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const geo = useGeolocation()
  const createMutation = useCreateReport()
  const online = useOnlineStatus()
  const { enqueue } = useOfflineSync()

  const lat = geo.latitude
  const lng = geo.longitude

  // Auto-simulate default texts for voice & photo to ensure coordinate capture logic holds
  useEffect(() => {
    if (mode === 'text') {
      setText('')
    } else if (mode === 'voice') {
      setText(hasVoiceAttached ? '[Voice Memo Transcribed] Family trapped on ground floor, water is waist-high' : '')
    } else if (mode === 'photo') {
      setText(hasPhotoAttached ? '[Image attached] Inundated residential street view, height approx 3.5 ft' : '')
    }
  }, [mode, hasVoiceAttached, hasPhotoAttached])

  // Timer simulation for voice recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (voiceRecording) {
      interval = setInterval(() => {
        setVoiceSeconds((prev) => {
          if (prev >= 8) {
            setVoiceRecording(false)
            setHasVoiceAttached(true)
            return 8
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setVoiceSeconds(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [voiceRecording])

  const canSubmit =
    text.trim() !== '' && lat !== null && lng !== null && !submitting

  const handleStartRecord = () => {
    setVoiceSeconds(0)
    setVoiceRecording(true)
    setHasVoiceAttached(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (lat === null || lng === null) return

    const reportText = text.trim()
    const payload = { text: reportText, latitude: lat, longitude: lng, severity }

    setSubmitting(true)
    setErrorMessage(null)

    if (!online) {
      try {
        await enqueue(payload)
        onSubmitSuccess({
          reportId: `LOCAL-${Math.floor(Math.random() * 9000 + 1000)}`,
          text: reportText,
          isOffline: true,
          lat,
          lng,
        })
      } catch {
        setErrorMessage('Could not queue the report. Storage is full.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    try {
      const result = await createMutation.mutateAsync(payload)
      onSubmitSuccess({
        reportId: result.report_id,
        text: reportText,
        isOffline: false,
        lat,
        lng,
      })
    } catch {
      // Offline fallback if network call fails
      try {
        await enqueue(payload)
        onSubmitSuccess({
          reportId: `LOCAL-${Math.floor(Math.random() * 9000 + 1000)}`,
          text: reportText,
          isOffline: true,
          lat,
          lng,
        })
      } catch {
        setErrorMessage('Failed to submit report. Please check connections.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Dynamic input mode content */}
      <div className="bg-card border border-rule-soft rounded-[4px] p-4 min-h-[160px] flex flex-col justify-center select-none text-left">
        {mode === 'text' && (
          <div className="flex-1 flex flex-col">
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">
              REPORT DETAILS
            </label>
            <textarea
              className="w-full flex-1 resize-none bg-transparent outline-none text-ink text-[14.5px] font-ui leading-relaxed placeholder-ink-4 min-h-[110px]"
              placeholder="Describe the flooding, hazard, or rescue request…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}

        {mode === 'voice' && (
          <div className="text-center py-2">
            <button
              type="button"
              onClick={voiceRecording ? undefined : handleStartRecord}
              className={`w-[72px] h-[72px] rounded-full border-2 inline-flex items-center justify-center transition-all cursor-pointer ${
                voiceRecording
                  ? 'border-emphasis bg-emphasis/5 animate-pulse'
                  : 'border-ink bg-paper hover:bg-accent-tint'
              }`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className={voiceRecording ? 'text-emphasis' : 'text-ink'}
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
            <div
              className={`font-mono text-[11px] font-semibold tracking-wide uppercase mt-3 ${
                voiceRecording ? 'text-emphasis' : 'text-ink-3'
              }`}
            >
              {voiceRecording
                ? `● RECORDING — 0:0${voiceSeconds}`
                : hasVoiceAttached
                  ? 'VOICE NOTE ATTACHED · 0:08'
                  : 'TAP TO RECORD MEMO'}
            </div>
            <p className="text-[12px] text-ink-3 mt-1.5 font-ui">
              Speak in any language. Transcriptions render instantly.
            </p>
          </div>
        )}

        {mode === 'photo' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setHasPhotoAttached(true)}
              className="w-full h-[120px] border border-dashed border-ink-4 hover:border-accent hover:bg-accent-tint rounded-[3px] flex flex-col items-center justify-center gap-2 text-ink-3 transition-colors cursor-pointer"
            >
              {hasPhotoAttached ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-sev-stable">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink">
                    PHOTO MOUNTED SUCCESSFULLY
                  </span>
                </>
              ) : (
                <>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="font-ui text-[13px]">Tap to mount documentary photo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Geolocation Section */}
      <div className="flex flex-col gap-2.5 p-4 border border-rule-soft rounded-[3px] bg-paper-raised text-left select-none">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-accent shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-ui text-[13px] font-semibold text-ink leading-tight">GPS Localization</p>
            {lat !== null && lng !== null ? (
              <p className="font-mono text-[11px] text-ink-3 mt-0.5">
                {lat.toFixed(5)}°N, {lng.toFixed(5)}°E · ±8 m
              </p>
            ) : (
              <p className="font-ui text-[12px] text-ink-3 mt-0.5">No coordinates locked.</p>
            )}
          </div>
          <button
            type="button"
            onClick={geo.locate}
            disabled={geo.loading}
            className="rounded-[3px] border border-rule-soft bg-paper hover:bg-accent-tint text-[11px] font-mono font-semibold uppercase tracking-wider text-ink px-2.5 py-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            {geo.loading ? 'Locating…' : 'Locate'}
          </button>
        </div>

        {geo.error && <p className="text-[11px] font-mono text-sev-critical">{geo.error}</p>}

        {/* Manual inputs fallback */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <input
            className="w-full rounded-[3px] border border-rule-soft bg-card px-2.5 py-1.5 font-mono text-[12px] text-ink placeholder-ink-4 focus:border-accent focus:outline-none"
            type="number"
            step="any"
            placeholder="Latitude"
            value={lat ?? ''}
            onChange={(e) => {
              const parsed = e.target.value === '' ? null : Number(e.target.value)
              geo.setCoords(parsed, lng)
            }}
          />
          <input
            className="w-full rounded-[3px] border border-rule-soft bg-card px-2.5 py-1.5 font-mono text-[12px] text-ink placeholder-ink-4 focus:border-accent focus:outline-none"
            type="number"
            step="any"
            placeholder="Longitude"
            value={lng ?? ''}
            onChange={(e) => {
              const parsed = e.target.value === '' ? null : Number(e.target.value)
              geo.setCoords(lat, parsed)
            }}
          />
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 bg-emphasis hover:bg-emphasis-press text-white border-0 rounded-[3px] font-ui font-bold text-[14.5px] tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {submitting ? 'SUBMITTING...' : online ? 'Submit report' : 'Queue report (offline)'}
      </button>

      {errorMessage && (
        <p className="rounded-[3px] border border-sev-critical/30 bg-emphasis-tint px-3 py-2 text-xs text-sev-critical font-ui select-none text-left">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
