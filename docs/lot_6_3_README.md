# Lot 6.3 — Journaliser chaque génération

## Fichiers à remplacer / ajouter

```text
api/generate-trip.js
src/api/base44Client.js
src/services/tripGenerator.ai.js
src/pages/Home.jsx
src/services/generationLogger.js
```

## Objectif

Chaque voyage sauvegardé doit contenir une trace de génération exploitable.

## Champs ajoutés au voyage

```text
generation_source
ai_provider
ai_error
fallback_used
prompt_version
duration_ms
estimated_cost_usd
quality_score
generation_model
generation_usage
generation_trace
```

## Notes

- `estimated_cost_usd` est estimé pour OpenAI à partir des tokens renvoyés par l’API.
- Gemini et local sont comptés à `0` pour l’instant.
- `quality_score` est un score technique provisoire. Il sera remplacé/amélioré par le futur Trip Quality Engine.
- En fallback, `fallback_used = true`, `ai_provider = local`, et `ai_error` conserve l’erreur IA.

## Tests

Après remplacement :

1. Push GitHub.
2. Redeploy Vercel.
3. Réinitialiser la démo.
4. Créer un voyage OpenAI.
5. Vérifier en console :

```js
const trip = JSON.parse(localStorage.getItem('capi_trips'))[0];
({
  generation_source: trip.generation_source,
  ai_provider: trip.ai_provider,
  ai_error: trip.ai_error,
  fallback_used: trip.fallback_used,
  prompt_version: trip.prompt_version,
  duration_ms: trip.duration_ms,
  estimated_cost_usd: trip.estimated_cost_usd,
  quality_score: trip.quality_score,
});
```

## Validation attendue

```text
[ ] Chaque voyage contient generation_source
[ ] Chaque voyage contient ai_provider
[ ] Chaque voyage contient ai_error, même null
[ ] Chaque voyage contient fallback_used
[ ] Chaque voyage contient prompt_version
[ ] Chaque voyage contient duration_ms
[ ] Chaque voyage contient estimated_cost_usd
[ ] Chaque voyage contient quality_score
[ ] En fallback Danemark / Italie, la destination reste correcte
[ ] Aucun écran blanc
```
