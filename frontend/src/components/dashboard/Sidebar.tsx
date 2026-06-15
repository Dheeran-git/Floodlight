import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/operations', label: 'Operations', icon: '🗺️' },
  { to: '/citizen', label: 'Citizen', icon: '📣' },
]

/** Left navigation rail linking the main views. */
export function Sidebar() {
  return (
    <nav className="flex w-16 flex-col items-center gap-2 border-r border-gray-800 bg-gray-950 py-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={item.label}
          className={({ isActive }) =>
            `flex w-12 flex-col items-center gap-1 rounded-lg py-2 text-[10px] transition-colors ${
              isActive
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-gray-400 hover:bg-gray-800/60'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
