import type { HistoryEntry } from '../types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

type Props = {
  history: HistoryEntry[]
  onClear: () => void
  onClose: () => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function exportCsv(history: HistoryEntry[]) {
  const headers = [
    'Date',
    'Volume total (L)',
    'E85 (L)',
    'Essence (L)',
    'Type essence',
    'Éthanol final (%)',
    'Restant avant (L)',
    'Éthanol avant (%)',
    'Saison',
    'Coût (€)',
  ]
  const rows = history.map(e => [
    formatDate(e.date),
    e.totalFillL.toFixed(1),
    e.e85L.toFixed(1),
    e.gasolineL.toFixed(1),
    e.gasolineType,
    e.finalEthanolPct.toFixed(1),
    e.remainingLBefore.toFixed(1),
    (e.remainingEthanolPctBefore * 100).toFixed(1),
    e.season === 'summer' ? 'Été' : 'Hiver',
    e.costEuros != null ? e.costEuros.toFixed(2) : '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ethanol50-historique.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoryModal({ history, onClear, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-black/50 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Historique des pleins"
    >
      <Card className="w-full max-w-lg space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Historique des pleins
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8">
            Aucun plein enregistré pour l'instant.
          </p>
        ) : (
          <ul className="overflow-y-auto space-y-2 flex-1" aria-label="Liste des pleins">
            {history.map(entry => (
              <li
                key={entry.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm"
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-brand-600 dark:text-brand-400 font-bold text-base">
                    {entry.finalEthanolPct.toFixed(1)} %
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
                  <span>
                    <strong className="text-green-600 dark:text-green-400">
                      {entry.e85L.toFixed(1)} L
                    </strong>{' '}
                    E85
                  </span>
                  <span>
                    <strong className="text-blue-600 dark:text-blue-400">
                      {entry.gasolineL.toFixed(1)} L
                    </strong>{' '}
                    {entry.gasolineType}
                  </span>
                  <span>Total&nbsp;: {entry.totalFillL.toFixed(1)} L</span>
                  {entry.costEuros != null && <span>{entry.costEuros.toFixed(2)} €</span>}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 shrink-0 pt-2">
          <Button
            variant="secondary"
            onClick={() => exportCsv(history)}
            disabled={history.length === 0}
            className="flex-1"
          >
            Exporter CSV
          </Button>
          <Button
            variant="danger"
            onClick={onClear}
            disabled={history.length === 0}
            className="flex-1"
          >
            Effacer tout
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Card>
    </div>
  )
}
