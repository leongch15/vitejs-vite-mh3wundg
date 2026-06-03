# Lot 6.2 — Nettoyer le mode IA/local

## Fichiers à remplacer

```text
src/api/base44Client.js
src/services/tripGenerator.ai.js
```

## Objectif

- `VITE_APP_MODE` pilote le front.
- `AI_PROVIDER` pilote le backend.
- Le fallback local utilise `formData` en priorité.
- Le mode local ne parse plus le prompt texte pour récupérer la destination.
- Danemark / Italie en fallback ne doivent plus générer Paris.

## Ce qui change

### base44Client.js

Avant : en mode local, l’app appelait `generateLocalTripFromPrompt(prompt)`, donc elle pouvait dépendre du texte du prompt.

Maintenant : en mode local, l’app appelle `generateLocalTrip` avec les valeurs du formulaire.

### tripGenerator.ai.js

Avant : si `formData` était absent ou mal transmis, le fallback pouvait parser le prompt texte et revenir à Paris.

Maintenant : le fallback ne parse plus le prompt texte. Il utilise `formData`. Si aucune destination n’est fournie, Paris reste seulement la valeur de secours ultime.

## Tests de validation

1. Garder `VITE_APP_MODE=ai` dans Vercel.
2. Provoquer ou attendre un fallback IA, ou tester pendant une indisponibilité IA.
3. Créer un voyage Danemark.
4. Vérifier :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].generation_source
```

Si le résultat est `local_fallback`, vérifier :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].destination
```

Résultat attendu :

```text
Danemark
```

Même logique pour Italie.

## Validation attendue

```text
[x] Danemark en fallback ne génère plus Paris
[x] Italie en fallback ne génère plus Paris
[x] VITE_APP_MODE pilote toujours le front
[x] AI_PROVIDER pilote toujours le backend
[x] Aucun écran blanc
```
