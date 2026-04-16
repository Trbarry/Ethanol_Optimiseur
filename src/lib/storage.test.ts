import { describe, it, expect, beforeEach } from 'vitest'
import {
  getVehicleProfile,
  setVehicleProfile,
  getLastTankState,
  setLastTankState,
  getHistory,
  appendHistoryEntry,
  clearHistory,
} from './storage'
import type { VehicleProfile, TankState, HistoryEntry } from '../types'

const PROFILE: VehicleProfile = {
  name: 'Mazda 3 Skyactiv-G',
  tankCapacityL: 51,
  maxEthanolPct: 0.85,
  defaultTargetEthanolPct: 0.4,
}

const TANK: TankState = {
  remainingL: 10,
  remainingEthanolPct: 0.45,
  lastUpdated: '2024-01-15T10:00:00Z',
}

const ENTRY: HistoryEntry = {
  id: 'abc123',
  date: '2024-01-15T10:00:00Z',
  remainingLBefore: 10,
  remainingEthanolPctBefore: 0.45,
  e85L: 22.5,
  gasolineL: 18.5,
  finalEthanolPct: 50.0,
  totalFillL: 51,
  gasolineType: 'SP95-E10',
  season: 'summer',
}

beforeEach(() => {
  localStorage.clear()
})

describe('VehicleProfile storage', () => {
  it('retourne null si aucun profil stocké', () => {
    expect(getVehicleProfile()).toBeNull()
  })

  it('enregistre et relit un profil valide', () => {
    setVehicleProfile(PROFILE)
    const loaded = getVehicleProfile()
    expect(loaded).toEqual(PROFILE)
  })

  it('retourne null si la donnée stockée est corrompue', () => {
    localStorage.setItem('ethanol50:v1:vehicle', '{invalid json}')
    expect(getVehicleProfile()).toBeNull()
  })

  it('retourne null si le profil stocké échoue la validation Zod', () => {
    localStorage.setItem('ethanol50:v1:vehicle', JSON.stringify({ name: '', tankCapacityL: -5 }))
    expect(getVehicleProfile()).toBeNull()
  })
})

describe('TankState storage', () => {
  it('retourne null si aucun état stocké', () => {
    expect(getLastTankState()).toBeNull()
  })

  it('enregistre et relit un état de réservoir valide', () => {
    setLastTankState(TANK)
    const loaded = getLastTankState()
    expect(loaded).toEqual(TANK)
  })

  it('retourne null si les données sont invalides', () => {
    localStorage.setItem('ethanol50:v1:tank', JSON.stringify({ remainingL: -1 }))
    expect(getLastTankState()).toBeNull()
  })
})

describe('History storage', () => {
  it('retourne un tableau vide si pas d\'historique', () => {
    expect(getHistory()).toEqual([])
  })

  it('ajoute et relit une entrée d\'historique', () => {
    appendHistoryEntry(ENTRY)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toEqual(ENTRY)
  })

  it('les nouvelles entrées apparaissent en premier', () => {
    const entry2: HistoryEntry = { ...ENTRY, id: 'xyz456', date: '2024-02-01T08:00:00Z' }
    appendHistoryEntry(ENTRY)
    appendHistoryEntry(entry2)
    const history = getHistory()
    expect(history[0].id).toBe('xyz456')
    expect(history[1].id).toBe('abc123')
  })

  it('clearHistory vide l\'historique', () => {
    appendHistoryEntry(ENTRY)
    clearHistory()
    expect(getHistory()).toEqual([])
  })

  it('retourne tableau vide si le JSON stocké est corrompu', () => {
    localStorage.setItem('ethanol50:v1:history', '[{broken')
    expect(getHistory()).toEqual([])
  })

  it('filtre les entrées invalides (migration)', () => {
    const bad = [{ id: 'bad', invalidField: true }]
    localStorage.setItem('ethanol50:v1:history', JSON.stringify(bad))
    // Zod validation échoue → retourne []
    expect(getHistory()).toEqual([])
  })

  it('préserve le champ optionnel costEuros', () => {
    const withCost: HistoryEntry = { ...ENTRY, costEuros: 42.5 }
    appendHistoryEntry(withCost)
    const loaded = getHistory()
    expect(loaded[0].costEuros).toBe(42.5)
  })
})
