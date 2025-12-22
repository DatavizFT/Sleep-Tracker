import { Calendar, CheckSquare, Clock, Target } from 'lucide-react'

export function AgendaPlaceholder() {
  const mockTasks = [
    { text: 'Éviter les écrans 1h avant le coucher', completed: false },
    { text: 'Prendre une tisane relaxante', completed: true },
    { text: 'Méditation de 10 minutes', completed: false },
    { text: 'Lecture avant de dormir', completed: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Agenda du sommeil</h2>
        <p className="text-dark-400 mt-1">
          Planifiez vos actions pour améliorer votre sommeil
        </p>
      </div>

      <div className="card text-center py-16">
        <div className="flex justify-center gap-4 mb-6">
          <Clock className="text-blue-400" size={36} />
          <Target className="text-green-400" size={36} />
          <CheckSquare className="text-purple-400" size={36} />
        </div>

        <Calendar className="mx-auto text-primary-500 mb-6" size={64} />

        <h3 className="text-xl font-semibold text-white mb-3">
          Fonctionnalité à venir
        </h3>

        <p className="text-dark-400 max-w-md mx-auto mb-8">
          Cette section vous permettra de définir des actions et objectifs pour améliorer
          votre hygiène de sommeil, avec un suivi de leur réalisation.
        </p>

        {/* Aperçu mockup */}
        <div className="max-w-lg mx-auto bg-dark-750 rounded-xl p-6 border border-dark-600">
          <h4 className="text-sm font-medium text-dark-300 mb-4">
            Aperçu des futures actions
          </h4>

          <div className="space-y-3 text-left">
            {mockTasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  task.completed ? 'bg-green-500/10' : 'bg-dark-700'
                } opacity-60`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-dark-500'
                  }`}
                >
                  {task.completed && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`flex-1 ${
                    task.completed ? 'text-dark-400 line-through' : 'text-white'
                  }`}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>

          <button className="btn-primary w-full mt-4 opacity-50" disabled>
            + Ajouter une action
          </button>
        </div>

        <p className="text-xs text-dark-500 mt-6">
          Cette fonctionnalité sera disponible dans une prochaine version
        </p>
      </div>
    </div>
  )
}
