import { ReactNode } from 'react'
import { Sun, Moon } from 'lucide-react'
import { TabNavigation } from './TabNavigation'
import { useTheme } from '../../contexts/ThemeContext'
import type { TabType } from '../../types'

interface LayoutProps {
  children: ReactNode
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header avec zone de drag pour la fenêtre */}
      <header className="drag-region bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between no-drag">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">Sleep Tracker</h1>
                <p className="text-xs text-muted">Suivi de sommeil personnel</p>
              </div>
            </div>
          </div>

          <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface-alt hover:bg-hover transition-colors text-text-primary"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Sleep Tracker v1.0.0</span>
          <span>Données stockées localement et chiffrées</span>
        </div>
      </footer>
    </div>
  )
}
