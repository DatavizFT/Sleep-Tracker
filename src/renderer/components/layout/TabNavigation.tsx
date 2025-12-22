import { Moon, Heart, Calendar } from 'lucide-react'
import type { TabType } from '../../types'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: 'sleep' as TabType, label: 'Sommeil', icon: Moon },
  { id: 'mood' as TabType, label: 'Humeur', icon: Heart },
  { id: 'agenda' as TabType, label: 'Agenda', icon: Calendar },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex space-x-2 p-1 bg-surface-alt rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-muted hover:text-text-primary hover:bg-hover'
              }
            `}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
