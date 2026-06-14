import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '@/components/ui'
import { useCommandQuery } from '@/hooks'

const EXAMPLES = [
  'Which area is highest risk?',
  'Which shelter will overflow?',
  'Which rescue team is overloaded?',
]

/** Operational Q&A panel wired to the command intelligence endpoint. */
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
    <Card title="Command Intelligence">
      <form className="space-y-2" onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
          placeholder="Ask an operational question…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={mutation.isPending || query.trim() === ''}
          className="w-full rounded bg-amber-500 px-3 py-1.5 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mutation.isPending ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExample(example)}
            disabled={mutation.isPending}
            className="rounded border border-gray-700 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-800 disabled:opacity-40"
          >
            {example}
          </button>
        ))}
      </div>

      {mutation.isError && (
        <p className="mt-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {(mutation.error as Error).message || 'Query failed.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="mt-3 whitespace-pre-wrap rounded border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs text-gray-200">
          {mutation.data.answer}
        </p>
      )}
    </Card>
  )
}
