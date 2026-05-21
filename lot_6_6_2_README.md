# Lot 6.6.2 — Ajouter Gemini comme provider de test gratuit

## Fichiers

```text
api/generate-trip.js
.env.local.example
```

## Variables Vercel à ajouter

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=ta clé Gemini
GEMINI_MODEL=gemini-2.5-flash
```

Tu peux garder `OPENAI_API_KEY` et `OPENAI_MODEL` pour plus tard, mais l’endpoint utilisera Gemini tant que `AI_PROVIDER=gemini`.

## Étapes

1. Remplacer `api/generate-trip.js`.
2. Ajouter les variables dans Vercel.
3. Redeploy.
4. Garder `APP_MODE = APP_MODES.AI`.
5. Réinitialiser la démo sur le site Vercel.
6. Créer un voyage Paris 3 jours.
7. Vérifier :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].generation_source
```

Résultat attendu :

```text
ai
```

Puis :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].ai_provider
```

Résultat attendu :

```text
gemini
```

## Si fallback

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].ai_error
```

## Notes

L’endpoint garde le même chemin `/api/generate-trip`. Le front n’a donc pas besoin d’être modifié.
