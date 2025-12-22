import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { SleepEntry, SleepType, QualityLevel } from '../../../types'
import { SLEEP_TYPE_COLORS, SLEEP_TYPE_LABELS, QUALITY_LABELS } from '../../../types'
import { calculateSleepDuration } from '../../../utils/dateUtils'

interface SleepPieChartsProps {
  entries: SleepEntry[]
}

type FilterType = 'global' | 'nocturne' | 'rattrapage' | 'sieste'

const QUALITY_COLORS: Record<QualityLevel, string> = {
  1: '#ef4444', // Rouge - Très mauvais
  2: '#f97316', // Orange - Mauvais
  3: '#eab308', // Jaune - Moyen
  4: '#22c55e', // Vert - Bon
  5: '#10b981', // Vert foncé - Très bon
}

const FILTER_LABELS: Record<FilterType, string> = {
  global: 'Global',
  nocturne: 'Sommeil nocturne',
  rattrapage: 'Rattrapage nocturne',
  sieste: 'Sieste',
}

export function SleepPieCharts({ entries }: SleepPieChartsProps) {
  const [filter, setFilter] = useState<FilterType>('global')

  // Filtrer les entrées selon le type sélectionné
  const filteredEntries = filter === 'global' 
    ? entries 
    : entries.filter(entry => entry.sleepType === filter)

  // Calculer les données pour chaque pie chart

  // 1. Répartition par type de sommeil (basé sur la durée) - uniquement en mode global
  const sleepTypeData: Record<SleepType, number> = {
    nocturne: 0,
    sieste: 0,
    somnolence: 0,
    rattrapage: 0,
  }

  filteredEntries.forEach((entry) => {
    const duration = calculateSleepDuration(entry.bedTime, entry.wakeTime)
    sleepTypeData[entry.sleepType] += duration
  })

  const sleepTypePieData = (Object.keys(sleepTypeData) as SleepType[])
    .filter((type) => sleepTypeData[type] > 0)
    .map((type) => ({
      name: SLEEP_TYPE_LABELS[type],
      value: Math.round(sleepTypeData[type] / 60 * 10) / 10, // En heures
      itemStyle: { color: SLEEP_TYPE_COLORS[type] },
    }))

  // 2. Distribution qualité de sommeil
  const sleepQualityData: Record<QualityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  filteredEntries.forEach((entry) => {
    sleepQualityData[entry.sleepQuality]++
  })

  const sleepQualityPieData = ([1, 2, 3, 4, 5] as QualityLevel[])
    .filter((level) => sleepQualityData[level] > 0)
    .map((level) => ({
      name: QUALITY_LABELS[level],
      value: sleepQualityData[level],
      itemStyle: { color: QUALITY_COLORS[level] },
    }))

  // 3. Distribution qualité de réveil
  const wakeQualityData: Record<QualityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  filteredEntries.forEach((entry) => {
    wakeQualityData[entry.wakeQuality]++
  })

  const wakeQualityPieData = ([1, 2, 3, 4, 5] as QualityLevel[])
    .filter((level) => wakeQualityData[level] > 0)
    .map((level) => ({
      name: QUALITY_LABELS[level],
      value: wakeQualityData[level],
      itemStyle: { color: QUALITY_COLORS[level] },
    }))

  const createPieOption = (title: string, data: Array<{ name: string; value: number; itemStyle: { color: string } }>, unit: string = '') => ({
    backgroundColor: 'transparent',
    title: {
      text: title,
      left: 'center',
      textStyle: { color: '#f1f5f9', fontSize: 14, fontWeight: 'normal' },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${params.value}${unit} (${params.percent}%)`,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          color: '#94a3b8',
          fontSize: 11,
          formatter: '{b}: {d}%',
        },
        labelLine: {
          lineStyle: { color: '#475569' },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data,
      },
    ],
  })

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Pas assez de données pour afficher les graphiques
      </div>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(['global', 'nocturne', 'rattrapage', 'sieste'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === filterType
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600'
              }`}
            >
              {FILTER_LABELS[filterType]}
            </button>
          ))}
        </div>
        <div className="h-64 flex items-center justify-center text-dark-400">
          Pas de données pour ce type de sommeil
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['global', 'nocturne', 'rattrapage', 'sieste'] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {FILTER_LABELS[filterType]}
          </button>
        ))}
      </div>

      {/* Graphiques */}
      <div className={`grid gap-6 ${filter === 'global' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'}`}>
        {/* Afficher le graphique des types uniquement en mode global */}
        {filter === 'global' && (
          <div className="bg-dark-750 rounded-lg p-4">
            <ReactECharts
              option={createPieOption('Types de sommeil', sleepTypePieData, 'h')}
              style={{ height: '250px' }}
            />
          </div>
        )}
        <div className="bg-dark-750 rounded-lg p-4">
          <ReactECharts
            option={createPieOption('Qualité du sommeil', sleepQualityPieData)}
            style={{ height: '250px' }}
          />
        </div>
        <div className="bg-dark-750 rounded-lg p-4">
          <ReactECharts
            option={createPieOption('Qualité du réveil', wakeQualityPieData)}
            style={{ height: '250px' }}
          />
        </div>
      </div>
    </div>
  )
}
