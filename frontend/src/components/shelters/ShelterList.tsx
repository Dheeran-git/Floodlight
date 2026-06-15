import { Card } from '@/components/ui'
import type { Shelter } from '@/types'

/** Tailwind bar color based on occupancy ratio. */
function occupancyColor(ratio: number): string {
  if (ratio >= 0.9) return 'bg-red-500'
  if (ratio >= 0.6) return 'bg-amber-500'
  return 'bg-green-500'
}

/** Map an occupancy ratio to a Tailwind fractional width class (twelfths). */
const WIDTH_CLASSES = [
  'w-0', 'w-1/12', 'w-2/12', 'w-3/12', 'w-4/12', 'w-5/12', 'w-6/12',
  'w-7/12', 'w-8/12', 'w-9/12', 'w-10/12', 'w-11/12', 'w-full',
]

function occupancyWidth(ratio: number): string {
  const twelfths = Math.round(Math.min(Math.max(ratio, 0), 1) * 12)
  return WIDTH_CLASSES[twelfths]
}

interface ShelterListProps {
  shelters: Shelter[]
  isLoading: boolean
}

/** Panel listing shelters with a capacity utilization bar. */
export function ShelterList({ shelters, isLoading }: ShelterListProps) {
  return (
    <Card title={`Shelters (${shelters.length})`}>
      {isLoading && <p className="text-xs text-gray-500">Loading…</p>}
      <ul className="space-y-2.5">
        {shelters.map((shelter) => {
          const ratio = shelter.capacity
            ? shelter.current_occupancy / shelter.capacity
            : 0
          return (
            <li key={shelter.id}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-200">{shelter.name}</span>
                <span className="text-gray-500">
                  {shelter.current_occupancy}/{shelter.capacity}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded bg-gray-800">
                <div
                  className={`h-full rounded ${occupancyColor(ratio)} ${occupancyWidth(ratio)}`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
