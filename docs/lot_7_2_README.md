# Lot 7.2 — Détecter les blockers P0

## Fichier à remplacer

```text
src/services/tripQualityEngine.js
```

## Objectif

Renforcer le Trip Quality Engine pour qu’un voyage dangereux ou incohérent soit marqué comme `blocked`.

## Blockers P0 / critiques détectés

```text
[ ] destination incohérente avec le formulaire
[ ] itinerary absent ou vide
[ ] nombre de jours faux
[ ] jour vide
[ ] dernier jour seulement “départ” si départ inconnu ou pas tôt
[ ] activité après l’heure de départ
[ ] dîner sur le dernier jour
[ ] ville de retour non respectée
[ ] dernière nuit loin de la ville de retour si départ matinal
[ ] ville dominante excessive sur voyage long
[ ] voiture utilisée alors qu’elle est à éviter
[ ] Louvre placé le mardi pour Paris
```

## Test console

Après génération :

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
[ ] Créer Paris fonctionne
[ ] Créer Danemark fonctionne
[ ] Créer Italie fonctionne
[ ] Un voyage dangereux a quality_status = blocked
[ ] Les blockers sont lisibles dans quality_blockers
[ ] Aucun écran blanc
```

## Note

Le Lot 7.2 détecte et marque les voyages dangereux.
Le blocage réel de la sauvegarde / relance IA automatique arrivera au Lot 7.3.
