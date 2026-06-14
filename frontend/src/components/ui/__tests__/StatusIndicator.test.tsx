import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusIndicator } from '../StatusIndicator'
import type { StatusTone } from '../StatusIndicator'

describe('StatusIndicator', () => {
  it('renders the label', () => {
    render(<StatusIndicator tone="online" label="Connected" />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  const toneCases: Array<[StatusTone, string]> = [
    ['online', 'bg-green-400'],
    ['busy', 'bg-amber-400'],
    ['offline', 'bg-gray-500'],
    ['warning', 'bg-red-400'],
  ]

  it.each(toneCases)('renders the %s tone dot color', (tone, colorClass) => {
    const { container } = render(<StatusIndicator tone={tone} label={tone} />)
    const dot = container.querySelector('span > span')
    expect(dot).toHaveClass(colorClass)
  })

  it('adds the pulse animation when pulse is set', () => {
    const { container } = render(
      <StatusIndicator tone="online" label="Live" pulse />,
    )
    const dot = container.querySelector('span > span')
    expect(dot).toHaveClass('animate-pulse')
  })

  it('omits the pulse animation by default', () => {
    const { container } = render(<StatusIndicator tone="online" label="Live" />)
    const dot = container.querySelector('span > span')
    expect(dot).not.toHaveClass('animate-pulse')
  })
})
