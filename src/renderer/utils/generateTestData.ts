import { v4 as uuidv4 } from 'uuid'
import type { SleepEntry, QualityLevel } from '../types'

// Fonction pour générer un nombre aléatoire entre min et max
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Fonction pour générer un entier aléatoire entre min et max (inclus)
function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Fonction pour formater les minutes en HH:mm
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const mins = Math.floor(minutes % 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Fonction pour générer une qualité aléatoire (favorisant les bonnes qualités)
function randomQuality(): QualityLevel {
  const rand = Math.random()
  if (rand < 0.05) return 1 // 5% très mauvais
  if (rand < 0.15) return 2 // 10% mauvais
  if (rand < 0.40) return 3 // 25% moyen
  if (rand < 0.75) return 4 // 35% bon
  return 5 // 25% très bon
}

// Fonction pour générer des données de test pour les N derniers jours
export function generateTestData(days: number = 30): Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[] {
  const entries: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // 1. Sommeil nocturne (obligatoire, 3h à 5h)
    const sleepDuration = randomBetween(180, 300) // 3h à 5h en minutes
    const bedTimeMinutes = randomBetween(22 * 60, 24 * 60) // Entre 22h et minuit
    const wakeTimeMinutes = bedTimeMinutes + sleepDuration

    entries.push({
      date: dateStr,
      sleepType: 'nocturne',
      bedTime: minutesToTime(bedTimeMinutes),
      wakeTime: minutesToTime(wakeTimeMinutes),
      sleepQuality: randomQuality(),
      wakeQuality: randomQuality(),
    })

    // 2. Rattrapage nocturne (30% de probabilité, 1h à 2h entre 5h et 7h)
    if (Math.random() < 0.3) {
      const catchupDuration = randomBetween(60, 120) // 1h à 2h
      const catchupBedTime = randomBetween(5 * 60, 6 * 60) // Entre 5h et 6h
      const catchupWakeTime = catchupBedTime + catchupDuration

      entries.push({
        date: dateStr,
        sleepType: 'rattrapage',
        bedTime: minutesToTime(catchupBedTime),
        wakeTime: minutesToTime(catchupWakeTime),
        sleepQuality: randomQuality(),
        wakeQuality: randomQuality(),
      })
    }

    // 3. Sieste (70% de probabilité, 30min à 1h30 entre 12h30 et 15h)
    if (Math.random() < 0.7) {
      const napDuration = randomBetween(30, 90) // 30min à 1h30
      const napBedTime = randomBetween(12.5 * 60, 14 * 60) // Entre 12h30 et 14h
      const napWakeTime = napBedTime + napDuration

      entries.push({
        date: dateStr,
        sleepType: 'sieste',
        bedTime: minutesToTime(napBedTime),
        wakeTime: minutesToTime(napWakeTime),
        sleepQuality: randomQuality(),
        wakeQuality: randomQuality(),
      })
    }
  }

  return entries
}

// Fonction pour insérer les données de test dans le système
export async function insertTestData(days: number = 30): Promise<void> {
  const testEntries = generateTestData(days)
  const now = new Date().toISOString()

  const fullEntries: SleepEntry[] = testEntries.map((entry) => ({
    ...entry,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  }))

  if (window.electronAPI) {
    // Mode Electron
    for (const entry of fullEntries) {
      await window.electronAPI.sleep.save(entry)
    }
    console.log(`✅ ${fullEntries.length} entrées de test insérées via Electron`)
  } else {
    // Mode développement - localStorage
    const existing = localStorage.getItem('sleepEntries')
    const existingEntries: SleepEntry[] = existing ? JSON.parse(existing) : []
    const allEntries = [...existingEntries, ...fullEntries]
    localStorage.setItem('sleepEntries', JSON.stringify(allEntries))
    console.log(`✅ ${fullEntries.length} entrées de test insérées dans localStorage`)
  }
}

// Fonction pour effacer toutes les données
export async function clearAllData(): Promise<void> {
  if (window.electronAPI) {
    const entries = await window.electronAPI.sleep.getAll()
    for (const entry of entries) {
      await window.electronAPI.sleep.delete(entry.id)
    }
    console.log(`🗑️ ${entries.length} entrées supprimées via Electron`)
  } else {
    localStorage.removeItem('sleepEntries')
    console.log('🗑️ Toutes les entrées supprimées du localStorage')
  }
}

// Exposer les fonctions dans le scope global pour les appeler depuis la console
if (typeof window !== 'undefined') {
  ;(window as any).generateTestData = generateTestData
  ;(window as any).insertTestData = insertTestData
  ;(window as any).clearAllData = clearAllData
  console.log('💡 Fonctions de test disponibles dans la console:')
  console.log('  - insertTestData(30) : Générer 30 jours de données')
  console.log('  - clearAllData() : Effacer toutes les données')
}
