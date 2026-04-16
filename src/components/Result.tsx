import type { BlendResult } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

type ResultProps = {
  result: BlendResult | null
  onSave?: () => void
}

export function Result({ result, onSave }: ResultProps) {
  if (!result) {
    return (
      <Card className="text-center text-gray-400 dark:text-gray-500 py-8">
        Remplissez le formulaire pour voir le calcul.
      </Card>
    )
  }

  if (result.status === 'ok') {
    return (
      <Card className="space-y-4">
        <div
          className="grid grid-cols-2 gap-4"
          aria-label="Volumes à verser"
        >
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">
              E85
            </p>
            <p className="text-5xl font-bold text-green-700 dark:text-green-300" aria-label={`${result.e85L} litres E85`}>
              {result.e85L.toFixed(1)}
            </p>
            <p className="text-lg text-green-600 dark:text-green-400 mt-1">litres</p>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-1">
              Essence
            </p>
            <p className="text-5xl font-bold text-blue-700 dark:text-blue-300" aria-label={`${result.gasolineL} litres essence`}>
              {result.gasolineL.toFixed(1)}
            </p>
            <p className="text-lg text-blue-600 dark:text-blue-400 mt-1">litres</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 px-4 py-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">Éthanol final attendu</span>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {result.finalEthanolPct.toFixed(1)} %
          </span>
        </div>

        {onSave && (
          <Button onClick={onSave} className="w-full" size="lg">
            Enregistrer ce plein
          </Button>
        )}
      </Card>
    )
  }

  if (result.status === 'tank_too_rich') {
    return (
      <Card className="space-y-3 border-orange-300 dark:border-orange-600">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400">
              Réservoir trop riche en éthanol
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{result.reason}</p>
          </div>
        </div>
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 px-4 py-3 text-sm space-y-1">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Action possible&nbsp;:</span> verser jusqu'à{' '}
            <strong>{result.maxGasolineOnlyL.toFixed(1)} L</strong> d'essence uniquement.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Éthanol résultant&nbsp;: <strong>{result.projectedEthanolPct.toFixed(1)} %</strong>
          </p>
        </div>
      </Card>
    )
  }

  if (result.status === 'tank_too_lean') {
    return (
      <Card className="space-y-3 border-yellow-300 dark:border-yellow-600">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">💡</span>
          <div>
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">
              Volume insuffisant pour atteindre la cible
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{result.reason}</p>
          </div>
        </div>
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm space-y-1">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Suggestion&nbsp;:</span> remplir jusqu'à{' '}
            <strong>{result.suggestedTargetFillL.toFixed(1)} L</strong> total avec{' '}
            <strong>{result.e85L.toFixed(1)} L E85</strong> uniquement.
          </p>
        </div>
      </Card>
    )
  }

  // invalid_input
  return (
    <Card className="space-y-2 border-red-300 dark:border-red-600">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">🚫</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">Saisie invalide</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{result.reason}</p>
        </div>
      </div>
    </Card>
  )
}
