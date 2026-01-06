import { useState } from 'react'
import { Save, Clock, Calendar, Moon, Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { SleepEntry, SleepType, QualityLevel } from '../../types'
import { SLEEP_TYPE_LABELS, QUALITY_LABELS } from '../../types'
import { calculateSleepDuration, formatDuration, getDefaultNightDate } from '../../utils/dateUtils'

// Fonction pour obtenir la couleur en fonction du niveau (1=rouge, 5=vert)
const getQualityColor = (level: QualityLevel, isSelected: boolean): string => {
  const baseColors = {
    1: 'bg-red-600 hover:bg-red-700 text-white',
    2: 'bg-orange-600 hover:bg-orange-700 text-white',
    3: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    4: 'bg-lime-600 hover:bg-lime-700 text-white',
    5: 'bg-green-600 hover:bg-green-700 text-white',
  }
  
  const baseStyle = baseColors[level]
  
  if (isSelected) {
    return `${baseStyle} scale-125 border-2 border-grey shadow-lg`
  }
  
  return baseStyle
}

interface SleepFormProps {
  onSave: (entries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>
  initialEntry?: SleepEntry
  onCancel?: () => void
}

interface FormEntry {
  tempId: string
  sleepType: SleepType
  bedTime: string
  wakeTime: string
  sleepQuality: QualityLevel
  wakeQuality: QualityLevel
}

const DEFAULT_ENTRY: Omit<FormEntry, 'tempId'> = {
  sleepType: 'nocturne',
  bedTime: '22:00',
  wakeTime: '07:00',
  sleepQuality: 3,
  wakeQuality: 3,
}

export function SleepForm({ onSave, initialEntry, onCancel }: SleepFormProps) {
  const [date, setDate] = useState(initialEntry?.date || getDefaultNightDate())
  const [entries, setEntries] = useState<FormEntry[]>(() => {
    if (initialEntry) {
      return [
        {
          tempId: uuidv4(),
          sleepType: initialEntry.sleepType,
          bedTime: initialEntry.bedTime,
          wakeTime: initialEntry.wakeTime,
          sleepQuality: initialEntry.sleepQuality,
          wakeQuality: initialEntry.wakeQuality,
        },
      ]
    }
    return [{ ...DEFAULT_ENTRY, tempId: uuidv4() }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addEntry = () => {
    setEntries([...entries, { ...DEFAULT_ENTRY, tempId: uuidv4() }])
  }

  const removeEntry = (tempId: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.tempId !== tempId))
    }
  }

  const updateEntry = (tempId: string, field: keyof Omit<FormEntry, 'tempId'>, value: unknown) => {
    setEntries(entries.map((e) => (e.tempId === tempId ? { ...e, [field]: value } : e)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      const sleepEntries = entries.map((entry) => ({
        date,
        sleepType: entry.sleepType,
        bedTime: entry.bedTime,
        wakeTime: entry.wakeTime,
        sleepQuality: entry.sleepQuality,
        wakeQuality: entry.wakeQuality,
      }))

      await onSave(sleepEntries)

      // Reset form après succès
      if (!initialEntry) {
        setEntries([{ ...DEFAULT_ENTRY, tempId: uuidv4() }])
        setDate(getDefaultNightDate())
      }

      setSuccessMessage(
        entries.length > 1 ? 'Entrées enregistrées avec succès !' : 'Entrée enregistrée avec succès !'
      )

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date commune à toutes les entrées */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-primary-500" size={20} />
          <h3 className="text-lg font-semibold">Date</h3>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {/* Entrées de sommeil */}
      {entries.map((entry, index) => (
        <div key={entry.tempId} className="card relative">
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => removeEntry(entry.tempId)}
              className="absolute top-4 right-4 p-1 text-dark-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}

          <div className="flex items-center gap-2 mb-6">
            <Moon className="text-primary-500" size={20} />
            <h3 className="text-lg font-semibold text-grey-100">
              Période de sommeil {entries.length > 1 ? `#${index + 1}` : ''}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de sommeil */}
            <div>
              <label className="label">Type de sommeil</label>
              <select
                value={entry.sleepType}
                onChange={(e) => updateEntry(entry.tempId, 'sleepType', e.target.value as SleepType)}
                className="input"
              >
                {(Object.keys(SLEEP_TYPE_LABELS) as SleepType[]).map((type) => (
                  <option key={type} value={type}>
                    {SLEEP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Durée calculée */}
            {/*<div className="flex items-end">
              <div className="px-4 py-2 bg-dark-700 rounded-lg">
                <span className="text-sm text-dark-400">Durée estimée: </span>
                <span className="text-lg font-semibold text-primary-400">
                  {formatDuration(calculateSleepDuration(entry.bedTime, entry.wakeTime))}
                </span>
              </div>
            </div>*/}

            {/* Heure de coucher */}
            <div>
              <label className="label flex items-center gap-2">
                <Clock size={14} />
                Heure de coucher
              </label>
              <input
                type="time"
                value={entry.bedTime}
                onChange={(e) => updateEntry(entry.tempId, 'bedTime', e.target.value)}
                className="input"
              />
            </div>

            {/* Heure de réveil */}
            <div>
              <label className="label flex items-center gap-2">
                <Clock size={14} />
                Heure de réveil
              </label>
              <input
                type="time"
                value={entry.wakeTime}
                onChange={(e) => updateEntry(entry.tempId, 'wakeTime', e.target.value)}
                className="input"
              />
            </div>

            {/* Qualité du sommeil */}
            <div>
              <label className="label">Qualité du sommeil</label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as QualityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateEntry(entry.tempId, 'sleepQuality', level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${getQualityColor(level, entry.sleepQuality === level)}`}
                    title={QUALITY_LABELS[level]}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-dark-400 mt-1">{QUALITY_LABELS[entry.sleepQuality]}</p>
            </div>

            {/* Qualité du réveil */}
            <div>
              <label className="label">Qualité du réveil</label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as QualityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateEntry(entry.tempId, 'wakeQuality', level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${getQualityColor(level, entry.wakeQuality === level)}`}
                    title={QUALITY_LABELS[level]}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-dark-400 mt-1">{QUALITY_LABELS[entry.wakeQuality]}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Bouton ajouter une période */}
      {!initialEntry && (
        <button
          type="button"
          onClick={addEntry}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Ajouter une autre période de sommeil
        </button>
      )}

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : initialEntry ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
