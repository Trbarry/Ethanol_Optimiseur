export type BlendInput = {
  tankCapacityL: number
  remainingL: number
  remainingEthanolPct: number // 0..1
  targetFillL: number
  targetEthanolPct: number // 0..1, default 0.5
  e85EthanolPct: number // 0.85 été, 0.70 hiver
  gasolineEthanolPct: number // 0.10 SP95-E10, 0.05 SP98, 0.00 SP95
}

export type BlendResult =
  | {
      status: 'ok'
      e85L: number
      gasolineL: number
      finalEthanolPct: number
    }
  | {
      status: 'tank_too_rich'
      reason: string
      maxGasolineOnlyL: number
      projectedEthanolPct: number
    }
  | {
      status: 'tank_too_lean'
      reason: string
      suggestedTargetFillL: number
      e85L: number
      gasolineL: number
    }
  | {
      status: 'invalid_input'
      reason: string
    }

export type Season = 'summer' | 'winter'

export type GasolineType = 'SP95-E10' | 'SP98' | 'SP95'

export const GASOLINE_ETHANOL_PCT: Record<GasolineType, number> = {
  'SP95-E10': 0.1,
  SP98: 0.05,
  SP95: 0.0,
}

export const E85_ETHANOL_PCT: Record<Season, number> = {
  summer: 0.85,
  winter: 0.7,
}

export type VehicleProfile = {
  name: string
  tankCapacityL: number
  maxEthanolPct: number // info only, no hard block
  defaultTargetEthanolPct: number
}

export type TankState = {
  remainingL: number
  remainingEthanolPct: number // 0..1
  lastUpdated: string // ISO date
}

export type HistoryEntry = {
  id: string
  date: string // ISO
  remainingLBefore: number
  remainingEthanolPctBefore: number
  e85L: number
  gasolineL: number
  finalEthanolPct: number
  totalFillL: number
  costEuros?: number
  gasolineType: GasolineType
  season: Season
}
