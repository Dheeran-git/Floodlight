import { useEffect, useState } from 'react'

import { useUiStore } from '@/state'

/** Broadsheet Masthead top header with brand and dynamic edition meta. */
export function Header() {
  const connection = useUiStore((state) => state.connection)
  const [dateline, setDateline] = useState('')

  // Generate dynamic editorial dateline matching Bengaluru timezone
  useEffect(() => {
    const updateDateline = () => {
      const date = new Date()
      const day = date.getDate()
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
      ]
      const month = months[date.getMonth()]
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setDateline(`BENGALURU — ${day} ${month} · ${hours}:${minutes} IST · ED. 1.0`)
    }
    updateDateline()
    const interval = setInterval(updateDateline, 60000)
    return () => clearInterval(interval)
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    if (isDark) {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }

  return (
    <header className="relative z-10 flex flex-col border-b border-rule bg-paper">
      {/* 3px solid top rule (masthead device) */}
      <div className="h-[3px] bg-ink" />
      <div className="flex flex-row items-end justify-between px-6 py-3">
        <div className="flex items-baseline gap-4">
          <div className="font-display text-[27px] font-semibold tracking-tight leading-none text-ink select-none">
            Floodlight<span className="text-emphasis">.</span>
          </div>
          <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-ink-3 uppercase hidden sm:inline">
            RESPONDER COMMAND DESK
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11.5px] tracking-wide text-ink-2 select-none hidden md:inline">
            {dateline}
          </span>
          <span className="h-4 w-[1px] bg-rule-soft hidden md:inline" />
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wide ${
              connection === 'connected'
                ? 'text-sev-stable'
                : connection === 'connecting'
                  ? 'text-sev-high animate-pulse'
                  : 'text-sev-critical'
            }`}
          >
            <span
              className={`h-[7px] w-[7px] rounded-full ${
                connection === 'connected'
                  ? 'bg-sev-stable'
                  : connection === 'connecting'
                    ? 'bg-sev-high'
                    : 'bg-sev-critical'
              }`}
            />
            {connection === 'connected'
              ? 'SYNC OK'
              : connection === 'connecting'
                ? 'SYNCING'
                : 'OFFLINE'}
          </span>
          <span className="h-4 w-[1px] bg-rule-soft" />
          <button
            type="button"
            onClick={toggleDarkMode}
            title="Toggle dim projection mode"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] border border-rule-soft bg-paper hover:bg-accent-tint text-ink-2 cursor-pointer transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
