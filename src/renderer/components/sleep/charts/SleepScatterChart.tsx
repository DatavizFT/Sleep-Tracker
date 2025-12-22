import ReactECharts from 'echarts-for-react'
import type { SleepEntry } from '../../../types'
import { SLEEP_TYPE_COLORS, SLEEP_TYPE_LABELS } from '../../../types'
import { formatDate, timeToDecimal, getNightDate, formatNightDate } from '../../../utils/dateUtils'

interface SleepScatterChartProps {
  entries: SleepEntry[]
}

export function SleepScatterChart({ entries }: SleepScatterChartProps) {
  // Fonction pour ajuster l'heure à l'échelle 20h-20h
  const adjustTimeFor20hScale = (time: string): number => {
    const decimal = timeToDecimal(time)
    // Si l'heure est entre 00h et 20h, ajouter 24 (jour suivant)
    // Si l'heure est entre 20h et 24h, garder tel quel
    return decimal < 20 ? decimal + 24 : decimal
  }

  // Préparer les données pour le scatter plot (utiliser la date de nuit)
  const bedTimeData = entries.map((entry) => ({
    value: [getNightDate(entry.date, entry.bedTime, entry.sleepType), adjustTimeFor20hScale(entry.bedTime)],
    itemStyle: { color: SLEEP_TYPE_COLORS[entry.sleepType] },
    entry,
  }))

  const wakeTimeData = entries.map((entry) => ({
    value: [getNightDate(entry.date, entry.bedTime, entry.sleepType), adjustTimeFor20hScale(entry.wakeTime)],
    itemStyle: { color: SLEEP_TYPE_COLORS[entry.sleepType] },
    entry,
  }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: { data: { entry: SleepEntry; value: [string, number] }; seriesName: string }) => {
        const entry = params.data.entry
        const nightDate = getNightDate(entry.date, entry.bedTime, entry.sleepType)
        const type = params.seriesName === 'Coucher' ? 'Heure de coucher' : 'Heure de réveil'
        return `
          <div style="padding: 8px">
            <div style="font-weight: bold; margin-bottom: 4px">${formatNightDate(nightDate)}</div>
            <div>${type}: <strong>${params.seriesName === 'Coucher' ? entry.bedTime : entry.wakeTime}</strong></div>
            <div>Type: ${SLEEP_TYPE_LABELS[entry.sleepType]}</div>
          </div>
        `
      },
    },
    legend: {
      data: ['Coucher', 'Réveil'],
      textStyle: { color: '#94a3b8' },
      top: 0,
    },
    grid: {
      left: '10%',
      right: '5%',
      top: '15%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: [...new Set(entries.map((e) => getNightDate(e.date, e.bedTime, e.sleepType)))].sort(),
      axisLabel: {
        color: '#64748b',
        rotate: 45,
        formatter: (value: string) => formatDate(value, 'dd/MM'),
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 20,
      max: 44,
      interval: 2,
      axisLabel: {
        color: '#64748b',
        formatter: (value: number) => {
          // Convertir les valeurs 20-44 en heures 20h-20h
          const hours = value >= 24 ? value - 24 : value
          return `${Math.floor(hours).toString().padStart(2, '0')}:00`
        },
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        name: 'Coucher',
        type: 'scatter',
        symbolSize: 12,
        data: bedTimeData,
        itemStyle: { color: '#6366f1' },
      },
      {
        name: 'Réveil',
        type: 'scatter',
        symbolSize: 12,
        symbol: 'diamond',
        data: wakeTimeData,
        itemStyle: { color: '#f59e0b' },
      },
    ],
  }

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Pas assez de données pour afficher le graphique
      </div>
    )
  }

  return <ReactECharts option={option} style={{ height: '300px' }} />
}
