import type { SleepEntry, MoodEntry, AgendaEntry } from './types'

export interface ElectronAPI {
  sleep: {
    getAll: () => Promise<SleepEntry[]>
    save: (entry: SleepEntry) => Promise<{ success: boolean }>
    update: (id: string, data: Partial<SleepEntry>) => Promise<{ success: boolean }>
    delete: (id: string) => Promise<{ success: boolean }>
    getByDateRange: (startDate: string, endDate: string) => Promise<SleepEntry[]>
  }
  mood: {
    getAll: () => Promise<MoodEntry[]>
    save: (entry: MoodEntry) => Promise<{ success: boolean }>
    update: (id: string, data: Partial<MoodEntry>) => Promise<{ success: boolean }>
    delete: (id: string) => Promise<{ success: boolean }>
  }
  agenda: {
    getAll: () => Promise<AgendaEntry[]>
    save: (entry: AgendaEntry) => Promise<{ success: boolean }>
    update: (id: string, data: Partial<AgendaEntry>) => Promise<{ success: boolean }>
    delete: (id: string) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
