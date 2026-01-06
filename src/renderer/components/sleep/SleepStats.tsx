import { useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import type { SleepEntry } from '../../types'
import { SleepTimelineChart } from './charts/SleepTimelineChart'
import { SleepStackedChart } from './charts/SleepStackedChart'
import { SleepPieCharts } from './charts/SleepPieCharts'

interface SleepStatsProps {
  entries: SleepEntry[]
}

export function SleepStats({ entries }: SleepStatsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary-500" size={20} />
          <span className="font-semibold text-white">Statistiques</span>
          <span className="text-sm text-dark-400">({entries.length} entrées)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-dark-400" size={20} />
        ) : (
          <ChevronDown className="text-dark-400" size={20} />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-dark-700 p-6 space-y-8">
          {/* Timeline des périodes de sommeil */}
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-4">
              Périodes de sommeil (Timeline)
            </h4>
            <SleepTimelineChart entries={entries} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-4">
              Durée de sommeil par jour (30 derniers jours)
            </h4>
            <SleepStackedChart entries={entries} days={30} />
          </div>

          {/* Pie charts */}
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-4">
              Répartition globale
            </h4>
            <SleepPieCharts entries={entries} />
          </div>
        </div>
      )}
    </div>
  )
}
