import type { ReactNode } from 'react'

interface SidePanelProps {
  title: string
  side?: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
  children: ReactNode
}

/** Collapsible side panel shell styled with a broadsheet layout. */
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
      className={`flex h-full flex-col bg-paper-raised ${border} border-rule transition-all duration-160 ease-[cubic-bezier(0.2,0,0,1)] ${
        collapsed ? 'w-12' : 'w-[360px]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 border-b border-rule-soft hover:bg-accent-tint transition-colors text-left cursor-pointer"
      >
        {!collapsed && (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            {title}
          </span>
        )}
        {collapsed && (
          <span className="font-mono text-[11px] font-semibold uppercase text-ink-3 mx-auto">
            {title.slice(0, 3)}
          </span>
        )}
        <span className="font-mono text-[11px] text-ink-3">{collapsed ? '▶' : '◀'}</span>
      </button>
      {!collapsed && (
        <div className="flex-1 space-y-5 overflow-y-auto p-4">{children}</div>
      )}
    </aside>
  )
}
