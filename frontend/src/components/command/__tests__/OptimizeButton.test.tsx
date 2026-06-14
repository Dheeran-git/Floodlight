import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OptimizeButton } from '../OptimizeButton'
import { api } from '@/services/api/client'

vi.mock('@/services/api/client', () => ({
  api: {
    optimization: {
      run: vi.fn(),
      getResult: vi.fn(),
    },
  },
}))

const mockedRun = vi.mocked(api.optimization.run)
const mockedGetResult = vi.mocked(api.optimization.getResult)

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  mockedRun.mockReset()
  mockedGetResult.mockReset()
})

describe('OptimizeButton', () => {
  it('shows the assignment count from the deployment_plan field', async () => {
    mockedRun.mockResolvedValue({ success: true, run_id: 'run-1' })
    // The backend returns the plan under `deployment_plan`, not `assignments`.
    mockedGetResult.mockResolvedValue({
      deployment_plan: [{ unit_id: 'u1' }, { unit_id: 'u2' }, { unit_id: 'u3' }],
    })

    render(<OptimizeButton />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: /run optimization/i }))

    await waitFor(() =>
      expect(
        screen.getByText('Optimization complete: 3 assignments.'),
      ).toBeInTheDocument(),
    )
  })

  it('surfaces an error when the optimizer fails', async () => {
    mockedRun.mockRejectedValue(new Error('boom'))
    render(<OptimizeButton />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: /run optimization/i }))
    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument())
  })
})
