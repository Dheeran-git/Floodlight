import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '@/components/ui'
import { useCommandQuery } from '@/hooks'

const EXAMPLES = [
  'Which area is highest risk?',
  'Which shelter will overflow?',
  'Which rescue team is overloaded?',
]

/** Operational Q&A panel styled as an editorial QueryDesk. */
export function CommandPanel() {
  const [query, setQuery] = useState('')
  const mutation = useCommandQuery()

  function submit(value: string) {
    const trimmed = value.trim()
    if (trimmed === '' || mutation.isPending) return
    mutation.mutate(trimmed)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit(query)
  }

  function handleExample(example: string) {
    setQuery(example)
    submit(example)
  }

  return (
    <Card title="Command Intelligence" kicker="AI QUERY DESK">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-card border border-rule-soft focus-within:border-accent rounded-[3px] px-3 py-2 transition-colors">
          <span className="font-mono text-[11px] font-semibold text-ink-3 uppercase select-none shrink-0">
            QUERY —
          </span>
          <input
            className="flex-1 bg-transparent border-0 outline-none text-ink text-[14.5px] placeholder-ink-4 font-ui font-medium min-w-0"
            placeholder="Ask an operational question…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={mutation.isPending || query.trim() === ''}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border-0 bg-accent text-white hover:bg-accent-press disabled:opacity-40 cursor-pointer transition-colors"
          >
            <span className="sr-only">
              {mutation.isPending ? 'Thinking…' : 'Ask'}
            </span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExample(example)}
            disabled={mutation.isPending}
            className="rounded-[3px] border border-rule-soft bg-paper hover:bg-accent-tint text-[11px] font-ui text-ink-2 px-2.5 py-1 transition-colors cursor-pointer disabled:opacity-40"
          >
            {example}
          </button>
        ))}
      </div>

      {mutation.isPending && (
        <p className="mt-3 text-[12px] text-ink-3 font-mono animate-pulse">
          Querying command model…
        </p>
      )}

      {mutation.isError && (
        <p className="mt-3 rounded-[3px] border border-sev-critical/30 bg-emphasis-tint px-3 py-2 text-xs text-sev-critical font-ui">
          {(mutation.error as Error).message || 'Query failed.'}
        </p>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 border-l-3 border-emphasis pl-3.5 select-text">
          <div className="font-display text-[15.5px] font-medium leading-relaxed text-ink">
            {mutation.data.answer}
          </div>
          <div className="font-mono text-[10px] text-ink-3 tracking-wide mt-2 uppercase">
            MODEL FEED · SYNCHRONIZED
          </div>
        </div>
      )}
    </Card>
  )
}
