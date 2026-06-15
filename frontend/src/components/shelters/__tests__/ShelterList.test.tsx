import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ShelterList } from '../ShelterList'
import type { Shelter } from '@/types'

function shelter(overrides: Partial<Shelter>): Shelter {
  return {
    id: 's1',
    name: 'Central Shelter',
    capacity: 100,
    current_occupancy: 50,
    latitude: 0,
    longitude: 0,
    risk_score: 0.2,
    ...overrides,
  }
}

describe('ShelterList', () => {
  it('renders shelter names and occupancy figures', () => {
    render(
      <ShelterList
        shelters={[shelter({ current_occupancy: 50, capacity: 100 })]}
        isLoading={false}
      />,
    )
    expect(screen.getByText('Central Shelter')).toBeInTheDocument()
    expect(screen.getByText('50/100')).toBeInTheDocument()
  })

  it('shows the shelter count in the title', () => {
    render(<ShelterList shelters={[shelter({})]} isLoading={false} />)
    expect(screen.getByText('Shelters (1)')).toBeInTheDocument()
  })

  it('renders a green bar for low occupancy', () => {
    const { container } = render(
      <ShelterList
        shelters={[shelter({ current_occupancy: 30, capacity: 100 })]}
        isLoading={false}
      />,
    )
    const bar = container.querySelector('.h-1\\.5 > div')
    expect(bar).toHaveClass('bg-green-500')
  })

  it('renders an amber bar for medium occupancy', () => {
    const { container } = render(
      <ShelterList
        shelters={[shelter({ current_occupancy: 70, capacity: 100 })]}
        isLoading={false}
      />,
    )
    const bar = container.querySelector('.h-1\\.5 > div')
    expect(bar).toHaveClass('bg-amber-500')
  })

  it('renders a red bar (full width) for near-full occupancy', () => {
    const { container } = render(
      <ShelterList
        shelters={[shelter({ current_occupancy: 100, capacity: 100 })]}
        isLoading={false}
      />,
    )
    const bar = container.querySelector('.h-1\\.5 > div')
    expect(bar).toHaveClass('bg-red-500')
    expect(bar).toHaveClass('w-full')
  })

  it('handles zero capacity without dividing by zero', () => {
    const { container } = render(
      <ShelterList
        shelters={[shelter({ current_occupancy: 0, capacity: 0 })]}
        isLoading={false}
      />,
    )
    const bar = container.querySelector('.h-1\\.5 > div')
    expect(bar).toHaveClass('bg-green-500')
    expect(bar).toHaveClass('w-0')
  })

  it('shows a loading state', () => {
    render(<ShelterList shelters={[]} isLoading />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
