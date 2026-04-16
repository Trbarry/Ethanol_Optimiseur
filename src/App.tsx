import { useState, useEffect, useCallback, useRef } from 'react'
import type { BlendResult, VehicleProfile, HistoryEntry } from './types'
import { GASOLINE_ETHANOL_PCT } from './types'
import { computeBlend } from './lib/blend'
import {
  getVehicleProfile,
  setVehicleProfile as saveVehicleProfile,
  getLastTankState,
  setLastTankState,
  getHistory,
  appendHistoryEntry,
  clearHistory,
} from './lib/storage'
import type { BlendFormValues } from './components/BlendForm'
import { BlendForm } from './components/BlendForm'
import { Result } from './components/Result'
import { VehicleProfileModal } from './components/VehicleProfile'
import { HistoryModal } from './components/History'
import { Button } from './components/ui/Button'

const DEFAULT_VEHICLE: VehicleProfile = {
  name: 'Mazda 3 Skyactiv-G 122ch',
  tankCapacityL: 51,
  maxEthanolPct: 0.85,
  defaultTargetEthanolPct: 0.4,
}

function buildDefaultForm(profile: VehicleProfile | null): BlendFormValues {
  const p = profile ?? DEFAULT_VEHICLE
  return {
    remainingL: '10',
    remainingEthanolPct: '0',
    targetFillL: String(p.tankCapacityL),
    targetEthanolPct: String(Math.round(p.defaultTargetEthanolPct * 100)),
    gasolineType: 'SP95-E10',
    e85EthanolPctOverride: '85',
  }
}

export default function App() {
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [form, setForm] = useState<BlendFormValues>(() => buildDefaultForm(null))
  const [result, setResult] = useState<BlendResult | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const profile = getVehicleProfile()
    const tank = getLastTankState()
    const hist = getHistory()
    setVehicleProfile(profile)
    setHistory(hist)
    setForm(prev => {
      const base = buildDefaultForm(profile)
      return {
        ...base,
        remainingL: tank ? String(tank.remainingL) : prev.remainingL,
        remainingEthanolPct: tank
          ? String(Math.round(tank.remainingEthanolPct * 100))
          : prev.remainingEthanolPct,
      }
    })
  }, [])

  const compute = useCallback(
    (values: BlendFormValues, profile: VehicleProfile | null) => {
      const p = profile ?? DEFAULT_VEHICLE
      const remainingL = parseFloat(values.remainingL)
      const remainingEthanolPct = parseFloat(values.remainingEthanolPct) / 100
      const targetFillL = parseFloat(values.targetFillL)
      const targetEthanolPct = parseFloat(values.targetEthanolPct) / 100
      const e85EthanolPct = parseFloat(values.e85EthanolPctOverride) / 100
      const gasolineEthanolPct = GASOLINE_ETHANOL_PCT[values.gasolineType]
      if (
        isNaN(remainingL) || isNaN(remainingEthanolPct) ||
        isNaN(targetFillL) || isNaN(targetEthanolPct) || isNaN(e85EthanolPct)
      ) {
        setResult(null)
        return
      }
      const res = computeBlend({
        tankCapacityL: p.tankCapacityL,
        remainingL, remainingEthanolPct, targetFillL,
        targetEthanolPct, e85EthanolPct, gasolineEthanolPct,
      })
      setResult(res)
    },
    []
  )

  function handleFormChange(values: BlendFormValues) {
    setForm(values)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => compute(values, vehicleProfile), 200)
  }

  useEffect(() => {
    compute(form, vehicleProfile)
  }, [vehicleProfile]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaveProfile(profile: VehicleProfile) {
    saveVehicleProfile(profile)
    setVehicleProfile(profile)
    setForm(prev => ({
      ...prev,
      targetFillL: String(profile.tankCapacityL),
      targetEthanolPct: String(Math.round(profile.defaultTargetEthanolPct * 100)),
    }))
    setShowProfile(false)
  }

  function handleSaveFill() {
    if (!result || result.status !== 'ok') return
    const profile = vehicleProfile ?? DEFAULT_VEHICLE
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      remainingLBefore: parseFloat(form.remainingL) || 0,
      remainingEthanolPctBefore: parseFloat(form.remainingEthanolPct) / 100 || 0,
      e85L: result.e85L,
      gasolineL: result.gasolineL,
      finalEthanolPct: result.finalEthanolPct,
      totalFillL: parseFloat(form.targetFillL) || 0,
      gasolineType: form.gasolineType,
    }
    appendHistoryEntry(entry)
    setHistory(getHistory())
    setLastTankState({
      remainingL: entry.totalFillL,
      remainingEthanolPct: result.finalEthanolPct / 100,
      lastUpdated: entry.date,
    })
    setForm(prev => ({
      ...prev,
      remainingL: String(entry.totalFillL),
      remainingEthanolPct: String(result.finalEthanolPct.toFixed(1)),
      targetFillL: String(profile.tankCapacityL),
    }))
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-brand-100/60 dark:border-brand-900/40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
              e
            </div>
            <div>
              <h1 className="text-sm font-semibold text-brand-800 dark:text-brand-300 leading-tight">
                Ethanol
              </h1>
              {vehicleProfile ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight truncate max-w-[160px]">
                  {vehicleProfile.name}
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                  Optimiseur de mélange
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} aria-label="Historique">
              Historique
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)} aria-label="Véhicule">
              Véhicule
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <BlendForm values={form} onChange={handleFormChange} vehicleProfile={vehicleProfile} />

        <section aria-label="Résultat du calcul">
          <Result result={result} onSave={result?.status === 'ok' ? handleSaveFill : undefined} />
        </section>

        <p className="text-xs text-center text-gray-300 dark:text-gray-600 pb-4">
          Réservé aux véhicules FlexFuel ou boîtier E85 homologué
        </p>
      </main>

      {showProfile && (
        <VehicleProfileModal profile={vehicleProfile} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} />
      )}
      {showHistory && (
        <HistoryModal history={history} onClear={handleClearHistory} onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}
