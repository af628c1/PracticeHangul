import { NavLink } from 'react-router-dom'

const tabs = [
  { icon: '◉', label: 'Practice', to: '/' },
  { icon: '◎', label: 'Progress', to: '/progress' },
  { icon: '○', label: 'About' },
]

export default function TabBar() {
  return (
    <nav className="flex border-t border-line bg-paper">
      {tabs.map((tab) =>
        tab.to ? (
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
            <TabContent icon={tab.icon} label={tab.label} />
          </NavLink>
        ) : (
          <div key={tab.label} className="flex-1 py-3 text-center font-hand text-muted-soft">
            <TabContent icon={tab.icon} label={tab.label} />
          </div>
        ),
      )}
    </nav>
  )
}

function TabContent({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <div className="text-lg">{icon}</div>
      <div className="text-sm">{label}</div>
    </>
  )
}
