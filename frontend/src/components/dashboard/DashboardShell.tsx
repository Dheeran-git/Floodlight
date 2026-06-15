import type { ReactNode } from 'react'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  children: ReactNode
  incidentCount?: number
  unitCount?: number
  shelterCount?: number
}

/** Operations dashboard frame: broadsheet header, LeftRail, and content slot. */
export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen flex-col bg-paper text-ink overflow-hidden font-ui">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col bg-paper">
          {children}
        </main>
      </div>
    </div>
  )
}
