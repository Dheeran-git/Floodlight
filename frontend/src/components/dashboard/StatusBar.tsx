interface StatusBarProps {
  incidentCount: number
  unitCount: number
  shelterCount: number
}

/** Bottom status bar summarizing live operational counts. */
export function StatusBar({ incidentCount, unitCount, shelterCount }: StatusBarProps) {
  return (
    <footer className="flex items-center gap-6 border-t border-gray-800 bg-gray-950 px-4 py-1.5 text-xs text-gray-400">
      <span>Incidents: <span className="text-gray-200">{incidentCount}</span></span>
      <span>Units: <span className="text-gray-200">{unitCount}</span></span>
      <span>Shelters: <span className="text-gray-200">{shelterCount}</span></span>
    </footer>
  )
}
