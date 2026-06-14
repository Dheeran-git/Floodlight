import { Link } from 'react-router-dom'

import { Card } from '@/components/ui'

/** Citizen reporting portal shell. The full report form arrives in Phase 5. */
export function CitizenPortal() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-gray-100">
      <Card title="Citizen Report" className="w-full max-w-md">
        <p className="text-sm text-gray-300">
          Report flooding, request rescue, or share conditions in your area.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          The full submission form (text, GPS, and voice) is built in Phase 5.
        </p>
        <Link
          to="/operations"
          className="mt-4 inline-block text-xs text-amber-400 underline hover:text-amber-300"
        >
          Go to Operations Desk →
        </Link>
      </Card>
    </div>
  )
}
