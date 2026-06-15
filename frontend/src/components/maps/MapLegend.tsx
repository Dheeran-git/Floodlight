/** Severity colors mirroring the map markers / Badge palette. */
const LEGEND = [
  { label: 'P0 — Critical', dot: 'bg-red-500' },
  { label: 'P1 — High', dot: 'bg-orange-500' },
  { label: 'P2 — Medium', dot: 'bg-yellow-500' },
  { label: 'P3 — Low', dot: 'bg-blue-500' },
]

/** Small floating severity legend for the crisis map panel. */
export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded border border-gray-800 bg-gray-950/80 px-3 py-2 backdrop-blur">
      <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
        Severity
      </p>
      <ul className="space-y-1">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-gray-300">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
