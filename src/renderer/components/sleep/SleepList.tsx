import { useState } from 'react'
import { Edit2, Trash2, Clock, Moon, ChevronDown, ChevronUp } from 'lucide-react'
import type { SleepEntry } from '../../types'
import { SLEEP_TYPE_LABELS, QUALITY_LABELS, SLEEP_TYPE_COLORS } from '../../types'
import { calculateSleepDuration, formatDuration, getNightDate, formatNightDate } from '../../utils/dateUtils'
import { SleepForm } from './SleepForm'

interface SleepListProps {
  entries: SleepEntry[]
  onUpdate: (id: string, data: Partial<SleepEntry>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SleepList({ entries, onUpdate, onDelete }: SleepListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Grouper les entrées par nuit (période 20h-20h)
  const entriesByNight = entries.reduce(
    (acc, entry) => {
      const nightDate = getNightDate(entry.date, entry.bedTime, entry.sleepType)
      if (!acc[nightDate]) {
        acc[nightDate] = []
      }
      acc[nightDate].push(entry)
      return acc
    },
    {} as Record<string, SleepEntry[]>
  )

  const nights = Object.keys(entriesByNight).sort((a, b) => b.localeCompare(a))

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  const handleDelete = async (id: string) => {
    await onDelete(id)
    setDeleteConfirmId(null)
  }

  const handleUpdate = async (id: string, entries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    // Pour l'édition, on ne prend que la première entrée
    const entry = entries[0]
    await onUpdate(id, entry)
    setEditingId(null)
  }

  if (entries.length === 0) {
    return (
      <div className="card text-center py-12">
        <Moon className="mx-auto text-dark-500 mb-4" size={48} />
        <h3 className="text-lg font-medium text-dark-300 mb-2">Aucune donnée de sommeil</h3>
        <p className="text-dark-500">Commencez par enregistrer votre première nuit de sommeil.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {nights.map((nightDate) => {
        const nightEntries = entriesByNight[nightDate]
        const isExpanded = expandedDates.has(nightDate)
        const totalDuration = nightEntries.reduce(
          (sum, e) => sum + calculateSleepDuration(e.bedTime, e.wakeTime),
          0
        )

        return (
          <div key={nightDate} className="card p-0 overflow-hidden">
            {/* En-tête de nuit */}
            <button
              onClick={() => toggleDate(nightDate)}
              className="w-full flex items-center justify-between p-4 hover:bg-dark-750 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="font-semibold text-white">{formatNightDate(nightDate)}</p>
                  <p className="text-sm text-dark-400">
                    {nightEntries.length} période{nightEntries.length > 1 ? 's' : ''} •{' '}
                    {formatDuration(totalDuration)} au total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {nightEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SLEEP_TYPE_COLORS[entry.sleepType] }}
                      title={SLEEP_TYPE_LABELS[entry.sleepType]}
                    />
                  ))}
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-dark-400" size={20} />
                ) : (
                  <ChevronDown className="text-dark-400" size={20} />
                )}
              </div>
            </button>

            {/* Détails des entrées */}
            {isExpanded && (
              <div className="border-t border-dark-700 divide-y divide-dark-700">
                {nightEntries.map((entry) => (
                  <div key={entry.id} className="p-4">
                    {editingId === entry.id ? (
                      <SleepForm
                        initialEntry={entry}
                        onSave={(entries) => handleUpdate(entry.id, entries)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className="px-2 py-1 rounded-md text-sm font-medium text-white"
                              style={{ backgroundColor: SLEEP_TYPE_COLORS[entry.sleepType] }}
                            >
                              {SLEEP_TYPE_LABELS[entry.sleepType]}
                            </span>
                            <span className="text-dark-400 text-sm flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(calculateSleepDuration(entry.bedTime, entry.wakeTime))}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-dark-500">Coucher</p>
                              <p className="text-white font-medium">{entry.bedTime}</p>
                            </div>
                            <div>
                              <p className="text-dark-500">Réveil</p>
                              <p className="text-white font-medium">{entry.wakeTime}</p>
                            </div>
                            <div>
                              <p className="text-dark-500">Qualité sommeil</p>
                              <p className="text-white font-medium">
                                {entry.sleepQuality}/5 - {QUALITY_LABELS[entry.sleepQuality]}
                              </p>
                            </div>
                            <div>
                              <p className="text-dark-500">Qualité réveil</p>
                              <p className="text-white font-medium">
                                {entry.wakeQuality}/5 - {QUALITY_LABELS[entry.wakeQuality]}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setEditingId(entry.id)}
                            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>

                          {deleteConfirmId === entry.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs bg-dark-600 text-white rounded hover:bg-dark-500"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(entry.id)}
                              className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
