import type { BlendInput, BlendResult } from '../types'

/** Arrondit à 1 décimale (précision pompe) */
const round1 = (v: number): number => Math.round(v * 10) / 10

/** Arrondit un % à 1 décimale (affiché comme 50.0%) */
const roundPct = (v: number): number => Math.round(v * 1000) / 10

/**
 * Calcule les volumes E85 et essence à ajouter pour atteindre une cible d'éthanol.
 *
 * Bilan massique :
 *   remainingL × remainingEthanolPct + Ve85 × e85EthanolPct + Vsp × gasolineEthanolPct
 *     = targetFillL × targetEthanolPct
 *
 * Avec Ve85 + Vsp = Vadd = targetFillL − remainingL :
 *   Ve85 = (targetFillL × targetEthanolPct − remainingL × remainingEthanolPct − Vadd × gasolineEthanolPct)
 *          / (e85EthanolPct − gasolineEthanolPct)
 *   Vsp  = Vadd − Ve85
 */
export function computeBlend(input: BlendInput): BlendResult {
  const {
    tankCapacityL,
    remainingL,
    remainingEthanolPct,
    targetFillL,
    targetEthanolPct,
    e85EthanolPct,
    gasolineEthanolPct,
  } = input

  // ── Validation des inputs ────────────────────────────────────────────────

  if (!isFinite(tankCapacityL) || tankCapacityL <= 0) {
    return { status: 'invalid_input', reason: 'La capacité du réservoir doit être un nombre positif.' }
  }
  if (!isFinite(remainingL) || remainingL < 0) {
    return { status: 'invalid_input', reason: 'Le volume restant ne peut pas être négatif.' }
  }
  if (remainingL > tankCapacityL) {
    return { status: 'invalid_input', reason: 'Le volume restant dépasse la capacité du réservoir.' }
  }
  if (!isFinite(targetFillL) || targetFillL <= remainingL) {
    return { status: 'invalid_input', reason: "L'objectif de remplissage doit être supérieur au volume restant." }
  }
  if (targetFillL > tankCapacityL) {
    return { status: 'invalid_input', reason: "L'objectif de remplissage dépasse la capacité du réservoir." }
  }
  if (!isFinite(remainingEthanolPct) || remainingEthanolPct < 0 || remainingEthanolPct > 1) {
    return { status: 'invalid_input', reason: 'Le % éthanol actuel doit être compris entre 0 et 100%.' }
  }
  if (!isFinite(targetEthanolPct) || targetEthanolPct < 0 || targetEthanolPct > 1) {
    return { status: 'invalid_input', reason: 'La cible éthanol doit être comprise entre 0 et 100%.' }
  }
  if (!isFinite(e85EthanolPct) || !isFinite(gasolineEthanolPct)) {
    return { status: 'invalid_input', reason: 'Les fractions E85 et essence doivent être des nombres valides.' }
  }
  if (e85EthanolPct <= gasolineEthanolPct) {
    return {
      status: 'invalid_input',
      reason: "La fraction éthanol de l'E85 doit être strictement supérieure à celle de l'essence (sinon le calcul est impossible).",
    }
  }

  // ── Calcul principal ─────────────────────────────────────────────────────

  const vadd = targetFillL - remainingL
  const denominator = e85EthanolPct - gasolineEthanolPct

  const ve85Raw =
    (targetFillL * targetEthanolPct -
      remainingL * remainingEthanolPct -
      vadd * gasolineEthanolPct) /
    denominator

  // ── Cas 1 : tank_too_rich (Ve85 < 0) ─────────────────────────────────────
  // Le restant contient déjà plus d'éthanol que la cible.
  // On ne peut qu'ajouter de l'essence pure (pas d'E85).
  if (ve85Raw < 0) {
    const maxGasolineOnlyL = round1(tankCapacityL - remainingL)
    // % éthanol si on ajoute uniquement de l'essence jusqu'à la capacité max
    const projectedEthanolRaw =
      (remainingL * remainingEthanolPct + maxGasolineOnlyL * gasolineEthanolPct) /
      (remainingL + maxGasolineOnlyL || 1)
    const projectedEthanolPct = roundPct(projectedEthanolRaw)
    return {
      status: 'tank_too_rich',
      reason:
        `Le réservoir contient déjà ${roundPct(remainingEthanolPct)}% d'éthanol, ` +
        `supérieur à la cible de ${roundPct(targetEthanolPct)}%. ` +
        `Vous ne pouvez qu'ajouter de l'essence pour diluer.`,
      maxGasolineOnlyL,
      projectedEthanolPct,
    }
  }

  // ── Cas 2 : tank_too_lean (Ve85 > Vadd) ──────────────────────────────────
  // Il faudrait plus d'E85 que la place disponible.
  // On propose le targetFillL minimal pour que le plein soit faisable
  // en remplissant avec 100% d'E85 sur la fraction ajoutée.
  if (ve85Raw > vadd) {
    // Résoudre : avec Vsp = 0 (tout E85), quel targetFillL atteint la cible ?
    // remainingL × remainingEthanolPct + Vadd_new × e85EthanolPct = targetNew × targetEthanolPct
    // Vadd_new = targetNew - remainingL
    // remainingL × remainingEthanolPct + (targetNew - remainingL) × e85EthanolPct = targetNew × targetEthanolPct
    // targetNew × (e85EthanolPct - targetEthanolPct) = remainingL × (e85EthanolPct - remainingEthanolPct) × (-1) + …
    // Simplification :
    // remainingL × remainingEthanolPct + targetNew × e85EthanolPct - remainingL × e85EthanolPct = targetNew × targetEthanolPct
    // remainingL × (remainingEthanolPct - e85EthanolPct) = targetNew × (targetEthanolPct - e85EthanolPct)
    // targetNew = remainingL × (remainingEthanolPct - e85EthanolPct) / (targetEthanolPct - e85EthanolPct)

    const targetNew =
      (remainingL * (remainingEthanolPct - e85EthanolPct)) /
      (targetEthanolPct - e85EthanolPct)

    // Plafonner à la capacité réelle
    const suggestedTargetFillL = round1(Math.min(Math.max(targetNew, remainingL + 0.1), tankCapacityL))
    const vaddSuggested = suggestedTargetFillL - remainingL
    const ve85Suggested = round1(vaddSuggested) // tout E85 (Vsp = 0)
    const gasolineSuggested = round1(vaddSuggested - ve85Suggested)

    return {
      status: 'tank_too_lean',
      reason:
        `Le réservoir ne contient que ${roundPct(remainingEthanolPct)}% d'éthanol et la ` +
        `place disponible (${round1(vadd)} L) est insuffisante pour atteindre ${roundPct(targetEthanolPct)}% ` +
        `avec un mélange standard. En remplissant à ${suggestedTargetFillL} L avec 100% d'E85, ` +
        `vous approcherez la cible.`,
      suggestedTargetFillL,
      e85L: ve85Suggested,
      gasolineL: gasolineSuggested,
    }
  }

  // ── Cas nominal ──────────────────────────────────────────────────────────
  // Arrondir e85L en premier, puis déduire gasolineL de vadd - e85L pour
  // garantir que la somme des volumes arrondis = vadd (au 0.1L près).
  const e85L = round1(ve85Raw)
  const gasolineL = round1(vadd - e85L)

  // Recalcul du % final avec les volumes arrondis pour affichage cohérent
  const totalVolume = remainingL + e85L + gasolineL
  const finalEthanolRaw =
    (remainingL * remainingEthanolPct + e85L * e85EthanolPct + gasolineL * gasolineEthanolPct) /
    totalVolume

  return {
    status: 'ok',
    e85L,
    gasolineL,
    finalEthanolPct: roundPct(finalEthanolRaw),
  }
}
