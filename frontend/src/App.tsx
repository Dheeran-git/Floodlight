import { Routes, Route } from 'react-router-dom'

/**
 * Root application component.
 *
 * Sets up routing between citizen portal and operations desk.
 * No business logic here — delegates to page components.
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>
        <Route path="/" element={<DashboardShell />} />
        <Route path="/citizen" element={<CitizenPortalPlaceholder />} />
        <Route path="/operations" element={<OperationsDeskPlaceholder />} />
      </Routes>
    </div>
  )
}

/** Temporary dashboard shell — will be replaced in Phase 3. */
function DashboardShell() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-amber-400">
          🔦 Floodlight
        </h1>
        <p className="text-gray-400 text-lg">
          AI-Powered Disaster Operations Copilot
        </p>
        <p className="text-gray-500 text-sm">
          Dashboard shell initialized. Phase 3 will build the full UI.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/citizen"
            className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            Citizen Portal
          </a>
          <a
            href="/operations"
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Operations Desk
          </a>
        </div>
      </div>
    </div>
  )
}

/** Placeholder for citizen reporting portal. */
function CitizenPortalPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-amber-400">Citizen Portal</h2>
        <p className="text-gray-500">Report submission UI — Phase 3</p>
        <a href="/" className="text-gray-400 hover:text-gray-300 text-sm underline">
          ← Back
        </a>
      </div>
    </div>
  )
}

/** Placeholder for operations desk dashboard. */
function OperationsDeskPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-blue-400">Operations Desk</h2>
        <p className="text-gray-500">Crisis map & dashboard — Phase 3</p>
        <a href="/" className="text-gray-400 hover:text-gray-300 text-sm underline">
          ← Back
        </a>
      </div>
    </div>
  )
}

export default App
