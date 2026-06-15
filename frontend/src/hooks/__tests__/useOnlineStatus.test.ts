import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useOnlineStatus } from '../useOnlineStatus'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useOnlineStatus', () => {
  it('initializes from navigator.onLine', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it('returns false when an offline event fires', () => {
    const { result } = renderHook(() => useOnlineStatus())
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
  })

  it('returns true again when an online event fires', () => {
    const { result } = renderHook(() => useOnlineStatus())
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })
})
