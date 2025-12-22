import { contextBridge, ipcRenderer } from 'electron'
import type { SleepEntry, MoodEntry, AgendaEntry } from '../renderer/types'

// API exposée au renderer de manière sécurisée
const electronAPI = {
  // API Sommeil
  sleep: {
    getAll: (): Promise<SleepEntry[]> => ipcRenderer.invoke('sleep:getAll'),
    save: (entry: SleepEntry): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('sleep:save', entry),
    update: (id: string, data: Partial<SleepEntry>): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('sleep:update', id, data),
    delete: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('sleep:delete', id),
    getByDateRange: (startDate: string, endDate: string): Promise<SleepEntry[]> =>
      ipcRenderer.invoke('sleep:getByDateRange', startDate, endDate),
  },

  // API Humeur
  mood: {
    getAll: (): Promise<MoodEntry[]> => ipcRenderer.invoke('mood:getAll'),
    save: (entry: MoodEntry): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('mood:save', entry),
    update: (id: string, data: Partial<MoodEntry>): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('mood:update', id, data),
    delete: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('mood:delete', id),
  },

  // API Agenda
  agenda: {
    getAll: (): Promise<AgendaEntry[]> => ipcRenderer.invoke('agenda:getAll'),
    save: (entry: AgendaEntry): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('agenda:save', entry),
    update: (id: string, data: Partial<AgendaEntry>): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('agenda:update', id, data),
    delete: (id: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('agenda:delete', id),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Types pour TypeScript côté renderer
export type ElectronAPI = typeof electronAPI
