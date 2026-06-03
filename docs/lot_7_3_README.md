# Lot 7.3 — Détecter les warnings P1

## Fichier à remplacer

```text
src/services/tripQualityEngine.js
```

## Objectif

Signaler les voyages moyens sans forcément les bloquer.

## Warnings P1 détectés

```text
[ ] Budget probablement trop bas
[ ] Formulations génériques trop nombreuses
[ ] Activités répétées
[ ] Intérêt utilisateur peu couvert
[ ] Transport inter-ville manquant
[ ] Journée trop dispersée ou trop longue
```

## Nouveaux champs dans quality

```text
p1_warnings
p1_warning_count
```

## Test console

```js
const trip = JSON.parse(localStorage.getItem('capi_trips'))[0];

({
  score: trip.quality_score,
  status: trip.quality_status,
  summary: trip.quality_summary,
  blockers: trip.quality_blockers,
  warnings: trip.quality_warnings,
  p1_warnings: trip.quality?.p1_warnings,
  p1_warning_count: trip.quality?.p1_warning_count,
  repairs: trip.quality_repairs,
});
```

## Validation attendue

```text
[ ] L’app démarre sans erreur Vite
[ ] Paris fonctionne
[ ] Danemark fonctionne
[ ] Italie fonctionne
[ ] Un voyage moyen a warnings / p1_warnings
[ ] Un voyage moyen n’est pas bloqué si pas de blocker P0
[ ] Aucun écran blanc
```
