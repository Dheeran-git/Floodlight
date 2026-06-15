/**
 * Vitest global setup.
 *
 * - Extends `expect` with jest-dom matchers.
 * - Provides a real IndexedDB implementation (jsdom lacks one) for the
 *   offline report queue tests.
 * - Cleans up the React Testing Library DOM and resets mocks between tests.
 */
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
