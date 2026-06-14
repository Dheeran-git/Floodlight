import { Link } from 'react-router-dom'

import { Card } from '@/components/ui'
import { ReportForm } from './ReportForm'

/** Citizen reporting portal: submit an SOS report with location. */
export function CitizenPortal() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-gray-100">
      <Card title="Citizen Report" className="w-full max-w-md">
        <p className="mb-4 text-sm text-gray-300">
          Report flooding, request rescue, or share conditions in your area.
        </p>
        <ReportForm />
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
