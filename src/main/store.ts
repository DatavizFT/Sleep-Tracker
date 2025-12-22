import Store from 'electron-store'
import CryptoJS from 'crypto-js'
import { machineIdSync } from 'node-machine-id'
import type { SleepEntry, MoodEntry, AgendaEntry } from '../renderer/types'

// Génère une clé de chiffrement basée sur l'ID machine
function getEncryptionKey(): string {
  try {
    const machineId = machineIdSync()
    return CryptoJS.SHA256(machineId + 'sleep-tracker-secret').toString()
  } catch {
    // Fallback si node-machine-id ne fonctionne pas
    return CryptoJS.SHA256('sleep-tracker-fallback-key').toString()
  }
}

interface StoreData {
  sleepEntries: SleepEntry[]
  moodEntries: MoodEntry[]
  agendaEntries: AgendaEntry[]
}

const encryptionKey = getEncryptionKey()

// Store avec chiffrement
const store = new Store<StoreData>({
  name: 'sleep-tracker-data',
  encryptionKey: encryptionKey,
  defaults: {
    sleepEntries: [],
    moodEntries: [],
    agendaEntries: [],
  },
})

// API pour les entrées de sommeil
export const sleepStore = {
  getAll(): SleepEntry[] {
    return store.get('sleepEntries', [])
  },

  save(entry: SleepEntry): void {
    const entries = this.getAll()
    entries.push(entry)
    store.set('sleepEntries', entries)
  },

  update(id: string, data: Partial<SleepEntry>): void {
    const entries = this.getAll()
    const index = entries.findIndex((e) => e.id === id)
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data, updatedAt: new Date().toISOString() }
      store.set('sleepEntries', entries)
    }
  },

  delete(id: string): void {
    const entries = this.getAll().filter((e) => e.id !== id)
    store.set('sleepEntries', entries)
  },

  getByDateRange(startDate: string, endDate: string): SleepEntry[] {
    return this.getAll().filter((e) => e.date >= startDate && e.date <= endDate)
  },
}

// API pour les entrées d'humeur
export const moodStore = {
  getAll(): MoodEntry[] {
    return store.get('moodEntries', [])
  },

  save(entry: MoodEntry): void {
    const entries = this.getAll()
    entries.push(entry)
    store.set('moodEntries', entries)
  },

  update(id: string, data: Partial<MoodEntry>): void {
    const entries = this.getAll()
    const index = entries.findIndex((e) => e.id === id)
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data, updatedAt: new Date().toISOString() }
      store.set('moodEntries', entries)
    }
  },

  delete(id: string): void {
    const entries = this.getAll().filter((e) => e.id !== id)
    store.set('moodEntries', entries)
  },
}

// API pour les entrées d'agenda
export const agendaStore = {
  getAll(): AgendaEntry[] {
    return store.get('agendaEntries', [])
  },

  save(entry: AgendaEntry): void {
    const entries = this.getAll()
    entries.push(entry)
    store.set('agendaEntries', entries)
  },

  update(id: string, data: Partial<AgendaEntry>): void {
    const entries = this.getAll()
    const index = entries.findIndex((e) => e.id === id)
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data, updatedAt: new Date().toISOString() }
      store.set('agendaEntries', entries)
    }
  },

  delete(id: string): void {
    const entries = this.getAll().filter((e) => e.id !== id)
    store.set('agendaEntries', entries)
  },
}

export { store }
