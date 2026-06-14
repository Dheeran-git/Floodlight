import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ResourceList } from '../ResourceList'
import type { RescueUnit } from '@/types'

const units: RescueUnit[] = [
  {
    id: 'u1',
    name: 'Rescue Boat 1',
    type: 'boat',
    status: 'available',
    latitude: 0,
    longitude: 0,
    capacity: 6,
    last_updated: '2026-06-14T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Helicopter Alpha',
    type: 'air',
    status: 'en_route',
    latitude: 0,
    longitude: 0,
    capacity: 4,
    last_updated: '2026-06-14T00:00:00Z',
  },
]

describe('ResourceList', () => {
  it('renders all units with name and type', () => {
    render(<ResourceList units={units} isLoading={false} />)
    expect(screen.getByText('Rescue Boat 1')).toBeInTheDocument()
    expect(screen.getByText('Helicopter Alpha')).toBeInTheDocument()
    expect(screen.getByText('boat')).toBeInTheDocument()
    expect(screen.getByText('air')).toBeInTheDocument()
  })

  it('shows the unit count in the title', () => {
    render(<ResourceList units={units} isLoading={false} />)
    expect(screen.getByText('Rescue Units (2)')).toBeInTheDocument()
  })

  it('renders a status indicator label per unit', () => {
    render(<ResourceList units={units} isLoading={false} />)
    expect(screen.getByText('available')).toBeInTheDocument()
    expect(screen.getByText('en_route')).toBeInTheDocument()
  })

  it('maps available status to the online (green) tone', () => {
    render(<ResourceList units={[units[0]]} isLoading={false} />)
    const item = screen.getByText('Rescue Boat 1').closest('li')!
    const dot = within(item).getByText('available').querySelector('span')
    expect(dot).toHaveClass('bg-green-400')
  })

  it('maps en_route status to the busy (amber) tone', () => {
    render(<ResourceList units={[units[1]]} isLoading={false} />)
    const item = screen.getByText('Helicopter Alpha').closest('li')!
    const dot = within(item).getByText('en_route').querySelector('span')
    expect(dot).toHaveClass('bg-amber-400')
  })

  it('shows a loading state', () => {
    render(<ResourceList units={[]} isLoading />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
