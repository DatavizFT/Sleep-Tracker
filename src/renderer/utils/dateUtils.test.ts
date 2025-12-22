import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateSleepDuration,
  formatDuration,
  timeToDecimal,
  getTodayISO,
  getLastNDays,
  getNightDate,
  getDefaultNightDate,
  formatNightDate,
} from './dateUtils'

describe('dateUtils', () => {
  describe('calculateSleepDuration', () => {
    it('calcule correctement une durée de sommeil normale', () => {
      const duration = calculateSleepDuration('22:00', '07:00')
      expect(duration).toBe(540) // 9 heures = 540 minutes
    })

    it('gère le cas où le réveil est le lendemain', () => {
      const duration = calculateSleepDuration('23:30', '06:30')
      expect(duration).toBe(420) // 7 heures = 420 minutes
    })

    it('gère une sieste dans la journée', () => {
      const duration = calculateSleepDuration('14:00', '15:30')
      expect(duration).toBe(90) // 1h30 = 90 minutes
    })

    it('gère le cas minuit', () => {
      const duration = calculateSleepDuration('23:00', '00:00')
      expect(duration).toBe(60) // 1 heure
    })
  })

  describe('formatDuration', () => {
    it('formate les heures et minutes', () => {
      expect(formatDuration(540)).toBe('9h')
      expect(formatDuration(90)).toBe('1h 30min')
      expect(formatDuration(45)).toBe('45min')
    })

    it('gère le cas 0 minutes', () => {
      expect(formatDuration(0)).toBe('0min')
    })

    it('gère les heures exactes', () => {
      expect(formatDuration(120)).toBe('2h')
      expect(formatDuration(480)).toBe('8h')
    })
  })

  describe('timeToDecimal', () => {
    it('convertit correctement les heures en décimal', () => {
      expect(timeToDecimal('14:30')).toBe(14.5)
      expect(timeToDecimal('22:00')).toBe(22)
      expect(timeToDecimal('07:15')).toBe(7.25)
      expect(timeToDecimal('00:00')).toBe(0)
    })
  })

  describe('getTodayISO', () => {
    it('retourne la date au format ISO', () => {
      const today = getTodayISO()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('getLastNDays', () => {
    it('retourne le bon nombre de jours', () => {
      const days = getLastNDays(7)
      expect(days).toHaveLength(7)
    })

    it('les dates sont au format ISO', () => {
      const days = getLastNDays(3)
      days.forEach((day) => {
        expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('les dates sont triées chronologiquement', () => {
      const days = getLastNDays(5)
      for (let i = 1; i < days.length; i++) {
        expect(days[i] >= days[i - 1]).toBe(true)
      }
    })
  })

  describe('getNightDate', () => {
    it('retourne la même date si coucher >= 20h pour sommeil nocturne', () => {
      expect(getNightDate('2025-12-22', '22:00', 'nocturne')).toBe('2025-12-22')
      expect(getNightDate('2025-12-22', '20:00', 'nocturne')).toBe('2025-12-22')
      expect(getNightDate('2025-12-22', '23:30', 'nocturne')).toBe('2025-12-22')
    })

    it('retourne la veille si coucher < 20h pour sommeil nocturne', () => {
      expect(getNightDate('2025-12-22', '07:00', 'nocturne')).toBe('2025-12-21')
      expect(getNightDate('2025-12-22', '14:00', 'nocturne')).toBe('2025-12-21')
      expect(getNightDate('2025-12-22', '19:59', 'nocturne')).toBe('2025-12-21')
    })

    it('retourne toujours la date saisie pour sieste, rattrapage et somnolence', () => {
      expect(getNightDate('2025-12-22', '07:00', 'sieste')).toBe('2025-12-22')
      expect(getNightDate('2025-12-22', '14:00', 'sieste')).toBe('2025-12-22')
      expect(getNightDate('2025-12-22', '05:00', 'rattrapage')).toBe('2025-12-22')
      expect(getNightDate('2025-12-22', '16:00', 'somnolence')).toBe('2025-12-22')
    })

    it('gère le changement de mois pour sommeil nocturne', () => {
      expect(getNightDate('2025-01-01', '07:00', 'nocturne')).toBe('2024-12-31')
    })

    it('gère le changement d\'année pour sommeil nocturne', () => {
      expect(getNightDate('2025-01-01', '22:00', 'nocturne')).toBe('2025-01-01')
    })
  })

  describe('getDefaultNightDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('retourne la veille si on est avant 20h', () => {
      vi.setSystemTime(new Date('2025-12-22T08:00:00'))
      expect(getDefaultNightDate()).toBe('2025-12-21')
    })

    it('retourne la veille si on est à 19h59', () => {
      vi.setSystemTime(new Date('2025-12-22T19:59:00'))
      expect(getDefaultNightDate()).toBe('2025-12-21')
    })

    it('retourne le jour même si on est à 20h ou après', () => {
      vi.setSystemTime(new Date('2025-12-22T20:00:00'))
      expect(getDefaultNightDate()).toBe('2025-12-22')
    })

    it('retourne le jour même si on est à 23h', () => {
      vi.setSystemTime(new Date('2025-12-22T23:00:00'))
      expect(getDefaultNightDate()).toBe('2025-12-22')
    })
  })

  describe('formatNightDate', () => {
    it('formate correctement une nuit standard', () => {
      const result = formatNightDate('2025-12-21')
      expect(result).toContain('21')
      expect(result).toContain('22')
      expect(result).toContain('Nuit du')
    })

    it('gère le changement de mois', () => {
      const result = formatNightDate('2025-12-31')
      expect(result).toContain('31')
      expect(result).toContain('1')
    })
  })
})
