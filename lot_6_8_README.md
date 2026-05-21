# Lot 6.8 — Validation post-IA avant sauvegarde

## Fichiers à remplacer

```text
api/generate-trip.js
src/api/base44Client.js
src/pages/Home.jsx
```

## Ce que ça fait

- Home.jsx transmet maintenant `formData` au service IA.
- base44Client.js relaie `form` vers `generateTripWithAI`.
- L’endpoint valide la réponse IA après parsing.
- L’endpoint répare les petits manques :
  - jours manquants ;
  - activités vides ;
  - coordonnées ;
  - soirée libre ;
  - départ dernier jour ;
  - transports inter-villes.
- L’endpoint supprime les doublons simples dans météo / conseils / réservations.
- L’endpoint refuse les réponses trop cassées.
- Le champ `post_ai_validation` est ajouté au voyage IA.

## Après remplacement

1. Push GitHub.
2. Redeploy Vercel.
3. Réinitialiser la démo.
4. Créer un Paris 3 jours.
5. Vérifier :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].generation_source
```

Attendu :

```text
ai
```

Puis :

```js
JSON.parse(localStorage.getItem('capi_trips'))[0].post_ai_validation
```

Attendu :

```text
{ status: "valid" ou "repaired", warnings: [...] }
```
