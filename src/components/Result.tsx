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
      <Card className="text-center py-10">
        <p className="text-sm text-gray-300 dark:text-gray-600">
          Renseignez votre réservoir pour voir le calcul
        </p>
      </Card>
    )
  }

  if (result.status === 'ok') {
    return (
      <Card className="space-y-4">
        {/* Résultat principal */}
        <div className="grid grid-cols-2 gap-3">
          {/* E85 */}
          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 p-4 text-center">
            <p className="label-caps text-brand-500 dark:text-brand-400 mb-2">E85</p>
            <p
              className="result-number text-brand-700 dark:text-brand-300"
              aria-label={`${result.e85L} litres E85`}
            >
              {result.e85L.toFixed(1)}
            </p>
            <p className="text-xs text-brand-400 dark:text-brand-500 mt-1 font-medium">litres</p>
          </div>

          {/* Essence */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 p-4 text-center">
            <p className="label-caps text-gray-400 dark:text-gray-500 mb-2">Essence</p>
            <p
              className="result-number text-gray-700 dark:text-gray-200"
              aria-label={`${result.gasolineL} litres essence`}
            >
              {result.gasolineL.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">litres</p>
          </div>
        </div>

        {/* Éthanol final */}
        <div className="flex items-center justify-between rounded-xl bg-brand-600 dark:bg-brand-700 px-4 py-3">
          <span className="text-sm font-medium text-brand-100">Éthanol dans le réservoir</span>
          <span className="text-xl font-bold text-white">
            {result.finalEthanolPct.toFixed(1)} %
          </span>
        </div>

        {onSave && (
          <Button onClick={onSave} className="w-full" size="lg" variant="secondary">
            Enregistrer ce plein
          </Button>
        )}
      </Card>
    )
  }

  if (result.status === 'tank_too_rich') {
    return (
      <Card className="space-y-3 border-amber-200 dark:border-amber-800/40">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
            !
          </div>
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
              Réservoir trop riche en éthanol
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{result.reason}</p>
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-4 py-3 text-sm space-y-1">
          <p className="text-gray-700 dark:text-gray-300">
            Verser jusqu'à <strong>{result.maxGasolineOnlyL.toFixed(1)} L</strong> d'essence uniquement
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Éthanol résultant : {result.projectedEthanolPct.toFixed(1)} %
          </p>
        </div>
      </Card>
    )
  }

  if (result.status === 'tank_too_lean') {
    return (
      <Card className="space-y-3 border-sky-200 dark:border-sky-800/40">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 flex-shrink-0 mt-0.5 text-sm font-bold">
            →
          </div>
          <div>
            <p className="font-semibold text-sky-700 dark:text-sky-400 text-sm">
              Volume insuffisant pour atteindre la cible
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{result.reason}</p>
          </div>
        </div>
        <div className="rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30 px-4 py-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            Remplir jusqu'à <strong>{result.suggestedTargetFillL.toFixed(1)} L</strong> avec{' '}
            <strong>{result.e85L.toFixed(1)} L de E85</strong> uniquement
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-2 border-red-200 dark:border-red-900/40">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5 text-sm font-bold">
          ×
        </div>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Saisie invalide</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{result.reason}</p>
        </div>
      </div>
    </Card>
  )
}
