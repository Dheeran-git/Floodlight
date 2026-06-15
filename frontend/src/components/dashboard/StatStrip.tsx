import { useMemo } from 'react'
import type { Incident, RescueUnit, Shelter } from '@/types'

interface StatStripProps {
  incidents: Incident[]
  units: RescueUnit[]
  shelters: Shelter[]
}

/**
 * Editorial pull-stat banner row displaying active operational counts
 * in large Newsreader display numbers.
 */
export function StatStrip({ incidents, units, shelters }: StatStripProps) {
  const activeCount = incidents.filter((i) => i.status === 'active').length
  const p0Count = incidents.filter((i) => i.severity === 'P0' && i.status === 'active').length
  const deployedCount = units.filter((u) => u.status !== 'available').length
  
  const shelterCapacityString = useMemo(() => {
    let totalCap = 0
    let totalOcc = 0
    shelters.forEach((s) => {
      totalCap += s.capacity
      totalOcc += s.current_occupancy
    })
    const percentage = totalCap ? Math.round((totalOcc / totalCap) * 100) : 0
    return `${shelters.length} / ${percentage}%`
  }, [shelters])

  const stats = [
    { label: 'ACTIVE INCIDENTS', value: String(activeCount), emph: activeCount > 0 },
    { label: 'P0 / SOS OPEN', value: String(p0Count), emph: p0Count > 0 },
    { label: 'UNITS ENGAGED', value: `${deployedCount} / ${units.length}` },
    { label: 'SHELTERS / CAP', value: shelterCapacityString },
  ]

  return (
    <div className="flex bg-paper border-b border-rule shrink-0 select-none">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`flex-1 px-5 py-3.5 ${
            i < stats.length - 1 ? 'border-r border-rule-soft' : ''
          }`}
        >
          <div className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink-3 uppercase">
            {s.label}
          </div>
          <div
            className={`font-display text-[28px] font-semibold leading-none mt-1.5 tracking-tight ${
              s.emph ? 'text-emphasis' : 'text-ink'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}
