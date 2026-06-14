import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

/** Info panel container with an optional title, styled for the dark theme. */
export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-800 bg-gray-900/60 p-4 ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
