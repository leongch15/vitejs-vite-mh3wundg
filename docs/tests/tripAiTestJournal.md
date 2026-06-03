# Lot 6.3 — Journal de test génération IA

## Objectif

Vérifier que la génération IA produit un voyage meilleur que le générateur local, sans casser la structure attendue par l’application.

## Précondition importante

Le test IA réel n’est possible que si l’endpoint serverless `/api/generate-trip` existe.

Si `APP_MODE = AI` mais que l’endpoint n’existe pas, le service basculera en fallback local. Dans ce cas, le test ne valide pas l’IA réelle.

À vérifier après création d’un voyage :
- `generation_source = "ai"` : vraie génération IA.
- `generation_source = "local_fallback"` : l’IA a échoué ou l’endpoint n’existe pas.
- absence de `generation_source` : ancien voyage ou génération locale classique.

## Configuration de test

Pendant le test IA :

```js
export const APP_MODE = APP_MODES.AI;
```

Après le test, revenir en local si l’endpoint n’est pas stable :

```js
export const APP_MODE = APP_MODES.LOCAL;
```

## Cas 1 — Paris 3 jours modéré

### Formulaire

- Destination : Paris
- Dates : 10/07/2026 → 12/07/2026
- Budget : modéré
- Voyageurs : 2
- Style : essentiels
- Intérêts : culture, gastronomie, photo
- Marche : moyen
- Arrivée : Paris à 12:00
- Retour : Paris à 15:00
- Contraintes : aucune

### Validation attendue

- [ ] Génération source = ai
- [ ] 3 jours exactement
- [ ] Paris uniquement
- [ ] Arrivée 12:00 respectée
- [ ] Départ 15:00 respecté
- [ ] Pas de dîner le dernier jour
- [ ] Activités concrètes
- [ ] Coordonnées GPS présentes
- [ ] Budget cohérent
- [ ] Meilleur que local : oui / non

### Erreurs observées

- 

## Cas 2 — Danemark 8 jours retour Copenhague

### Formulaire

- Destination : Danemark
- Dates : 01/08/2026 → 08/08/2026
- Budget : modéré
- Voyageurs : 2
- Style : essentiels
- Intérêts : culture, nature, gastronomie, photo
- Marche : moyen
- Ville d’arrivée : Copenhague
- Ville de retour : Copenhague
- Arrivée : 10:30
- Départ : 16:00
- Contraintes : voiture

### Validation attendue

- [ ] Génération source = ai
- [ ] 8 jours exactement
- [ ] Route logique géographiquement
- [ ] Nuits groupées
- [ ] Retour à Copenhague respecté
- [ ] Aucun transport en voiture
- [ ] Transports uniquement quand la ville change
- [ ] Coordonnées GPS présentes
- [ ] Meilleur que local : oui / non

### Erreurs observées

- 

## Cas 3 — Italie économique avec contraintes

### Formulaire

- Destination : Italie
- Dates : 05/09/2026 → 11/09/2026
- Budget : économique
- Voyageurs : 2
- Style : immersion
- Intérêts : culture, gastronomie, histoire
- Marche : faible
- Ville d’arrivée : Rome
- Ville de retour : Venise
- Arrivée : 14:00
- Départ : 11:00
- Contraintes : restaurants chers, longues marches, lieux trop touristiques

### Validation attendue

- [ ] Génération source = ai
- [ ] 7 jours exactement
- [ ] Route Rome / Florence / Venise logique
- [ ] Budget économique visible
- [ ] Restaurants simples / locaux
- [ ] Marche faible respectée
- [ ] Moins d’ultra-touristique
- [ ] Pas de dîner le dernier jour
- [ ] Coordonnées GPS présentes
- [ ] Meilleur que local : oui / non

### Erreurs observées

- 

## Synthèse comparative

| Cas | Local OK ? | IA OK ? | IA meilleure ? | Erreurs principales |
|---|---:|---:|---:|---|
| Paris 3 jours |  |  |  |  |
| Danemark 8 jours |  |  |  |  |
| Italie économique |  |  |  |  |

## Erreurs IA fréquentes à surveiller

- JSON non parsable.
- Nombre de jours incorrect.
- Coordonnées GPS absentes ou non numériques.
- Dîner ajouté le jour du départ.
- Ville de retour ignorée.
- Trop de changements de ville.
- Transports ajoutés les mauvais jours.
- Contraintes ignorées.
- Budget incohérent.
- Activités trop génériques.

## Décision de validation

Le lot 6.3 est validé si :

- [ ] Les 3 générations IA ont `generation_source = "ai"`.
- [ ] Les 3 voyages s’ouvrent dans l’application.
- [ ] Aucun voyage ne casse la carte, le budget ou les accordéons.
- [ ] L’IA respecte mieux les contraintes que le local.
- [ ] Les erreurs fréquentes sont identifiées et notées.
