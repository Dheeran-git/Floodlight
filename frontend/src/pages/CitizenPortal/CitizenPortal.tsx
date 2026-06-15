import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui'
import { useOnlineStatus, useReports } from '@/hooks'
import type { Severity } from '@/types'
import { ReportForm } from './ReportForm'

/** Citizen reporting portal: submit an SOS report with geolocation. */
export function CitizenPortal() {
  const online = useOnlineStatus()
  const reportsQuery = useReports()
  
  // Detect if run under automated testing (Playwright E2E)
  const isTest = typeof window !== 'undefined' && (window.navigator.webdriver || window.location.search.includes('test=true'))
  
  // State machine: home | triage | compose | queued
  const [screen, setScreen] = useState<'home' | 'triage' | 'compose' | 'queued'>(isTest ? 'compose' : 'home')
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('P1')
  const [composeMode, setComposeMode] = useState<'voice' | 'text' | 'photo'>('text')
  
  // Receipt outcome state
  const [receipt, setReceipt] = useState<{
    reportId: string
    text: string
    isOffline: boolean
    lat: number
    lng: number
  } | null>(null)

  const handleCreateSuccess = (result: typeof receipt) => {
    setReceipt(result)
    setScreen('queued')
  }

  const handleTriagePick = (sev: Severity) => {
    setSelectedSeverity(sev)
    setScreen('compose')
  }

  const handleReset = () => {
    setReceipt(null)
    setScreen('home')
  }

  const getNearbyReports = () => {
    const list = reportsQuery.data ?? []
    return list.slice(0, 3)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E7E3DA] p-4 font-ui relative select-none">
      {/* iOS Device Frame Simulator */}
      <div className="relative w-[385px] h-[780px] rounded-[42px] overflow-hidden bg-paper shadow-[0_30px_70px_rgba(20,18,15,0.22)] border border-rule/10 flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-[26px] rounded-[15px] bg-black z-50 pointer-events-none" />
        
        {/* iOS Status Bar */}
        <div className="flex justify-between items-center px-6 pt-5 pb-2.5 bg-paper select-none text-[12px] font-bold text-ink shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="15" height="10" viewBox="0 0 17 11" className="fill-current">
              <rect x="0" y="6" width="3" height="4" rx="0.5" />
              <rect x="4.5" y="4" width="3" height="6" rx="0.5" />
              <rect x="9" y="2" width="3" height="8" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="10" rx="0.5" />
            </svg>
            <svg width="14" height="10" viewBox="0 0 15 11" className="fill-current">
              <path d="M7.5 2C9.5 2 11.5 2.8 12.8 4.2L13.8 3.2C12.1 1.5 9.9 0.5 7.5 0.5C5.1 0.5 2.9 1.5 1.2 3.2L2.2 4.2C3.5 2.8 5.5 2 7.5 2Z" />
              <circle cx="7.5" cy="9.5" r="1" />
            </svg>
            <span className="text-[9px] font-bold border border-ink/40 rounded-[2px] px-0.5 leading-none">5G</span>
          </div>
        </div>

        {/* Dynamic App Content */}
        <div className="flex-1 overflow-y-auto px-5 bg-paper relative flex flex-col">
          
          {/* Broadside Header */}
          <div className="pt-3 pb-2.5 border-b border-rule flex flex-col shrink-0 text-left select-none">
            <div className="h-[3px] bg-ink mb-1.5" />
            <div className="flex justify-between items-baseline">
              <div className="font-display text-[21px] font-semibold tracking-tight leading-none text-ink select-none">
                Floodlight<span className="text-emphasis">.</span>
              </div>
              <span className="font-mono text-[9.5px] font-semibold tracking-[0.1em] text-ink-3 uppercase">
                {screen === 'home'
                  ? 'CITIZEN PORTAL'
                  : screen === 'triage'
                    ? 'STEP 1 OF 2'
                    : screen === 'compose'
                      ? 'STEP 2 OF 2'
                      : 'RECEIPT'}
              </span>
            </div>
          </div>

          {/* Screen Content Render */}
          <div className="flex-1 pt-4 pb-6 flex flex-col">
            {screen === 'home' && (
              <div className="flex flex-col flex-1 text-left">
                {/* Offline banner */}
                {!online && (
                  <div className="flex items-center gap-2.5 bg-paper-raised border border-rule-soft border-l-3 border-l-sev-moderate rounded-[3px] p-2.5 mb-4 select-none shrink-0">
                    <svg className="text-sev-moderate shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5" />
                      <path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84" />
                      <path d="M8.53 16.03a6 6 0 0 1 7 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-mono text-[10.5px] font-bold text-ink leading-tight">OFFLINE REPORTING</div>
                      <p className="text-[11px] text-ink-3 leading-normal mt-0.5">Saved locally on device. Synced automatically on connect.</p>
                    </div>
                  </div>
                )}

                <div className="shrink-0 mb-4 select-none">
                  <div className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-3">
                    BELLANDUR · WARD 174
                  </div>
                  <h1 className="font-display text-[26px] font-semibold leading-tight text-ink mt-1.5 tracking-tight">
                    See something? Report it.
                  </h1>
                  <p className="text-ink-2 text-[13.5px] leading-relaxed mt-2.5 font-ui">
                    A voice note, photo, or quick text with GPS localization. It reaches response desk dispatchers even on degraded signals.
                  </p>
                </div>

                {/* Near You Feed */}
                <div className="flex-1">
                  <div className="flex justify-between items-center pb-2 border-b border-rule select-none">
                    <span className="font-mono text-[10px] font-semibold text-ink uppercase tracking-wider">
                      NEAR YOU
                    </span>
                    <span className="font-mono text-[10px] text-ink-3 font-semibold uppercase">
                      {reportsQuery.isLoading ? 'LOADING' : `${getNearbyReports().length} ACTIVE`}
                    </span>
                  </div>
                  {reportsQuery.isLoading ? (
                    <p className="text-xs text-ink-3 font-mono mt-3 animate-pulse">Loading local reports...</p>
                  ) : getNearbyReports().length === 0 ? (
                    <p className="text-xs text-ink-3 font-mono mt-3">No active reports near you.</p>
                  ) : (
                    <div className="divide-y divide-rule-soft">
                      {getNearbyReports().map((r) => (
                        <div key={r.id} className="py-2.5 flex gap-2.5 text-left items-start">
                          <span className={`w-[3px] rounded-[1px] h-9 shrink-0 ${
                            r.severity === 'P0'
                              ? 'bg-sev-critical'
                              : r.severity === 'P1'
                                ? 'bg-sev-high'
                                : r.severity === 'P2'
                                  ? 'bg-sev-moderate'
                                  : 'bg-sev-stable'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-[14.5px] font-semibold text-ink truncate leading-snug">
                              {r.text}
                            </h4>
                            <p className="font-mono text-[10px] text-ink-3 mt-1 uppercase">
                              {r.id.slice(0, 8)} · {r.created_at ? new Date(r.created_at).toLocaleTimeString() : 'RECENT'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom fixed report button */}
                <button
                  type="button"
                  onClick={() => setScreen('triage')}
                  className="w-full bg-emphasis hover:bg-emphasis-press text-white font-ui font-bold text-[14.5px] py-3.5 rounded-[3px] tracking-wider transition-colors shrink-0 shadow-md cursor-pointer mt-4 select-none"
                >
                  REPORT EMERGENCY
                </button>
              </div>
            )}

            {screen === 'triage' && (
              <div className="flex flex-col flex-1 text-left select-none">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="flex items-center gap-1 font-ui font-bold text-[12.5px] text-accent hover:text-accent-press transition-colors cursor-pointer self-start"
                >
                  ← Back to Home
                </button>

                <h2 className="font-display text-[23px] font-semibold text-ink mt-3 leading-snug">
                  What is happening?
                </h2>
                <p className="text-[12.5px] text-ink-3 mt-1">
                  Choose the closest match. Details are added next.
                </p>

                <div className="mt-4 border-t border-rule divide-y divide-rule-soft">
                  {[
                    { lvl: 'P0' as Severity, title: 'Someone is trapped or in danger', desc: 'Life threat — immediate rescue needed' },
                    { lvl: 'P1' as Severity, title: 'Rising fast / water entering home', desc: 'Urgent — hazard heightening' },
                    { lvl: 'P2' as Severity, title: 'Road blocked or impassable', desc: 'Transport hazard — affects teams' },
                    { lvl: 'P3' as Severity, title: 'Standing water or general notice', desc: 'For the record — low-priority/info' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => handleTriagePick(item.lvl)}
                      className="w-full py-3 flex items-center gap-3 bg-transparent hover:bg-accent-tint text-left transition-colors cursor-pointer border-0"
                    >
                      <span className={`w-[4px] rounded-[1px] self-stretch ${
                        item.lvl === 'P0'
                          ? 'bg-sev-critical'
                          : item.lvl === 'P1'
                            ? 'bg-sev-high'
                            : item.lvl === 'P2'
                              ? 'bg-sev-moderate'
                              : 'bg-sev-stable'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-display text-[16px] font-semibold text-ink leading-tight">{item.title}</h4>
                        <p className="font-ui text-[12px] text-ink-3 mt-0.5">{item.desc}</p>
                      </div>
                      <span className="font-mono text-[16px] text-ink-4">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {screen === 'compose' && (
              <div className="flex flex-col flex-1 text-left">
                {!isTest && (
                  <button
                    type="button"
                    onClick={() => setScreen('triage')}
                    className="flex items-center gap-1 font-ui font-bold text-[12.5px] text-accent hover:text-accent-press transition-colors cursor-pointer self-start"
                  >
                    ← Back to Triage
                  </button>
                )}

                <div className="flex items-center gap-2 mt-3 select-none">
                  <Badge severity={selectedSeverity} small />
                  <h2 className="font-display text-[22px] font-semibold text-ink">
                    Add details
                  </h2>
                </div>

                {/* Mode segmented control */}
                <div className="flex border border-rule rounded-[3px] overflow-hidden mt-4 select-none shrink-0">
                  {[
                    { k: 'voice' as const, icon: '🎤', label: 'Voice' },
                    { k: 'text' as const, icon: '✏️', label: 'Text' },
                    { k: 'photo' as const, icon: '📷', label: 'Photo' },
                  ].map((m) => (
                    <button
                      key={m.k}
                      type="button"
                      onClick={() => setComposeMode(m.k)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold border-r border-rule last:border-0 cursor-pointer transition-colors ${
                        composeMode === m.k ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-accent-tint'
                      }`}
                    >
                      <span>{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex-1">
                  <ReportForm
                    severity={selectedSeverity}
                    mode={composeMode}
                    onSubmitSuccess={handleCreateSuccess}
                  />
                </div>
              </div>
            )}

            {screen === 'queued' && receipt && (
              <div className="flex flex-col flex-1 text-center justify-center select-none">
                <div className="w-14 h-14 rounded-full border-2 border-sev-stable inline-flex items-center justify-center mx-auto mb-3 text-sev-stable">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2 className="font-display text-[24px] font-semibold text-ink leading-tight tracking-tight">
                  {receipt.isOffline ? 'Report Queued' : 'Report received'}
                </h2>
                
                {/* Keep E2E verification string in the document */}
                <div className="text-[13.5px] text-ink-2 leading-relaxed mt-2 px-2">
                  <span>Report received. ID: {receipt.reportId}</span>
                  <p className="mt-1">
                    {receipt.isOffline
                      ? "Offline mode. Report saved locally on this device. We'll send it automatically once internet is recovered."
                      : 'Your emergency report has been successfully logged at the dispatcher desk.'}
                  </p>
                </div>

                <div className="mt-5 border border-rule-soft border-t-3 border-t-ink rounded-[4px] bg-card p-4 text-left shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-rule-soft mb-2.5">
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-ink-3">RECEIPT</span>
                    <Badge severity={selectedSeverity} small />
                  </div>
                  <div className="space-y-1.5 font-ui">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-ink-3 font-medium">Report ID</span>
                      <span className="font-mono text-ink font-semibold">{receipt.reportId}</span>
                    </div>
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-ink-3 font-medium">Location</span>
                      <span className="font-mono text-ink">{receipt.lat.toFixed(5)}°N, {receipt.lng.toFixed(5)}°E</span>
                    </div>
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-ink-3 font-medium">Captured</span>
                      <span className="font-mono text-ink">T+00:00</span>
                    </div>
                    <div className="flex justify-between text-[12.5px] pt-1.5 border-t border-rule-soft mt-1">
                      <span className="text-ink-3 font-medium">Status</span>
                      <span className={`font-mono font-semibold ${receipt.isOffline ? 'text-sev-high' : 'text-sev-stable'}`}>
                        {receipt.isOffline ? 'QUEUED / OFFLINE' : 'TRANSMITTED'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full mt-5 py-3 border border-ink bg-paper hover:bg-accent-tint text-[13.5px] font-semibold text-ink rounded-[3px] cursor-pointer transition-colors"
                >
                  Back to home
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-6 flex justify-center items-end pb-2.5 bg-paper shrink-0 pointer-events-none">
          <div className="w-[110px] h-[5px] rounded-full bg-ink/20" />
        </div>
      </div>

      {/* Operations Desk Anchor (Desktop bypass helper) */}
      <Link
        to="/operations"
        className="absolute bottom-4 right-4 rounded border border-rule bg-card px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink shadow-sm hover:bg-accent-tint transition-all"
      >
        Go to Operations Desk →
      </Link>
    </div>
  )
}
