import { NavLink } from 'react-router-dom'

const tabs = [
  { icon: '◉', label: 'Practice', to: '/' },
  { icon: '◎', label: 'Progress', to: '/progress' },
  { icon: '○', label: 'About', to: '/about' },
]

export default function TabBar() {
  return (
    <nav className="flex border-t border-line bg-paper">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end
          className={({ isActive }) =>
            `flex-1 py-3 text-center font-hand no-underline transition-colors ${
              isActive ? 'text-ink font-bold' : 'text-muted-soft hover:text-ink'
            }`
          }
        >
          <div className="text-lg">{tab.icon}</div>
          <div className="text-sm">{tab.label}</div>
        </NavLink>
      ))}
    </nav>
  )
}
