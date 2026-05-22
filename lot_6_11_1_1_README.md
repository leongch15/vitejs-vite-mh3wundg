# Correctif 6.11.1.1 — Fallback local basé sur formData

## Problème

Après le prompt V2, le fallback local pouvait générer Paris pour Danemark / Italie si l’IA échouait, car l’ancien parseur local cherchait une phrase du type `voyage à X` dans le prompt.

## Correction

Le fallback local utilise maintenant d’abord `formData`, puis seulement le prompt si aucun formulaire n’est disponible.

## Fichier à remplacer

```text
src/services/tripGenerator.ai.js
```

## Test

Créer un Danemark 8 jours et une Italie 14 jours.

Si l’IA échoue et que `generation_source = local_fallback`, la destination doit quand même rester Danemark / Italie, pas Paris.
