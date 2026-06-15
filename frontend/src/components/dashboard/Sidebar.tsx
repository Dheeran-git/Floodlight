import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  kicker: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/operations', label: 'Operations Desk', kicker: 'SITUATION' },
  { to: '/citizen', label: 'Citizen Portal', kicker: 'REPORTER' },
]

/** Left navigation rail linking the main views, styled in a broadsheet editorial look. */
export function Sidebar() {
  return (
    <nav className="flex w-56 flex-col bg-paper-raised border-r border-rule py-5 select-none shrink-0">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3 px-5 mb-3">
        SECTIONS
      </div>
      <div className="flex flex-col flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col justify-center px-5 py-2.5 border-l-2 transition-all ${
                isActive
                  ? 'bg-paper border-ink font-bold text-ink'
                  : 'border-transparent text-ink-2 hover:bg-accent-tint hover:text-ink'
              }`
            }
          >
            <span className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-3">
              {item.kicker}
            </span>
            <span className="font-ui text-[13.5px] mt-0.5">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
      
      {/* Operator Detail Card */}
      <div className="mx-5 pt-4 border-t border-rule-soft">
        <div className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-3">
          OPERATOR
        </div>
        <div className="font-display text-[15px] font-semibold text-ink mt-1 select-all">
          Desk 02 · A. Rao
        </div>
        <div className="font-mono text-[10px] text-ink-3 mt-0.5">
          SHIFT 18:00–06:00
        </div>
      </div>
    </nav>
  )
}
