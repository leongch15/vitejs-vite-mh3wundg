# Lot 6.9 — Stabiliser APP_MODE = AI / fallback local

## Fichiers à remplacer

```text
src/config/appConfig.js
src/api/base44Client.js
src/services/tripGenerator.ai.js
```

## Principe

Avant, `APP_MODE` était codé directement dans `appConfig.js`.

Maintenant, le mode est piloté par une variable publique Vite :

```text
VITE_APP_MODE=local
```

ou :

```text
VITE_APP_MODE=ai
```

Cette variable est publique, mais ce n’est pas un problème : elle ne contient aucune clé API.

## Comportement

- Si `VITE_APP_MODE` n’existe pas : l’app reste en LOCAL.
- Si `VITE_APP_MODE=local` : générateur local.
- Si `VITE_APP_MODE=ai` : appel de `/api/generate-trip`.
- Si l’IA échoue : fallback local automatique.
- Le voyage sauvegardé indique :
  - `generation_source = "ai"` si IA OK ;
  - `generation_source = "local_fallback"` si l’IA échoue ;
  - `ai_error` en cas de fallback.

## Vercel

Dans Vercel → Settings → Environment Variables, ajouter :

```text
VITE_APP_MODE = ai
```

À cocher au minimum pour Production.

Après modification : Redeploy obligatoire.

## Local / Bolt

Tu peux ne rien mettre : l’app restera en local.

## Tests

Dans Vercel, après redéploiement :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].generation_source
```

Attendu si IA OK :

```text
ai
```

Attendu si fallback :

```text
local_fallback
```

Puis :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].ai_error
```

pour comprendre l’erreur éventuelle.
