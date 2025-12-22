import { useState } from 'react'
import { Plus, List } from 'lucide-react'
import { SleepForm } from './SleepForm'
import { SleepList } from './SleepList'
import { SleepStats } from './SleepStats'
import { useSleepData } from '../../hooks/useSleepData'
import type { SleepEntry } from '../../types'

type ViewMode = 'form' | 'list'

export function SleepPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const { entries, isLoading, error, addMultipleEntries, updateEntry, deleteEntry } = useSleepData()

  const handleSave = async (newEntries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    await addMultipleEntries(newEntries)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-500/10 border-red-500/50">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec toggle de vue */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Suivi du sommeil</h2>
          <p className="text-muted mt-1">
            Enregistrez et analysez vos habitudes de sommeil
          </p>
        </div>

        <div className="flex gap-2 bg-surface-alt p-1 rounded-lg">
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'form'
                ? 'bg-primary-600 text-white'
                : 'text-muted hover:text-text-primary hover:bg-hover'
            }`}
          >
            <Plus size={18} />
            Saisie
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'text-muted hover:text-text-primary hover:bg-hover'
            }`}
          >
            <List size={18} />
            Historique
            {entries.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-surface-alt rounded-full">
                {entries.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenu selon le mode */}
      <div>
        {viewMode === 'form' ? (
          <SleepForm onSave={handleSave} />
        ) : (
          <SleepList
            entries={entries}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
          />
        )}
      </div>

      {/* Statistiques en dessous */}
      <SleepStats entries={entries} />
    </div>
  )
}
