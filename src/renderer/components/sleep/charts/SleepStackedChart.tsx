import ReactECharts from 'echarts-for-react'
import type { SleepEntry, SleepType } from '../../../types'
import { SLEEP_TYPE_COLORS, SLEEP_TYPE_LABELS } from '../../../types'
import { formatDate, calculateSleepDuration, getLastNDays, getNightDate } from '../../../utils/dateUtils'

interface SleepStackedChartProps {
  entries: SleepEntry[]
  days?: number
}

export function SleepStackedChart({ entries, days = 30 }: SleepStackedChartProps) {
  const dates = getLastNDays(days)
  const sleepTypes: SleepType[] = ['nocturne', 'sieste', 'somnolence', 'rattrapage']

  // Calculer les durées par jour et par type
  const dataByDateAndType: Record<string, Record<SleepType, number>> = {}

  dates.forEach((date) => {
    dataByDateAndType[date] = {
      nocturne: 0,
      sieste: 0,
      somnolence: 0,
      rattrapage: 0,
    }
  })

  entries.forEach((entry) => {
    // Utiliser la date de nuit (période 20h-20h) pour l'agrégation
    const nightDate = getNightDate(entry.date, entry.bedTime, entry.sleepType)
    if (dataByDateAndType[nightDate]) {
      const duration = calculateSleepDuration(entry.bedTime, entry.wakeTime) / 60 // En heures
      dataByDateAndType[nightDate][entry.sleepType] += duration
    }
  })

  // Calculer la moyenne mobile sur 7 jours
  const totalByDate = dates.map((date) => {
    const dayData = dataByDateAndType[date]
    return sleepTypes.reduce((sum, type) => sum + dayData[type], 0)
  })

  const movingAverage = totalByDate.map((_, index) => {
    const start = Math.max(0, index - 6)
    const values = totalByDate.slice(start, index + 1)
    const sum = values.reduce((a, b) => a + b, 0)
    return sum / values.length
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ seriesName: string; value: number; color: string; name?: string }>) => {
        const date = params[0]?.name ?? ''
        let html = `<div style="padding: 8px"><div style="font-weight: bold; margin-bottom: 8px">${date}</div>`
        let total = 0

        params.forEach((param) => {
          if (param.seriesName !== 'Moyenne 7j' && param.value > 0) {
            total += param.value
            html += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${param.color}"></span>
              <span>${param.seriesName}: ${param.value.toFixed(1)}h</span>
            </div>`
          }
        })

        html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155; font-weight: bold">Total: ${total.toFixed(1)}h</div></div>`
        return html
      },
    },
    legend: {
      data: [...sleepTypes.map((t) => SLEEP_TYPE_LABELS[t]), 'Moyenne 7j'],
      textStyle: { color: '#94a3b8' },
      top: 0,
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '15%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: dates.map((d) => formatDate(d, 'dd/MM')),
      axisLabel: {
        color: '#64748b',
        rotate: 45,
        interval: Math.floor(days / 10),
      },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'value',
      name: 'Heures',
      nameTextStyle: { color: '#64748b' },
      axisLabel: {
        color: '#64748b',
        formatter: '{value}h',
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      ...sleepTypes.map((type) => ({
        name: SLEEP_TYPE_LABELS[type],
        type: 'bar',
        stack: 'total',
        itemStyle: { color: SLEEP_TYPE_COLORS[type] },
        emphasis: { focus: 'series' },
        data: dates.map((date) => Number(dataByDateAndType[date][type].toFixed(2))),
      })),
      {
        name: 'Moyenne 7j',
        type: 'line',
        data: movingAverage.map((v) => Number(v.toFixed(2))),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#f43f5e',
          width: 2,
          type: 'dashed',
        },
        itemStyle: { color: '#f43f5e' },
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

  return <ReactECharts option={option} style={{ height: '350px' }} />
}
