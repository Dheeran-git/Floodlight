import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { IncidentList } from '../IncidentList'
import { useIncidentStore } from '@/state'
import type { Incident } from '@/types'

const incidents: Incident[] = [
  {
    id: 'a',
    title: 'Low flood watch',
    severity: 'P3',
    priority_score: 10,
    status: 'active',
    latitude: 0,
    longitude: 0,
  },
  {
    id: 'b',
    title: 'Major levee breach',
    severity: 'P0',
    priority_score: 95,
    status: 'active',
    latitude: 0,
    longitude: 0,
  },
  {
    id: 'c',
    title: 'Road flooding',
    severity: 'P2',
    priority_score: 50,
    status: 'active',
    latitude: 0,
    longitude: 0,
  },
]

beforeEach(() => {
  useIncidentStore.setState({ incidents: [], selectedIncidentId: null })
})

describe('IncidentList', () => {
  it('renders incident titles and severity badges', () => {
    render(<IncidentList incidents={incidents} isLoading={false} />)
    expect(screen.getByText('Major levee breach')).toBeInTheDocument()
    expect(screen.getByText('Road flooding')).toBeInTheDocument()
    expect(screen.getByText('P0')).toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
  })

  it('shows the incident count in the title', () => {
    render(<IncidentList incidents={incidents} isLoading={false} />)
    expect(screen.getByText('Incidents (3)')).toBeInTheDocument()
  })

  it('sorts incidents by priority score descending', () => {
    render(<IncidentList incidents={incidents} isLoading={false} />)
    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).getByText('Major levee breach')).toBeInTheDocument()
    expect(within(items[1]).getByText('Road flooding')).toBeInTheDocument()
    expect(within(items[2]).getByText('Low flood watch')).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(<IncidentList incidents={[]} isLoading />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows an empty state when not loading', () => {
    render(<IncidentList incidents={[]} isLoading={false} />)
    expect(screen.getByText('No active incidents.')).toBeInTheDocument()
  })

  it('selecting an incident updates the Zustand store', async () => {
    const user = userEvent.setup()
    render(<IncidentList incidents={incidents} isLoading={false} />)
    await user.click(screen.getByText('Major levee breach'))
    expect(useIncidentStore.getState().selectedIncidentId).toBe('b')
  })

  it('highlights the selected incident', async () => {
    const user = userEvent.setup()
    render(<IncidentList incidents={incidents} isLoading={false} />)
    const button = screen.getByText('Road flooding').closest('button')!
    await user.click(button)
    expect(button).toHaveClass('bg-amber-500/10')
  })
})
