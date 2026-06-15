import { Routes, Route } from 'react-router-dom'

import { OperationsDesk } from '@/pages/OperationsDesk'
import { CitizenPortal } from '@/pages/CitizenPortal'

/**
 * Root application component.
 *
 * Sets up routing between the operations desk and citizen portal.
 * No business logic here — delegates to page components.
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>
        <Route path="/" element={<OperationsDesk />} />
        <Route path="/operations" element={<OperationsDesk />} />
        <Route path="/citizen" element={<CitizenPortal />} />
      </Routes>
    </div>
  )
}

export default App
