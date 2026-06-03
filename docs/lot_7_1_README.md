# Lot 7.1 — Créer tripQualityEngine

## Fichiers à ajouter / remplacer

```text
src/services/tripQualityEngine.js
src/services/generationLogger.js
src/services/tripGenerator.ai.js
src/pages/Home.jsx
docs/lot_7_1_README.md
```

## Objectif

Ajouter un moteur de notation automatique des voyages.

## Fonction principale

```js
analyzeTripQuality(trip, formData)
```

Retourne :

```js
{
  score: 0-100,
  status: "blocked" | "fragile" | "usable" | "strong",
  blockers: [],
  warnings: [],
  repairs: [],
  summary: "...",
  checked_at: "...",
  version: "trip-quality-engine-v1.0.0"
}
```

## Contrôles inclus en V1

- Itinerary absent.
- Nombre de jours incorrect.
- Jours sans activité.
- Coordonnées manquantes ou invalides.
- Dernier jour vide.
- Dernier jour trop faible si départ inconnu ou pas tôt.
- Dîner sur le dernier jour.
- Ville de retour non respectée.
- Dernière nuit loin de la ville de retour si départ matinal.
- Activités répétées.
- Ville trop dominante sur voyage long.
- Voiture utilisée alors qu’elle est à éviter.
- Budget/devise incohérents.
- Intérêts utilisateur non visibles.
- Formulations internes ou génériques.
- Règle Paris V1 : Louvre le mardi.
- Règle Paris V1 : Marché Saint-Pierre utilisé comme marché food.

## Données stockées dans chaque voyage

```text
quality
quality_score
quality_status
quality_summary
quality_blockers
quality_warnings
quality_repairs
```

## Test console

Après génération d’un voyage :

```js
const trip = JSON.parse(localStorage.getItem('capi_trips'))[0];

({
  score: trip.quality_score,
  status: trip.quality_status,
  summary: trip.quality_summary,
  blockers: trip.quality_blockers,
  warnings: trip.quality_warnings,
  repairs: trip.quality_repairs,
});
```

## Validation attendue

```text
[ ] L’app démarre sans erreur Vite
[ ] Créer un Paris 3 jours fonctionne
[ ] Le voyage contient quality_score
[ ] Le voyage contient quality_status
[ ] Le voyage contient quality_blockers
[ ] Le voyage contient quality_warnings
[ ] Le voyage contient quality_repairs
[ ] Le score est entre 0 et 100
[ ] Aucun écran blanc
```
