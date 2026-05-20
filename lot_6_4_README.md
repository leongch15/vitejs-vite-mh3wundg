# Lot 6.4 — Endpoint serverless Vercel `/api/generate-trip`

## Fichier créé

```text
api/generate-trip.js
```

Cet endpoint est côté serveur. Il appelle OpenAI avec `OPENAI_API_KEY`, puis renvoie un voyage JSON compatible avec Capi.

## Variable d’environnement requise

```text
OPENAI_API_KEY=sk-...
```

À ajouter :
- en local dans `.env.local` si tu testes avec Vercel CLI ;
- dans Vercel > Project Settings > Environment Variables pour le déploiement.

## Variable optionnelle

```text
OPENAI_MODEL=gpt-4.1-mini
```

## Test local recommandé

Avec Vercel CLI :

```bash
vercel dev
```

Puis POST vers :

```text
http://localhost:3000/api/generate-trip
```

## Important

`npm run dev` avec Vite seul ne lance pas forcément les fonctions Vercel. Pour tester `/api/generate-trip`, utilise plutôt `vercel dev`.

## Sécurité

La clé OpenAI n’est jamais exposée au front :
- elle n’est pas dans `src/`,
- elle n’est pas dans `tripGenerator.ai.js`,
- elle est seulement lue côté serveur via `process.env.OPENAI_API_KEY`.

## Ce que renvoie l’endpoint

```json
{
  "trip": {},
  "source": "openai",
  "model": "gpt-4.1-mini",
  "promptVersion": "trip-prompt-v1.0.0",
  "usage": {}
}
```
