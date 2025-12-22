import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { SleepEntry, SleepType, QualityLevel } from '../types'

interface UseSleepDataReturn {
  entries: SleepEntry[]
  isLoading: boolean
  error: string | null
  addEntry: (entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  addMultipleEntries: (entries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>
  updateEntry: (id: string, data: Partial<SleepEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  getEntriesByDateRange: (startDate: string, endDate: string) => SleepEntry[]
  refreshEntries: () => Promise<void>
}

// Hook pour la gestion des données de sommeil
export function useSleepData(): UseSleepDataReturn {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les entrées au montage
  const refreshEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (window.electronAPI) {
        const data = await window.electronAPI.sleep.getAll()
        // Trier par date décroissante
        setEntries(data.sort((a, b) => b.date.localeCompare(a.date)))
      } else {
        // Mode développement sans Electron - utiliser localStorage
        const stored = localStorage.getItem('sleepEntries')
        if (stored) {
          setEntries(JSON.parse(stored))
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshEntries()
  }, [refreshEntries])

  // Ajouter une entrée
  const addEntry = useCallback(
    async (entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString()
        const newEntry: SleepEntry = {
          ...entry,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        }

        if (window.electronAPI) {
          await window.electronAPI.sleep.save(newEntry)
        } else {
          // Mode développement - localStorage
          const updated = [...entries, newEntry]
          localStorage.setItem('sleepEntries', JSON.stringify(updated))
        }

        await refreshEntries()
      } catch (err) {
        setError("Erreur lors de l'ajout de l'entrée")
        console.error(err)
        throw err
      }
    },
    [entries, refreshEntries]
  )

  // Ajouter plusieurs entrées
  const addMultipleEntries = useCallback(
    async (newEntries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      try {
        const now = new Date().toISOString()
        const fullEntries: SleepEntry[] = newEntries.map((entry) => ({
          ...entry,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        }))

        if (window.electronAPI) {
          // Sauvegarder toutes les entrées
          for (const entry of fullEntries) {
            await window.electronAPI.sleep.save(entry)
          }
        } else {
          // Mode développement - localStorage
          const stored = localStorage.getItem('sleepEntries')
          const existing = stored ? JSON.parse(stored) : []
          const updated = [...existing, ...fullEntries]
          localStorage.setItem('sleepEntries', JSON.stringify(updated))
        }

        await refreshEntries()
      } catch (err) {
        setError("Erreur lors de l'ajout des entrées")
        console.error(err)
        throw err
      }
    },
    [refreshEntries]
  )

  // Mettre à jour une entrée
  const updateEntry = useCallback(
    async (id: string, data: Partial<SleepEntry>) => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.sleep.update(id, data)
        } else {
          // Mode développement - localStorage
          const updated = entries.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
          )
          localStorage.setItem('sleepEntries', JSON.stringify(updated))
        }

        await refreshEntries()
      } catch (err) {
        setError("Erreur lors de la mise à jour de l'entrée")
        console.error(err)
        throw err
      }
    },
    [entries, refreshEntries]
  )

  // Supprimer une entrée
  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.sleep.delete(id)
        } else {
          // Mode développement - localStorage
          const updated = entries.filter((e) => e.id !== id)
          localStorage.setItem('sleepEntries', JSON.stringify(updated))
        }

        await refreshEntries()
      } catch (err) {
        setError("Erreur lors de la suppression de l'entrée")
        console.error(err)
        throw err
      }
    },
    [entries, refreshEntries]
  )

  // Filtrer par plage de dates
  const getEntriesByDateRange = useCallback(
    (startDate: string, endDate: string): SleepEntry[] => {
      return entries.filter((e) => e.date >= startDate && e.date <= endDate)
    },
    [entries]
  )

  return {
    entries,
    isLoading,
    error,
    addEntry,
    addMultipleEntries,
    updateEntry,
    deleteEntry,
    getEntriesByDateRange,
    refreshEntries,
  }
}

// Hook pour créer une nouvelle entrée avec valeurs par défaut
export function useNewSleepEntry() {
  const [sleepType, setSleepType] = useState<SleepType>('nocturne')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [bedTime, setBedTime] = useState('22:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepQuality, setSleepQuality] = useState<QualityLevel>(3)
  const [wakeQuality, setWakeQuality] = useState<QualityLevel>(3)

  const reset = () => {
    setSleepType('nocturne')
    setDate(new Date().toISOString().split('T')[0])
    setBedTime('22:00')
    setWakeTime('07:00')
    setSleepQuality(3)
    setWakeQuality(3)
  }

  const getEntry = (): Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'> => ({
    sleepType,
    date,
    bedTime,
    wakeTime,
    sleepQuality,
    wakeQuality,
  })

  return {
    sleepType,
    setSleepType,
    date,
    setDate,
    bedTime,
    setBedTime,
    wakeTime,
    setWakeTime,
    sleepQuality,
    setSleepQuality,
    wakeQuality,
    setWakeQuality,
    reset,
    getEntry,
  }
}
