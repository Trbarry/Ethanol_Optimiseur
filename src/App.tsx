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

  // Load persisted data on mount
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

  // Auto-compute with debounce whenever form changes
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
        isNaN(remainingL) ||
        isNaN(remainingEthanolPct) ||
        isNaN(targetFillL) ||
        isNaN(targetEthanolPct) ||
        isNaN(e85EthanolPct)
      ) {
        setResult(null)
        return
      }

      const res = computeBlend({
        tankCapacityL: p.tankCapacityL,
        remainingL,
        remainingEthanolPct,
        targetFillL,
        targetEthanolPct,
        e85EthanolPct,
        gasolineEthanolPct,
      })
      setResult(res)
    },
    []
  )

  function handleFormChange(values: BlendFormValues) {
    setForm(values)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      compute(values, vehicleProfile)
    }, 200)
  }

  // Trigger compute on initial form load
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

    // Update tank state for next time
    setLastTankState({
      remainingL: entry.totalFillL,
      remainingEthanolPct: result.finalEthanolPct / 100,
      lastUpdated: entry.date,
    })
    // Pre-fill the form for next session
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">⛽</span>
            <h1 className="text-lg font-bold text-brand-700 dark:text-brand-400">Ethanol 50</h1>
            {vehicleProfile && (
              <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
                — {vehicleProfile.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              aria-label="Historique des pleins"
            >
              📋 Historique
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(true)}
              aria-label="Paramètres véhicule"
            >
              🚗 Véhicule
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <BlendForm
          values={form}
          onChange={handleFormChange}
          vehicleProfile={vehicleProfile}
        />

        <section aria-label="Résultat du calcul">
          <Result
            result={result}
            onSave={result?.status === 'ok' ? handleSaveFill : undefined}
          />
        </section>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500 pb-4">
          Cette app est réservée aux véhicules FlexFuel ou équipés d'un boîtier E85 homologué.
          Respectez le % éthanol max recommandé par votre constructeur.
        </p>
      </main>

      {/* Modals */}
      {showProfile && (
        <VehicleProfileModal
          profile={vehicleProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
      {showHistory && (
        <HistoryModal
          history={history}
          onClear={handleClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
