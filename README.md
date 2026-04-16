# Ethanol 50 ⛽

Application web statique (PWA) calculant le mélange **E85 + essence** à verser dans un réservoir FlexFuel pour atteindre une cible d'éthanol ajustable (50% par défaut).

> **Avertissement** : cette application est réservée aux véhicules **FlexFuel ou équipés d'un boîtier E85 homologué**. Ne dépassez jamais le pourcentage d'éthanol maximal toléré par votre constructeur.

---

## Modèle mathématique

### Bilan massique (fraction volumique d'éthanol)

Soit :
- `R` = volume restant (L), à `eR` % éthanol
- `Ve85` = volume d'E85 à ajouter, à `e85` % éthanol
- `Vsp` = volume d'essence à ajouter, à `eg` % éthanol
- `T` = volume total visé (L), à `et` % éthanol cible
- `Vadd = T − R`

Le bilan donne :

```
R·eR + Ve85·e85 + Vsp·eg = T·et
Ve85 + Vsp = Vadd
```

La résolution donne :

```
Ve85 = (T·et − R·eR − Vadd·eg) / (e85 − eg)
Vsp  = Vadd − Ve85
```

Les volumes sont arrondis à **0.1 L** (précision des pompes).

### Cas limites

| Situation | Statut | Action |
|-----------|--------|--------|
| `Ve85 < 0` | `tank_too_rich` | Le restant est déjà plus riche que la cible. Seule l'essence dilue. |
| `Ve85 > Vadd` | `tank_too_lean` | Pas assez de place. Suggestion : remplir à un volume intermédiaire avec 100% E85. |
| `e85 ≤ eg` | `invalid_input` | Division par zéro ou non-sens physique. |
| Valeurs hors plage | `invalid_input` | Message d'erreur précis. |

### Teneurs saisonnières E85 en France

| Saison | % éthanol E85 |
|--------|---------------|
| Été (avril → octobre) | **85 %** |
| Hiver (novembre → mars) | **70 %** |

Source : spécification EN 15376 + arrêté du 23 novembre 2011 relatif aux caractéristiques du carburant E85 en France.

---

## Développement local

```bash
# Prérequis : Node 20 LTS, pnpm

pnpm install
pnpm dev        # Serveur de dev → http://localhost:5173/ethanol-50/
pnpm test       # Vitest (38+ cas de test)
pnpm build      # Build de production → dist/
```

## Déploiement sur GitHub Pages

1. Pusher sur la branche `main` :

   ```bash
   git push origin main
   ```

2. Dans **Settings → Pages** du dépôt, sélectionner la source **"GitHub Actions"**.

3. Le workflow `.github/workflows/deploy.yml` exécute les tests, build, puis déploie automatiquement vers `https://<user>.github.io/ethanol-50/`.

---

## Stack technique

- **Vite 5** + **React 18** + **TypeScript strict**
- **Tailwind CSS v3** (dark mode auto)
- **Vitest** + **@testing-library/react**
- **Zod** (validation des inputs et migration localStorage)
- **vite-plugin-pwa** (mode installable, hors-ligne)
- Persistance **localStorage** uniquement — zéro backend

---

## Licence

MIT © 2024
