import { Heart, Smile, Frown, Meh, Zap } from 'lucide-react'

export function MoodPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Suivi de l'humeur</h2>
        <p className="text-dark-400 mt-1">
          Enregistrez votre humeur et niveau de fatigue quotidien
        </p>
      </div>

      <div className="card text-center py-16">
        <div className="flex justify-center gap-4 mb-6">
          <Frown className="text-red-400" size={40} />
          <Meh className="text-yellow-400" size={40} />
          <Smile className="text-green-400" size={40} />
        </div>

        <Heart className="mx-auto text-primary-500 mb-6" size={64} />

        <h3 className="text-xl font-semibold text-white mb-3">
          Fonctionnalité à venir
        </h3>

        <p className="text-dark-400 max-w-md mx-auto mb-8">
          Cette section vous permettra de suivre votre humeur et votre niveau de fatigue
          au quotidien, avec des statistiques et corrélations avec votre sommeil.
        </p>

        {/* Aperçu mockup */}
        <div className="max-w-md mx-auto bg-dark-750 rounded-xl p-6 border border-dark-600">
          <h4 className="text-sm font-medium text-dark-300 mb-4">Aperçu du futur formulaire</h4>

          <div className="space-y-4">
            <div className="text-left">
              <label className="text-sm text-dark-400 mb-2 block">Humeur du jour</label>
              <div className="flex gap-2 opacity-50">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className="w-10 h-10 rounded-full bg-dark-600 border-2 border-dark-500 flex items-center justify-center"
                    disabled
                  >
                    {level === 1 && <Frown size={18} className="text-dark-400" />}
                    {level === 2 && <Frown size={18} className="text-dark-400" />}
                    {level === 3 && <Meh size={18} className="text-dark-400" />}
                    {level === 4 && <Smile size={18} className="text-dark-400" />}
                    {level === 5 && <Smile size={18} className="text-dark-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-left">
              <label className="text-sm text-dark-400 mb-2 block">Niveau de fatigue</label>
              <div className="flex gap-2 opacity-50">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className="w-10 h-10 rounded-full bg-dark-600 border-2 border-dark-500 flex items-center justify-center"
                    disabled
                  >
                    <Zap size={18} className="text-dark-400" />
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full opacity-50" disabled>
              Enregistrer
            </button>
          </div>
        </div>

        <p className="text-xs text-dark-500 mt-6">
          Cette fonctionnalité sera disponible dans une prochaine version
        </p>
      </div>
    </div>
  )
}
