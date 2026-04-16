import { describe, it, expect } from 'vitest'
import { computeBlend } from './blend'

const SUMMER_E85 = 0.85
const WINTER_E85 = 0.70
const SP95_E10 = 0.10
const SP98 = 0.05
const SP95 = 0.00

// Helper: round to 1 decimal place (same as blend.ts)
const r1 = (v: number) => Math.round(v * 10) / 10

describe('computeBlend — cas nominaux', () => {
  it('Plein complet depuis réservoir vide, cible 50%, E85 été + SP95-E10', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    // Ve85 + Vsp = 51
    expect(r1(result.e85L + result.gasolineL)).toBe(51)
    // ratio éthanol final ≈ 50%
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 1)
    // calcul manuel : Ve85 = (51*0.5 - 0 - 51*0.10)/(0.85-0.10) = (25.5 - 5.1)/0.75 = 27.2
    expect(result.e85L).toBeCloseTo(27.2, 0)
    expect(result.gasolineL).toBeCloseTo(23.8, 0)
  })

  it('Plein partiel avec restant à 20% éthanol', () => {
    // Réservoir 51L, 15L restants à 20%, vise 45L total, cible 50%, E85 été, SP95-E10
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 15,
      remainingEthanolPct: 0.2,
      targetFillL: 45,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(r1(result.e85L + result.gasolineL)).toBe(30) // Vadd = 45 - 15 = 30
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 0)
    // Vérifié manuellement :
    // Ve85 = (45*0.5 - 15*0.2 - 30*0.10)/(0.85-0.10) = (22.5 - 3 - 3)/0.75 = 16.5/0.75 = 22
    expect(result.e85L).toBeCloseTo(22, 0)
    expect(result.gasolineL).toBeCloseTo(8, 0)
  })

  it('E85 hiver (0.70)', () => {
    const result = computeBlend({
      tankCapacityL: 50,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 50,
      targetEthanolPct: 0.5,
      e85EthanolPct: WINTER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(r1(result.e85L + result.gasolineL)).toBe(50)
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 1)
    // Ve85 = (50*0.5 - 0 - 50*0.10)/(0.70-0.10) = (25 - 5)/0.60 = 33.33...
    expect(result.e85L).toBeCloseTo(33.3, 0)
  })

  it('SP98 (0.05) comme complément', () => {
    const result = computeBlend({
      tankCapacityL: 60,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 60,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP98,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    // Ve85 = (60*0.5 - 0 - 60*0.05)/(0.85-0.05) = (30 - 3)/0.80 = 33.75 → arrondi 33.8
    // Vsp = 60 - 33.8 = 26.2 → sum = 60.0
    expect(r1(result.e85L + result.gasolineL)).toBe(60)
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 0)
    expect(result.e85L).toBeCloseTo(33.8, 0)
  })

  it('Scénario réel Mazda 3 — 51L, 10L restants à 45%, cible 50%, E85 été, SP95-E10', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 10,
      remainingEthanolPct: 0.45,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    // Vadd = 41, Ve85 = (51*0.5 - 10*0.45 - 41*0.10)/(0.85-0.10)
    //                  = (25.5 - 4.5 - 4.1)/0.75 = 16.9/0.75 = 22.53...
    expect(result.e85L).toBeCloseTo(22.5, 0)
    expect(result.gasolineL).toBeCloseTo(18.5, 0)
    expect(r1(result.e85L + result.gasolineL)).toBe(41)
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 0)
  })

  it('SP95 pur (0.00) comme complément', () => {
    const result = computeBlend({
      tankCapacityL: 40,
      remainingL: 5,
      remainingEthanolPct: 0.0,
      targetFillL: 40,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(r1(result.e85L + result.gasolineL)).toBe(35)
    // Ve85 = 20/0.85 = 23.529 → arrondi 23.5, finalEthanol ≈ 49.9% (artefact arrondi 0.1L)
    expect(result.finalEthanolPct).toBeCloseTo(50.0, 0)
    expect(result.e85L).toBeCloseTo(23.5, 0)
  })

  it('Cible 40% (Mazda défaut)', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.4,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.finalEthanolPct).toBeCloseTo(40.0, 1)
  })
})

describe('computeBlend — cas limites (statuts erreur)', () => {
  it('tank_too_rich — 50L restants à 60%, vise 51L total, cible 50%', () => {
    // Ve85 = (51*0.5 - 50*0.6 - 1*0.10)/(0.75) = (25.5 - 30 - 0.1)/0.75 = -4.6/0.75 < 0
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 50,
      remainingEthanolPct: 0.6,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('tank_too_rich')
    if (result.status !== 'tank_too_rich') return
    expect(result.maxGasolineOnlyL).toBe(1) // tankCapacityL - remainingL
    expect(result.projectedEthanolPct).toBeLessThan(60)
    expect(result.reason).toBeTruthy()
  })

  it('tank_too_rich — 50L restants à 100% éthanol, vise 51L total, cible 50%', () => {
    // Ve85 = (51*0.5 - 50*1.0 - 1*0.10)/(0.75) = (25.5 - 50 - 0.1)/0.75 < 0
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 50,
      remainingEthanolPct: 1.0,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('tank_too_rich')
    if (result.status !== 'tank_too_rich') return
    expect(result.maxGasolineOnlyL).toBe(1)
    expect(result.projectedEthanolPct).toBeLessThan(100)
  })

  it('tank_too_lean — réservoir à 5% éthanol, cible 50%, volume à ajouter trop petit', () => {
    // 40L restants à 5%, vise 42L total (seulement 2L à ajouter), cible 50%
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 40,
      remainingEthanolPct: 0.05,
      targetFillL: 42,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('tank_too_lean')
    if (result.status !== 'tank_too_lean') return
    expect(result.suggestedTargetFillL).toBeGreaterThan(42)
    expect(result.suggestedTargetFillL).toBeLessThanOrEqual(51)
    expect(result.reason).toBeTruthy()
  })

  it('tank_too_lean — on peut retourner un plein à 100% E85 sur Vadd', () => {
    // On vérifie que la suggestion est valide : e85L + gasolineL = suggestedTargetFillL - remainingL
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 40,
      remainingEthanolPct: 0.05,
      targetFillL: 42,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    if (result.status !== 'tank_too_lean') return
    const vaddSuggested = r1(result.suggestedTargetFillL - 40)
    expect(r1(result.e85L + result.gasolineL)).toBe(vaddSuggested)
  })
})

describe('computeBlend — inputs invalides', () => {
  it('capacité négative → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: -10,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 10,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
    if (result.status !== 'invalid_input') return
    expect(result.reason).toMatch(/capacit/i)
  })

  it('remainingL > tankCapacityL → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 60,
      remainingEthanolPct: 0,
      targetFillL: 60,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
    if (result.status !== 'invalid_input') return
    expect(result.reason).toMatch(/restant/i)
  })

  it('targetFillL > tankCapacityL → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 10,
      remainingEthanolPct: 0,
      targetFillL: 60,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
    if (result.status !== 'invalid_input') return
    expect(result.reason).toMatch(/objectif/i)
  })

  it('targetFillL ≤ remainingL → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 30,
      remainingEthanolPct: 0,
      targetFillL: 25,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
    if (result.status !== 'invalid_input') return
    expect(result.reason).toMatch(/objectif/i)
  })

  it('e85EthanolPct = gasolineEthanolPct → invalid_input (division par zéro)', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: 0.1,
      gasolineEthanolPct: 0.1,
    })
    expect(result.status).toBe('invalid_input')
    if (result.status !== 'invalid_input') return
    expect(result.reason).toMatch(/e85/i)
  })

  it('e85EthanolPct < gasolineEthanolPct → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: 0.05,
      gasolineEthanolPct: 0.1,
    })
    expect(result.status).toBe('invalid_input')
  })

  it('targetEthanolPct hors [0,1] → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 1.2,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
  })

  it('remainingEthanolPct hors [0,1] → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 10,
      remainingEthanolPct: -0.1,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
  })

  it('tankCapacityL = 0 → invalid_input', () => {
    const result = computeBlend({
      tankCapacityL: 0,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 0,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('invalid_input')
  })
})

describe('computeBlend — stabilité numérique', () => {
  it('remainingL = 0.001 (quasi-vide) ne produit pas de NaN', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0.001,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(isNaN(result.e85L)).toBe(false)
    expect(isNaN(result.gasolineL)).toBe(false)
    expect(isNaN(result.finalEthanolPct)).toBe(false)
  })

  it('Tous les volumes à virgule flottante ne produisent pas de résultat aberrant', () => {
    const result = computeBlend({
      tankCapacityL: 47.3,
      remainingL: 12.7,
      remainingEthanolPct: 0.33,
      targetFillL: 47.3,
      targetEthanolPct: 0.5,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.e85L).toBeGreaterThan(0)
    expect(result.gasolineL).toBeGreaterThanOrEqual(0)
    const sum = r1(result.e85L + result.gasolineL)
    expect(sum).toBe(r1(47.3 - 12.7))
  })

  it('Cible 85% (max) sans dépasser la capacité', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.85,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    // targetEthanolPct = e85EthanolPct → tout E85
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.gasolineL).toBeCloseTo(0, 1)
    expect(result.e85L).toBeCloseTo(51, 0)
  })

  it('Cible 10% (min SP95-E10) → tout SP, zéro E85', () => {
    const result = computeBlend({
      tankCapacityL: 51,
      remainingL: 0,
      remainingEthanolPct: 0,
      targetFillL: 51,
      targetEthanolPct: 0.1,
      e85EthanolPct: SUMMER_E85,
      gasolineEthanolPct: SP95_E10,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.e85L).toBeCloseTo(0, 1)
    expect(result.gasolineL).toBeCloseTo(51, 0)
  })
})
