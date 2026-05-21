# Lot 6.7 — Parser / sécuriser le JSON strict

## Fichier à remplacer

```text
api/generate-trip.js
```

## Ce qui change

- Parsing JSON plus robuste.
- Suppression des éventuels blocs ```json.
- Extraction du premier objet JSON si l’IA ajoute du texte autour.
- Correction des virgules finales simples.
- Refus si le JSON racine n’est pas un objet.
- Refus si `itinerary` est absent ou vide.
- Normalisation des tableaux `tips`, `must_book`, `weather_alternative`.
- Normalisation des jours.
- Normalisation des activités.
- Normalisation des coordonnées GPS en nombre.
- Normalisation de `transport_to_next`.
- Message `ai_error` plus utile en cas de JSON cassé.

## Après remplacement

1. Push GitHub.
2. Redéploiement Vercel.
3. Réinitialiser la démo.
4. Créer un Paris 3 jours.
5. Vérifier :

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
