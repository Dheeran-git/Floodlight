import type { ReactNode } from 'react'

interface SidePanelProps {
  title: string
  side?: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
  children: ReactNode
}

/** Collapsible side panel shell anchored to the left or right of the map. */
export function SidePanel({
  title,
  side = 'right',
  collapsed,
  onToggle,
  children,
}: SidePanelProps) {
  const border = side === 'right' ? 'border-l' : 'border-r'
  return (
    <aside
      className={`flex h-full flex-col bg-gray-950/80 ${border} border-gray-800 transition-all duration-200 ${collapsed ? 'w-12' : 'w-80'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800/60"
      >
        {!collapsed && <span>{title}</span>}
        <span className="text-gray-500">{collapsed ? '⟨' : '⟩'}</span>
      </button>
      {!collapsed && (
        <div className="flex-1 space-y-3 overflow-y-auto p-3">{children}</div>
      )}
    </aside>
  )
}
