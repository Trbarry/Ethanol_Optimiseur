import { useState } from 'react'
import type { VehicleProfile as VehicleProfileType } from '../types'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

type Props = {
  profile: VehicleProfileType | null
  onSave: (profile: VehicleProfileType) => void
  onClose: () => void
}

type Preset = VehicleProfileType & { notes?: string }

const PRESETS: Preset[] = [
  // ── Hybrides Toyota/Suzuki ───────────────────────────────────────────────
  {
    name: 'Toyota Corolla / Suzuki Swace 1.8 hybride',
    tankCapacityL: 43,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.5,
    notes: 'Corolla TS, Swace — boîtier E85 requis, max 50% recommandé',
  },
  {
    name: 'Toyota Yaris 4 / Yaris Cross 1.5 hybride',
    tankCapacityL: 36,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.4,
    notes: 'Boîtier E85 requis, cible prudente 40%',
  },
  {
    name: 'Toyota C-HR / RAV4 2.0 hybride',
    tankCapacityL: 43,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.4,
    notes: 'Réservoir 43L (C-HR) ou 55L (RAV4) — ajuster',
  },
  {
    name: 'Toyota RAV4 2.0 hybride',
    tankCapacityL: 55,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.4,
    notes: 'Boîtier E85 requis',
  },
  {
    name: 'Suzuki Vitara / S-Cross 1.5 hybride',
    tankCapacityL: 47,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.4,
    notes: 'Moteur K15C Atkinson — boîtier E85 requis',
  },
  // ── Mazda ────────────────────────────────────────────────────────────────
  {
    name: 'Mazda 3 Gen 4 Skyactiv-G 122ch',
    tankCapacityL: 51,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.4,
    notes: 'Compatible E85 natif avec boîtier, cible conservatrice 40%',
  },
  {
    name: 'Mazda CX-5 2.0 Skyactiv-G',
    tankCapacityL: 56,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.4,
    notes: '56L — boîtier E85 requis',
  },
  // ── Renault / Dacia ──────────────────────────────────────────────────────
  {
    name: 'Renault Clio 5 / Captur 1.0 TCe 100',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'H4D — boîtier E85 homologué disponible',
  },
  {
    name: 'Renault Clio 5 / Captur 1.3 TCe 130',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'H5H — boîtier E85 homologué disponible',
  },
  {
    name: 'Renault Arkana / Mégane 1.3 TCe',
    tankCapacityL: 50,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: '50L — boîtier E85 requis',
  },
  {
    name: 'Dacia Sandero / Jogger 1.0 TCe 90/100',
    tankCapacityL: 50,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'H4D / B4D — boîtier E85 homologué disponible',
  },
  {
    name: 'Dacia Duster 1.3 TCe 130',
    tankCapacityL: 50,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'H5H — boîtier E85 requis',
  },
  // ── Peugeot / Citroën / Opel ─────────────────────────────────────────────
  {
    name: 'Peugeot 208 / 2008 1.2 PureTech 100/130',
    tankCapacityL: 44,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'EB2 / EB2ADTS — boîtier E85 homologué disponible',
  },
  {
    name: 'Peugeot 308 / 3008 1.2 PureTech 130',
    tankCapacityL: 52,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'EB2ADTS — boîtier E85 requis',
  },
  {
    name: 'Citroën C3 / C4 1.2 PureTech 83/100/130',
    tankCapacityL: 44,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'EB2 / EB2ADTS — même moteur PSA',
  },
  {
    name: 'Opel Corsa / Mokka 1.2 Turbo 100/130',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'Moteur PSA EB2ADTS — boîtier E85 requis',
  },
  // ── Volkswagen / Skoda / Seat ────────────────────────────────────────────
  {
    name: 'Volkswagen Polo / Golf 1.0 TSI 95/110',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'CHZB / DKRF — boîtier E85 homologué disponible',
  },
  {
    name: 'Volkswagen Golf 1.5 TSI 130/150',
    tankCapacityL: 50,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'DPB / DPCA — boîtier E85 requis',
  },
  {
    name: 'Skoda Octavia / Fabia 1.0 TSI / 1.5 TSI',
    tankCapacityL: 50,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'Même groupe VAG — boîtier E85 requis',
  },
  {
    name: 'Seat Ibiza / Arona / Leon 1.0 TSI',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'Groupe VAG — boîtier E85 requis',
  },
  // ── Ford ─────────────────────────────────────────────────────────────────
  {
    name: 'Ford Puma / Focus 1.0 EcoBoost 125/155',
    tankCapacityL: 42,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'M1JH / M2JH — boîtier E85 homologué disponible',
  },
  {
    name: 'Ford Kuga 1.5 EcoBoost / 2.5 PHEV',
    tankCapacityL: 52,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'Boîtier E85 requis (PHEV : vérifier compatibilité)',
  },
  // ── Hyundai / Kia ────────────────────────────────────────────────────────
  {
    name: 'Hyundai i20 / Bayon 1.0 T-GDI 100',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'G3LC — boîtier E85 homologué disponible',
  },
  {
    name: 'Kia Stonic / Picanto 1.0 T-GDI',
    tankCapacityL: 40,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'Même moteur Hyundai-Kia',
  },
  // ── Fiat ─────────────────────────────────────────────────────────────────
  {
    name: 'Fiat 500 / Panda 1.0 Hybrid 70ch',
    tankCapacityL: 35,
    maxEthanolPct: 0.5,
    defaultTargetEthanolPct: 0.4,
    notes: 'Micro-hybride BSG — prudence, max 40–50% conseillé',
  },
  // ── BMW / Mini ───────────────────────────────────────────────────────────
  {
    name: 'Mini Cooper / One 1.5 / 2.0 TwinPower',
    tankCapacityL: 44,
    maxEthanolPct: 0.85,
    defaultTargetEthanolPct: 0.5,
    notes: 'B38 / B48 — boîtier E85 requis',
  },
]

export function VehicleProfileModal({ profile, onSave, onClose }: Props) {
  const [form, setForm] = useState<VehicleProfileType>(profile ?? PRESETS[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function applyPreset(preset: Preset) {
    setForm({
      name: preset.name,
      tankCapacityL: preset.tankCapacityL,
      maxEthanolPct: preset.maxEthanolPct,
      defaultTargetEthanolPct: preset.defaultTargetEthanolPct,
    })
    setErrors({})
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Requis'
    if (form.tankCapacityL <= 0) errs.tankCapacityL = 'Doit être > 0'
    if (form.maxEthanolPct < 0 || form.maxEthanolPct > 1) errs.maxEthanolPct = '0–100%'
    if (form.defaultTargetEthanolPct < 0 || form.defaultTargetEthanolPct > 1)
      errs.defaultTargetEthanolPct = '0–100%'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSave(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-black/50 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Profil véhicule"
    >
      <Card className="w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Profil véhicule
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

        {/* Presets */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Choisir un modèle
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors
                  hover:bg-brand-50 dark:hover:bg-brand-900/20
                  focus-visible:outline-none focus-visible:bg-brand-50 dark:focus-visible:bg-brand-900/20
                  ${form.name === preset.name
                    ? 'bg-brand-50 dark:bg-brand-900/30 font-medium text-brand-700 dark:text-brand-300'
                    : 'text-gray-800 dark:text-gray-200'
                  }`}
              >
                <span className="block">{preset.name}</span>
                {preset.notes && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {preset.notes}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <Input
            label="Nom du véhicule"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Capacité réservoir"
              type="number"
              inputMode="decimal"
              min={1}
              max={300}
              step={0.5}
              unit="L"
              value={form.tankCapacityL}
              onChange={e =>
                setForm(f => ({ ...f, tankCapacityL: parseFloat(e.target.value) || 0 }))
              }
              error={errors.tankCapacityL}
            />
            <Input
              label="Cible par défaut"
              type="number"
              inputMode="decimal"
              min={0}
              max={85}
              step={5}
              unit="%"
              value={Math.round(form.defaultTargetEthanolPct * 100)}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  defaultTargetEthanolPct: (parseFloat(e.target.value) || 0) / 100,
                }))
              }
              error={errors.defaultTargetEthanolPct}
            />
          </div>
          <Input
            label="% éthanol max toléré (info)"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={5}
            unit="%"
            value={Math.round(form.maxEthanolPct * 100)}
            onChange={e =>
              setForm(f => ({ ...f, maxEthanolPct: (parseFloat(e.target.value) || 0) / 100 }))
            }
            error={errors.maxEthanolPct}
          />

          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            Les données sont indicatives. Vérifiez la compatibilité E85 de votre boîtier avec votre motorisation exacte.
          </p>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
