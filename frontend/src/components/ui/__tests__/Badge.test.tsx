import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from '../Badge'
import type { Severity } from '@/types'

describe('Badge', () => {
  it('renders the severity label by default', () => {
    render(<Badge severity="P0" />)
    expect(screen.getByText('P0')).toBeInTheDocument()
  })

  it('renders a custom label when provided', () => {
    render(<Badge severity="P1" label="Critical" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.queryByText('P1')).not.toBeInTheDocument()
  })

  const colorCases: Array<[Severity, string]> = [
    ['P0', 'text-red-300'],
    ['P1', 'text-orange-300'],
    ['P2', 'text-yellow-300'],
    ['P3', 'text-blue-300'],
  ]

  it.each(colorCases)('applies the right color class for %s', (severity, colorClass) => {
    render(<Badge severity={severity} />)
    const badge = screen.getByText(severity)
    expect(badge).toHaveClass(colorClass)
  })
})
