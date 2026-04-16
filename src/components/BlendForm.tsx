import type { GasolineType, VehicleProfile } from '../types'
import { GASOLINE_ETHANOL_PCT } from '../types'
import { Input } from './ui/Input'
import { Card, SectionTitle } from './ui/Card'

export type BlendFormValues = {
  remainingL: string
  remainingEthanolPct: string // 0-100
  targetFillL: string
  targetEthanolPct: string // 0-100
  gasolineType: GasolineType
  e85EthanolPctOverride: string // 0-100
}

type Props = {
  values: BlendFormValues
  onChange: (values: BlendFormValues) => void
  vehicleProfile: VehicleProfile | null
}

const GASOLINE_OPTIONS: { value: GasolineType; label: string }[] = [
  { value: 'SP95-E10', label: 'SP95-E10 (10% éthanol)' },
  { value: 'SP98', label: 'SP98 (5% éthanol)' },
  { value: 'SP95', label: 'SP95 (0% éthanol)' },
]

export function BlendForm({ values, onChange, vehicleProfile }: Props) {
  const tankMax = vehicleProfile?.tankCapacityL ?? 100
  const targetFillNum = parseFloat(values.targetFillL) || 0

  function set(field: keyof BlendFormValues, v: string) {
    onChange({ ...values, [field]: v })
  }

  const gasolinePct = (GASOLINE_ETHANOL_PCT[values.gasolineType] * 100).toFixed(0)

  return (
    <div className="space-y-4">
      {/* Réservoir actuel */}
      <Card>
        <SectionTitle>Réservoir actuel</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Volume restant"
            type="number"
            inputMode="decimal"
            min={0}
            max={tankMax}
            step={0.5}
            unit="L"
            value={values.remainingL}
            onChange={e => set('remainingL', e.target.value)}
          />
          <Input
            label="% éthanol actuel"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={values.remainingEthanolPct}
            onChange={e => set('remainingEthanolPct', e.target.value)}
          />
        </div>
      </Card>

      {/* Plein à faire */}
      <Card>
        <SectionTitle>Plein à faire</SectionTitle>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="targetFillL-range"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between mb-1"
            >
              <span>Volume total visé</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {targetFillNum.toFixed(1)} L
              </span>
            </label>
            <input
              id="targetFillL-range"
              type="range"
              min={0}
              max={tankMax}
              step={0.5}
              value={values.targetFillL}
              onChange={e => set('targetFillL', e.target.value)}
              className="w-full accent-brand-600"
              aria-label={`Volume total visé : ${targetFillNum.toFixed(1)} litres`}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0 L</span>
              <span>{tankMax} L</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="gasoline-type"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Essence complément
              </label>
              <select
                id="gasoline-type"
                value={values.gasolineType}
                onChange={e => set('gasolineType', e.target.value as GasolineType)}
                className="rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  px-3 py-2 text-base
                  focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {GASOLINE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="% éthanol E85 réel"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              unit="%"
              value={values.e85EthanolPctOverride}
              onChange={e => set('e85EthanolPctOverride', e.target.value)}
            />
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            Essence complément : {gasolinePct}% éthanol
          </div>
        </div>
      </Card>

      {/* Cible */}
      <Card>
        <SectionTitle>Cible éthanol</SectionTitle>
        <div>
          <label
            htmlFor="targetEthanolPct-range"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between mb-1"
          >
            <span>% éthanol visé</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {values.targetEthanolPct} %
            </span>
          </label>
          <input
            id="targetEthanolPct-range"
            type="range"
            min={0}
            max={85}
            step={1}
            value={values.targetEthanolPct}
            onChange={e => set('targetEthanolPct', e.target.value)}
            className="w-full accent-brand-600"
            aria-label={`Cible éthanol : ${values.targetEthanolPct}%`}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0 %</span>
            <span>85 %</span>
          </div>
          <Input
            label="Ou saisir manuellement"
            type="number"
            inputMode="decimal"
            min={0}
            max={85}
            step={1}
            unit="%"
            value={values.targetEthanolPct}
            onChange={e => set('targetEthanolPct', e.target.value)}
            className="mt-3"
          />
        </div>
      </Card>
    </div>
  )
}
