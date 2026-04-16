import type { VehicleProfile, TankState, HistoryEntry } from '../types'
import { VehicleProfileSchema, TankStateSchema, HistorySchema } from './schemas'

const KEY_VEHICLE = 'ethanol50:v1:vehicle'
const KEY_TANK = 'ethanol50:v1:tank'
const KEY_HISTORY = 'ethanol50:v1:history'

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

// ── Vehicle Profile ────────────────────────────────────────────────────────

export function getVehicleProfile(): VehicleProfile | null {
  const raw = readJson(KEY_VEHICLE)
  if (raw === null) return null
  const result = VehicleProfileSchema.safeParse(raw)
  return result.success ? result.data : null
}

export function setVehicleProfile(profile: VehicleProfile): void {
  writeJson(KEY_VEHICLE, profile)
}

// ── Tank State ─────────────────────────────────────────────────────────────

export function getLastTankState(): TankState | null {
  const raw = readJson(KEY_TANK)
  if (raw === null) return null
  const result = TankStateSchema.safeParse(raw)
  return result.success ? result.data : null
}

export function setLastTankState(state: TankState): void {
  writeJson(KEY_TANK, state)
}

// ── History ────────────────────────────────────────────────────────────────

export function getHistory(): HistoryEntry[] {
  const raw = readJson(KEY_HISTORY)
  if (raw === null) return []
  const result = HistorySchema.safeParse(raw)
  return result.success ? result.data : []
}

export function appendHistoryEntry(entry: HistoryEntry): void {
  const history = getHistory()
  writeJson(KEY_HISTORY, [entry, ...history])
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY_HISTORY)
  } catch {
    // ignore
  }
}
