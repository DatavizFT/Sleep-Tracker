import { useState } from 'react'
import { Layout } from './components/layout/Layout'
import { SleepPage } from './components/sleep/SleepPage'
import { MoodPlaceholder } from './components/mood/MoodPlaceholder'
import { AgendaPlaceholder } from './components/agenda/AgendaPlaceholder'
import { ThemeProvider } from './contexts/ThemeContext'
import type { TabType } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sleep')

  const renderContent = () => {
    switch (activeTab) {
      case 'sleep':
        return <SleepPage />
      case 'mood':
        return <MoodPlaceholder />
      case 'agenda':
        return <AgendaPlaceholder />
      default:
        return <SleepPage />
    }
  }

  return (
    <ThemeProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </ThemeProvider>
  )
}

export default App
