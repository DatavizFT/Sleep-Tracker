// Types de sommeil disponibles
export type SleepType = 'nocturne' | 'sieste' | 'somnolence' | 'rattrapage'

// Niveau de qualité (1 = très mauvais, 5 = très bon)
export type QualityLevel = 1 | 2 | 3 | 4 | 5

// Entrée de sommeil
export interface SleepEntry {
  id: string
  date: string // Format ISO YYYY-MM-DD
  sleepType: SleepType
  bedTime: string // Format HH:mm
  wakeTime: string // Format HH:mm
  sleepQuality: QualityLevel
  wakeQuality: QualityLevel
  createdAt: string
  updatedAt: string
}

// Entrée d'humeur (pour usage futur)
export interface MoodEntry {
  id: string
  date: string
  mood: QualityLevel
  fatigue: QualityLevel
  notes?: string
  createdAt: string
  updatedAt: string
}

// Entrée d'agenda (pour usage futur)
export interface AgendaEntry {
  id: string
  date: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

// Labels pour les types de sommeil
export const SLEEP_TYPE_LABELS: Record<SleepType, string> = {
  nocturne: 'Sommeil nocturne',
  sieste: 'Sieste',
  somnolence: 'Somnolence',
  rattrapage: 'Rattrapage nocturne',
}

// Labels pour les niveaux de qualité
export const QUALITY_LABELS: Record<QualityLevel, string> = {
  1: 'Très mauvais',
  2: 'Mauvais',
  3: 'Moyen',
  4: 'Bon',
  5: 'Très bon',
}

// Couleurs pour les types de sommeil (pour les graphiques)
export const SLEEP_TYPE_COLORS: Record<SleepType, string> = {
  nocturne: '#6366f1',
  sieste: '#22c55e',
  somnolence: '#f59e0b',
  rattrapage: '#8b5cf6',
}

// Onglets de navigation
export type TabType = 'sleep' | 'mood' | 'agenda'

export interface Tab {
  id: TabType
  label: string
  icon: string
}
