import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CommandPanel } from '../CommandPanel'
import { api } from '@/services/api/client'

vi.mock('@/services/api/client', () => ({
  api: {
    command: {
      query: vi.fn(),
    },
  },
}))

const mockedQuery = vi.mocked(api.command.query)

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  mockedQuery.mockReset()
})

describe('CommandPanel', () => {
  it('renders example quick-buttons', () => {
    render(<CommandPanel />, { wrapper })
    expect(screen.getByText('Which area is highest risk?')).toBeInTheDocument()
    expect(screen.getByText('Which shelter will overflow?')).toBeInTheDocument()
    expect(screen.getByText('Which rescue team is overloaded?')).toBeInTheDocument()
  })

  it('calls the mutation and renders the returned answer', async () => {
    const user = userEvent.setup()
    mockedQuery.mockResolvedValue({ answer: 'Sector 4 is highest risk.' })
    render(<CommandPanel />, { wrapper })

    await user.type(
      screen.getByPlaceholderText('Ask an operational question…'),
      'where',
    )
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    expect(mockedQuery).toHaveBeenCalledWith('where')
    expect(await screen.findByText('Sector 4 is highest risk.')).toBeInTheDocument()
  })

  it('submits via an example quick-button', async () => {
    const user = userEvent.setup()
    mockedQuery.mockResolvedValue({ answer: 'Riverside shelter will overflow.' })
    render(<CommandPanel />, { wrapper })

    await user.click(screen.getByText('Which shelter will overflow?'))

    expect(mockedQuery).toHaveBeenCalledWith('Which shelter will overflow?')
    expect(
      await screen.findByText('Riverside shelter will overflow.'),
    ).toBeInTheDocument()
  })

  it('shows an error message when the query fails', async () => {
    const user = userEvent.setup()
    mockedQuery.mockRejectedValue(new Error('Backend unavailable'))
    render(<CommandPanel />, { wrapper })

    await user.type(
      screen.getByPlaceholderText('Ask an operational question…'),
      'status',
    )
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    expect(await screen.findByText('Backend unavailable')).toBeInTheDocument()
  })

  it('shows a loading label while the mutation is pending', async () => {
    const user = userEvent.setup()
    let resolve: (v: { answer: string }) => void = () => {}
    mockedQuery.mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    render(<CommandPanel />, { wrapper })

    await user.type(
      screen.getByPlaceholderText('Ask an operational question…'),
      'wait',
    )
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    expect(await screen.findByText('Thinking…')).toBeInTheDocument()
    resolve({ answer: 'done' })
    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument())
  })

  it('does not submit an empty query', async () => {
    const user = userEvent.setup()
    render(<CommandPanel />, { wrapper })
    const askButton = screen.getByRole('button', { name: 'Ask' })
    expect(askButton).toBeDisabled()
    await user.click(askButton)
    expect(mockedQuery).not.toHaveBeenCalled()
  })
})
