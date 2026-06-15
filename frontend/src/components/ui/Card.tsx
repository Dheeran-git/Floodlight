import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  kicker?: string
  children: ReactNode
  className?: string
  lead?: boolean
}

/** Info panel container styled like an editorial card. */
export function Card({
  title,
  kicker = 'OPERATIONS',
  children,
  className = '',
  lead = false,
}: CardProps) {
  return (
    <div
      className={`rounded-[4px] border border-rule-soft bg-card p-4 relative transition-colors ${
        lead ? 'border-t-3 border-t-ink' : ''
      } ${className}`}
    >
      {title && (
        <div className="mb-3 border-b border-rule pb-2">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
            {kicker}
          </div>
          <h3 className="font-display text-[18px] font-semibold leading-tight text-ink mt-1">
            {title}
          </h3>
        </div>
      )}
      <div className="text-[14.5px] text-ink-2 font-ui">{children}</div>
    </div>
  )
}
