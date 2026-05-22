# Lot 6.11.1 — Prompt IA V2 basé sur l’ancien prompt ChatGPT

## Fichiers à remplacer

```text
src/services/prompts/tripPrompt.js
src/pages/Home.jsx
```

## Objectif

Transformer Capi d’un générateur d’idées de voyage en vrai planificateur d’itinéraire.

## Problèmes ciblés

- Dernier jour vide ou limité à un départ.
- Dernière nuit incohérente avec la ville de retour.
- Long voyage mal réparti.
- Répétition des mêmes lieux.
- Style insolite / incontournables mal respecté.
- Intérêts mal incarnés.
- Transports internes insuffisants.
- Budget et devise parfois confus.

## Tests après remplacement

1. Push GitHub.
2. Redeploy Vercel.
3. Réinitialiser la démo.
4. Créer :
   - Paris 3 jours modéré ;
   - Danemark 8 jours retour Copenhague ;
   - Italie 14 jours économique sans voiture.
5. Vérifier :
   - generation_source = ai ;
   - ai_provider = openai ;
   - post_ai_validation ;
   - dernier jour non vide ;
   - dernière nuit cohérente ;
   - moins de répétitions ;
   - intérêts mieux représentés.
