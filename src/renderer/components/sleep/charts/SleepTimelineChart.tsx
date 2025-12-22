import ReactECharts from 'echarts-for-react'
import type { SleepEntry } from '../../../types'
import { SLEEP_TYPE_COLORS, SLEEP_TYPE_LABELS } from '../../../types'
import { formatDate, timeToDecimal, getNightDate, formatNightDate, getLastNDays } from '../../../utils/dateUtils'

interface SleepTimelineChartProps {
  entries: SleepEntry[]
  days?: number
}

export function SleepTimelineChart({ entries, days = 30 }: SleepTimelineChartProps) {
  // Fonction pour ajuster l'heure à l'échelle 20h-20h
  const adjustTimeFor20hScale = (time: string): number => {
    const decimal = timeToDecimal(time)
    // Si l'heure est entre 00h et 20h, ajouter 24 (jour suivant)
    // Si l'heure est entre 20h et 24h, garder tel quel
    return decimal < 20 ? decimal + 24 : decimal
  }

  // Obtenir les N derniers jours
  const allDates = getLastNDays(days)

  // Grouper les entrées par date de nuit
  const entriesByNight = entries.reduce((acc, entry) => {
    const nightDate = getNightDate(entry.date, entry.bedTime, entry.sleepType)
    if (!acc[nightDate]) {
      acc[nightDate] = []
    }
    acc[nightDate].push(entry)
    return acc
  }, {} as Record<string, SleepEntry[]>)

  // Préparer les données pour le graphique custom
  const seriesData = allDates.flatMap((date, dateIndex) => {
    const dayEntries = entriesByNight[date] || []
    return dayEntries.map((entry) => {
      const bedTime = adjustTimeFor20hScale(entry.bedTime)
      const wakeTime = adjustTimeFor20hScale(entry.wakeTime)
      
      return {
        name: date,
        value: [dateIndex, bedTime, wakeTime],
        itemStyle: {
          color: SLEEP_TYPE_COLORS[entry.sleepType],
        },
        entry,
      }
    })
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        const entry = params.data.entry as SleepEntry
        return `
          <div style="padding: 8px">
            <div style="font-weight: bold; margin-bottom: 4px">${formatNightDate(params.data.name)}</div>
            <div>Type: ${SLEEP_TYPE_LABELS[entry.sleepType]}</div>
            <div>Coucher: <strong>${entry.bedTime}</strong></div>
            <div>Réveil: <strong>${entry.wakeTime}</strong></div>
            <div>Qualité sommeil: ${entry.sleepQuality}/5</div>
            <div>Qualité réveil: ${entry.wakeQuality}/5</div>
          </div>
        `
      },
    },
    legend: {
      data: ['Nocturne', 'Sieste', 'Rattrapage', 'Somnolence'],
      textStyle: { color: '#94a3b8' },
      top: 0,
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '12%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: allDates.map((date) => formatDate(date, 'dd/MM')),
      axisLabel: {
        color: '#64748b',
        rotate: 45,
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 20,
      max: 44,
      interval: 2,
      inverse: true,
      axisLabel: {
        color: '#64748b',
        formatter: (value: number) => {
          const hours = value >= 24 ? value - 24 : value
          return `${Math.floor(hours).toString().padStart(2, '0')}:00`
        },
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const xValue = api.value(0)
          const start = api.value(1)
          const end = api.value(2)
          const width = api.size([1, 0])[0] * 0.6

          const startPoint = api.coord([xValue, start])
          const endPoint = api.coord([xValue, end])
          const rectShape = {
            x: startPoint[0] - width / 2,
            y: endPoint[1],
            width: width,
            height: startPoint[1] - endPoint[1],
          }

          // Récupérer la couleur depuis les données de l'item
          const itemData = seriesData[params.dataIndex]
          const color = itemData?.itemStyle?.color || '#6366f1'

          return {
            type: 'rect',
            shape: rectShape,
            style: {
              fill: color,
            },
          }
        },
        encode: {
          x: 0,
          y: [1, 2],
        },
        data: seriesData,
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

  return <ReactECharts option={option} style={{ height: '400px' }} />
}

