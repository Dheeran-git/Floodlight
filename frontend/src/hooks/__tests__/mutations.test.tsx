import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCommandQuery } from '../useCommandQuery'
import { useCreateReport } from '../useCreateReport'
import { api } from '@/services/api/client'

vi.mock('@/services/api/client', () => ({
  api: {
    command: { query: vi.fn() },
    reports: { create: vi.fn() },
  },
}))

const mockedCommandQuery = vi.mocked(api.command.query)
const mockedCreate = vi.mocked(api.reports.create)

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  mockedCommandQuery.mockReset()
  mockedCreate.mockReset()
})

describe('useCommandQuery', () => {
  it('resolves with the answer from the API', async () => {
    mockedCommandQuery.mockResolvedValue({ answer: 'all clear' })
    const { result } = renderHook(() => useCommandQuery(), {
      wrapper: makeWrapper(),
    })

    result.current.mutate('status?')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedCommandQuery).toHaveBeenCalledWith('status?')
    expect(result.current.data).toEqual({ answer: 'all clear' })
  })

  it('surfaces an error on failure', async () => {
    mockedCommandQuery.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useCommandQuery(), {
      wrapper: makeWrapper(),
    })

    result.current.mutate('status?')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as Error).message).toBe('boom')
  })
})

describe('useCreateReport', () => {
  it('posts the report payload and resolves', async () => {
    mockedCreate.mockResolvedValue({ success: true, report_id: 'abc' })
    const { result } = renderHook(() => useCreateReport(), {
      wrapper: makeWrapper(),
    })

    result.current.mutate({ text: 'help', latitude: 1, longitude: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedCreate).toHaveBeenCalledWith({
      text: 'help',
      latitude: 1,
      longitude: 2,
    })
    expect(result.current.data).toEqual({ success: true, report_id: 'abc' })
  })
})
