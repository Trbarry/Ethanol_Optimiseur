import { z } from 'zod'

export const VehicleProfileSchema = z.object({
  name: z.string().min(1).max(100),
  tankCapacityL: z.number().positive().max(300),
  maxEthanolPct: z.number().min(0).max(1),
  defaultTargetEthanolPct: z.number().min(0).max(1),
})

export const TankStateSchema = z.object({
  remainingL: z.number().min(0).max(300),
  remainingEthanolPct: z.number().min(0).max(1),
  lastUpdated: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
})

export const HistoryEntrySchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  remainingLBefore: z.number().min(0),
  remainingEthanolPctBefore: z.number().min(0).max(1),
  e85L: z.number().min(0),
  gasolineL: z.number().min(0),
  finalEthanolPct: z.number().min(0).max(100),
  totalFillL: z.number().min(0),
  costEuros: z.number().min(0).optional(),
  gasolineType: z.enum(['SP95-E10', 'SP98', 'SP95']),
})

export const HistorySchema = z.array(HistoryEntrySchema)
