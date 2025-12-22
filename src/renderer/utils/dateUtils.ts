import { format, parseISO, differenceInMinutes, addDays, subDays, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

// Seuil horaire pour définir une "nuit" (20h = début de la nuit)
const NIGHT_THRESHOLD_HOUR = 20

/**
 * Formate une date ISO en format lisible
 */
export function formatDate(dateString: string, formatStr: string = 'dd/MM/yyyy'): string {
  return format(parseISO(dateString), formatStr, { locale: fr })
}

/**
 * Retourne la date du jour au format ISO
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Calcule la durée de sommeil en minutes
 * Gère le cas où l'heure de réveil est le lendemain
 */
export function calculateSleepDuration(bedTime: string, wakeTime: string): number {
  const today = startOfDay(new Date())

  const bedDateTime = new Date(`${format(today, 'yyyy-MM-dd')}T${bedTime}:00`)
  let wakeDateTime = new Date(`${format(today, 'yyyy-MM-dd')}T${wakeTime}:00`)

  // Si l'heure de réveil est avant l'heure de coucher, c'est le lendemain
  if (wakeDateTime <= bedDateTime) {
    wakeDateTime = addDays(wakeDateTime, 1)
  }

  return differenceInMinutes(wakeDateTime, bedDateTime)
}

/**
 * Formate une durée en minutes en format lisible (Xh Ymin)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}min`
  }
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

/**
 * Convertit une heure HH:mm en décimal pour les graphiques
 * Ex: "14:30" -> 14.5
 */
export function timeToDecimal(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

/**
 * Génère un tableau de dates pour les N derniers jours
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(format(date, 'yyyy-MM-dd'))
  }

  return dates
}

/**
 * Formate une heure pour l'affichage
 */
export function formatTime(time: string): string {
  return time
}

/**
 * Calcule la "date de nuit" pour une entrée de sommeil.
 * Pour le sommeil nocturne : une nuit s'étend de 20h à 20h le lendemain.
 * Si le coucher est avant 20h, l'entrée appartient à la nuit précédente.
 * Pour les autres types (sieste, rattrapage, somnolence) : on garde la date saisie.
 */
export function getNightDate(date: string, bedTime: string, sleepType: string = 'nocturne'): string {
  // Pour les siestes, rattrapages et somnolences, on garde la date saisie
  if (sleepType !== 'nocturne') {
    return date
  }
  
  // Pour le sommeil nocturne, on applique la logique de nuit 20h-20h
  const [hours] = bedTime.split(':').map(Number)
  if (hours < NIGHT_THRESHOLD_HOUR) {
    return format(subDays(parseISO(date), 1), 'yyyy-MM-dd')
  }
  return date
}

/**
 * Retourne la date par défaut pour le formulaire de saisie.
 * Avant 20h → date de la veille (on saisit probablement la nuit passée)
 * Après 20h → date du jour (on va saisir la nuit en cours)
 */
export function getDefaultNightDate(): string {
  const now = new Date()
  if (now.getHours() < NIGHT_THRESHOLD_HOUR) {
    return format(subDays(now, 1), 'yyyy-MM-dd')
  }
  return format(now, 'yyyy-MM-dd')
}

/**
 * Formate une date de nuit pour l'affichage : "Nuit du 21 au 22 déc. 2025"
 */
export function formatNightDate(nightDate: string): string {
  const startDate = parseISO(nightDate)
  const endDate = addDays(startDate, 1)
  const startDay = format(startDate, 'd')
  const endDay = format(endDate, 'd')
  const month = format(endDate, 'MMM', { locale: fr })
  const year = format(endDate, 'yyyy')
  return `Nuit du ${startDay} au ${endDay} ${month} ${year}`
}
