# Capi — Journal de décisions produit et architecture

## Lot 6.4 — Créer le journal de décisions produit

Date de création : 2026-05-22  
Statut : en cours de validation  
Objectif : documenter les choix importants faits sur l’architecture, l’IA, les cartes, le fallback et les futures APIs voyage.

---

# 1. Pourquoi documenter les décisions ?

Capi commence à passer d’un prototype fonctionnel à une application structurée.  
À partir de maintenant, chaque choix technique ou produit important doit être compréhensible dans le temps.

Ce journal permet de répondre à ces questions :

- Pourquoi ce choix a été fait ?
- Quel problème ce choix règle ?
- Quelles alternatives ont été envisagées ?
- Quels risques restent à surveiller ?
- Quand faudra-t-il revoir cette décision ?

Ce fichier doit être mis à jour à chaque décision structurante.

---

# 2. Décision — Utiliser OpenAI comme provider IA principal

## Décision

Le provider IA principal de Capi est OpenAI.

Configuration actuelle :

```text
AI_PROVIDER = openai
OPENAI_MODEL = gpt-4.1-mini
```

## Pourquoi ce choix ?

OpenAI a été choisi comme provider principal parce que :

- les générations sont plus stables que Gemini dans les tests réalisés ;
- la qualité de compréhension des contraintes voyage est meilleure ;
- le JSON structuré est plus fiable ;
- le coût observé est très faible pour le besoin actuel ;
- le temps de génération est acceptable pour une V1, même s’il doit être surveillé ;
- l’API est adaptée à un futur pipeline IA plus avancé.

## Coût observé

Observation actuelle :

```text
Paris 3 jours : environ 0,004488 $
Paris + Danemark : environ 0,01 $ pour 2 générations
```

À surveiller :

- coût d’un voyage long de 14 jours ;
- coût avec retry automatique ;
- coût avec pipeline IA multi-étapes ;
- coût avec enrichissement via APIs voyage.

## Alternative testée

Gemini a été testé comme provider gratuit ou peu coûteux.

Constats :

- Gemini fonctionne techniquement ;
- Gemini est utile comme secours ou test gratuit ;
- Gemini a rencontré des erreurs de saturation ;
- la qualité et la stabilité observées étaient moins fiables pour Capi.

## Décision associée

Gemini est conservé comme provider secondaire possible, mais OpenAI devient le provider principal.

```text
GEMINI_API_KEY = configurée côté Vercel
GEMINI_MODEL = gemini-2.5-flash-lite
```

## Risques

- coût API si l’usage augmente ;
- latence IA ;
- dépendance à un provider externe ;
- besoin de surveiller les erreurs, quotas et coûts.

## Revue future

Cette décision devra être revue quand :

- le nombre de générations augmente fortement ;
- le pipeline IA passe en plusieurs étapes ;
- une alternative moins chère atteint un niveau de qualité équivalent ;
- l’app commence à monétiser les générations.

---

# 3. Décision — Utiliser Vercel pour le déploiement et les endpoints serverless

## Décision

Capi est déployée sur Vercel.

URL actuelle :

```text
https://vitejs-vite-mh3wundg.vercel.app/
```

L’endpoint IA est :

```text
/api/generate-trip
```

## Pourquoi ce choix ?

Vercel a été choisi parce que :

- le projet est une application React/Vite ;
- Vercel gère bien les déploiements depuis GitHub ;
- Vercel permet d’avoir des endpoints serverless simples ;
- la clé OpenAI reste côté serveur ;
- le front n’appelle jamais directement OpenAI ;
- le déploiement est rapide et simple à tester ;
- l’URL publique est immédiatement partageable.

## Alternatives envisagées

- Netlify : possible, mais Vercel est plus direct avec l’architecture actuelle.
- Supabase Edge Functions : intéressant plus tard, mais pas nécessaire pour le socle actuel.
- Backend Node/Express dédié : trop lourd pour l’étape actuelle.
- Base44/Bolt uniquement : insuffisant pour servir correctement l’endpoint IA.

## Risques

- dépendance à Vercel ;
- limites éventuelles des fonctions serverless ;
- gestion des variables d’environnement à bien maîtriser ;
- nécessité de redéployer après modification des variables.

## Revue future

À revoir si :

- l’app nécessite un backend plus complexe ;
- le stockage cloud devient central ;
- les APIs voyage nécessitent une orchestration serveur plus avancée ;
- les performances serverless deviennent insuffisantes.

---

# 4. Décision — Utiliser MapLibre pour la carte

## Décision

Capi utilise MapLibre pour l’affichage cartographique.

## Pourquoi ce choix ?

MapLibre est conservé parce que :

- la carte fonctionne déjà dans l’interface actuelle ;
- les filtres par jour fonctionnent ;
- les lignes entre villes fonctionnent ;
- les popups ont été améliorées ;
- le zoom ville / pays fonctionne ;
- l’intégration actuelle est stable ;
- il n’y a pas besoin de changer de moteur cartographique à court terme.

## Alternatives possibles

- Google Maps : puissant, mais dépendance plus forte, coûts potentiels et API keys.
- Mapbox : très qualitatif, mais coûts et dépendance commerciale.
- Leaflet : simple, mais l’app est déjà stabilisée avec MapLibre.

## Décision associée

Ne pas changer la carte tant que les problèmes principaux sont liés à la qualité des itinéraires IA.

## Risques

- besoin de meilleures coordonnées GPS ;
- besoin futur de routing plus précis ;
- besoin futur d’estimation réelle des temps de trajet ;
- limites d’affichage si beaucoup de points.

## Revue future

À revoir quand :

- l’app intègre de vrais itinéraires de transport ;
- les APIs de routing sont ajoutées ;
- l’utilisateur doit naviguer étape par étape ;
- les points d’activité deviennent très nombreux.

---

# 5. Décision — Garder un fallback local

## Décision

Capi conserve un générateur local de fallback.

## Pourquoi ce choix ?

Le fallback local est essentiel parce que :

- l’IA peut échouer ;
- OpenAI peut retourner une erreur ;
- le quota peut être dépassé ;
- l’endpoint peut être indisponible ;
- le JSON peut être invalide ;
- l’app ne doit jamais créer d’écran blanc ;
- l’utilisateur doit toujours obtenir un résultat exploitable.

## Correction importante réalisée

Le fallback local utilise maintenant `formData` en priorité.

Objectif :

```text
Danemark en fallback = Danemark
Italie en fallback = Italie
```

Le fallback ne doit plus parser le texte du prompt pour récupérer la destination.

## Données à stocker

Chaque voyage doit conserver :

```text
generation_source
ai_provider
ai_error
fallback_used
prompt_version
duration_ms
estimated_cost_usd
quality_score
```

## Risques

- le fallback local est moins qualitatif que l’IA ;
- il peut donner une impression de baisse de qualité ;
- il ne doit pas être confondu avec une vraie génération IA.

## Revue future

À revoir quand :

- le Trip Quality Engine est en place ;
- le pipeline IA peut relancer automatiquement une génération ;
- l’app affiche clairement si un voyage est généré par IA ou fallback ;
- le générateur local devient uniquement un mode dégradé discret.

---

# 6. Décision — Ne pas brancher les APIs voyage tout de suite

## Décision

Les APIs voyage seront intégrées plus tard, après stabilisation de la qualité IA.

APIs envisagées :

- vols : Amadeus, Skyscanner, Duffel ou autres partenaires ;
- hébergements : Expedia Rapid, Booking partenaires, HotelsCombined ou autres ;
- activités : Viator, GetYourGuide, Tiqets, Klook ;
- cartes / lieux : Google Places, Foursquare, OpenTripMap, Geoapify ;
- transports : Rome2Rio, Omio, SNCF/Trainline partenaires si disponibles ;
- météo : OpenWeather, Meteomatics, WeatherAPI.

## Pourquoi ne pas les intégrer maintenant ?

Parce que le problème actuel n’est pas encore le prix réel ou la disponibilité réelle.

Le problème actuel est :

```text
La stratégie de voyage générée n’est pas encore assez fiable.
```

Avant d’ajouter des APIs externes, il faut stabiliser :

- la logique de route ;
- la ville de nuitée ;
- le dernier jour ;
- les répétitions ;
- les intérêts ;
- le budget estimé ;
- la qualité minimale du voyage.

## Pourquoi les intégrer plus tard ?

Les APIs voyage seront importantes pour :

- fiabiliser les prix ;
- vérifier les disponibilités ;
- proposer des liens de réservation ;
- monétiser via affiliation ;
- améliorer la crédibilité ;
- transformer Capi en vrai outil de planification + réservation.

## Stratégie recommandée

Phase 1 :

```text
Pas de réservation directe.
Liens affiliés vers activités / hôtels / vols.
Prix indicatifs.
```

Phase 2 :

```text
Prix et disponibilités approximatifs via APIs.
Comparaison hébergements / activités.
```

Phase 3 :

```text
Parcours de réservation intégré ou semi-intégré.
Affiliation optimisée.
```

## Risques

- complexité technique ;
- conditions d’accès aux APIs ;
- coûts API ;
- conformité RGPD ;
- exactitude des prix ;
- gestion des liens affiliés ;
- expérience utilisateur trop commerciale.

## Revue future

À revoir après :

- Trip Quality Engine ;
- budgetCalculator ;
- routeStrategyEngine ;
- bêta privée ;
- preuve que les utilisateurs font confiance aux voyages générés.

---

# 7. Décision — Prioriser la qualité voyage avant nouvelles fonctionnalités

## Décision

Avant d’ajouter comptes, export PDF, APIs voyage ou App Store, Capi doit d’abord améliorer la qualité réelle des voyages.

## Pourquoi ?

Les tests ont montré que l’interface est bonne, mais que les résultats IA ne sont pas encore au niveau.

Problèmes observés :

- voyage parfois mal réparti ;
- dernier jour parfois vide ;
- lieux fermés proposés ;
- répétitions ;
- budgets fragiles ;
- intérêts mal intégrés ;
- formulations génériques ;
- destinations générées en fallback incorrectes avant correction ;
- qualité insuffisante pour un lancement public.

## Conséquence produit

Les prochains lots prioritaires sont :

```text
Lot 7 — Trip Quality Engine
Lot 8 — Destination Intelligence universelle
Lot 9 — Moteur de stratégie d’itinéraire
Lot 10 — Budget et coûts fiables
Lot 11 — Pipeline IA V3
```

Les fonctionnalités comme :

- comptes utilisateur ;
- stockage cloud ;
- export PDF ;
- App Store ;
- monétisation ;
- APIs voyage ;

sont importantes, mais doivent venir après le socle qualité.

---

# 8. Décision — Garder l’UX actuelle comme base forte

## Décision

L’UX actuelle est conservée comme base de travail.

## Pourquoi ?

Les tests utilisateur personnels montrent que :

- l’accueil est clair ;
- le formulaire est utilisable ;
- la page détail est agréable ;
- les accordéons sont lisibles ;
- la carte fonctionne ;
- l’historique fonctionne ;
- l’app est déjà visuellement crédible.

## Conséquence

À court terme, éviter de refaire l’interface.

Priorité :

```text
Qualité du voyage > nouvelles pages > refonte graphique
```

## Améliorations UX à venir

Quand la qualité voyage sera meilleure :

- bloc “stratégie du voyage” ;
- effort de la journée ;
- budget détaillé ;
- badges qualité ;
- source IA / fallback discrète ;
- recommandations réservables ;
- partage ;
- export PDF.

---

# 9. Décision — Mesurer chaque génération

## Décision

Chaque voyage doit stocker une trace de génération.

Champs actuels :

```text
generation_source
ai_provider
ai_error
fallback_used
prompt_version
duration_ms
estimated_cost_usd
quality_score
```

## Pourquoi ?

Pour pouvoir :

- suivre le coût ;
- détecter les fallbacks ;
- mesurer la latence ;
- comparer les modèles ;
- comprendre les erreurs IA ;
- préparer l’optimisation produit ;
- alimenter plus tard un tableau de monitoring.

## Prochaine étape

Créer un vrai Trip Quality Engine pour remplacer le score provisoire par un score qualité métier.

---

# 10. Décision — Ne pas viser “n’importe quel voyage parfait” immédiatement

## Décision

Capi doit viser une progression contrôlée :

1. très bon sur les cas de référence ;
2. robuste sur les pays fréquents ;
3. extensible à toutes les destinations ;
4. connecté aux APIs voyage ;
5. lançable publiquement.

## Pourquoi ?

Demander à l’IA de générer “n’importe quel voyage parfait” sans règles, validation ou données structurées donne des résultats instables.

## Stratégie

- commencer avec Paris / Danemark / Italie comme tests de référence ;
- ajouter des règles génériques ;
- ajouter des règles par destination ;
- ajouter des APIs externes ;
- élargir progressivement.

L’objectif final reste bien :

```text
Générer n’importe quel voyage selon les critères utilisateur.
```

Mais cela doit passer par un moteur qualité, pas seulement par un gros prompt.

---

# 11. Synthèse des choix actuels

| Sujet | Choix actuel | Pourquoi |
|---|---|---|
| Front | React / Vite | Projet déjà construit et fonctionnel |
| Déploiement | Vercel | Simple, public, serverless |
| IA principale | OpenAI | Meilleure stabilité observée |
| Modèle IA | gpt-4.1-mini | Bon coût / qualité |
| IA secondaire | Gemini | Secours / test gratuit |
| Cartes | MapLibre | Déjà stable dans l’app |
| Stockage actuel | localStorage | Suffisant prototype |
| Stockage futur | Cloud | Nécessaire pour comptes et multi-appareils |
| Fallback | Local formData-first | Robustesse |
| APIs voyage | Plus tard | À intégrer après qualité voyage |
| Priorité actuelle | Qualité itinéraire | UX déjà bonne, résultat IA insuffisant |

---

# 12. Prochaines décisions à documenter

À documenter plus tard :

```text
[ ] choix du Trip Quality Engine
[ ] choix du système de score qualité
[ ] choix du moteur de stratégie de route
[ ] choix du calculateur budget
[ ] choix des premières APIs voyage
[ ] choix de l’authentification
[ ] choix du stockage cloud
[ ] choix de la stack mobile
[ ] choix du business model
[ ] choix des offres premium
```

---

# 13. Validation Lot 6.4

Le Lot 6.4 est terminé si :

```text
[x] Le fichier docs/PRODUCT_DECISIONS.md existe
[x] OpenAI est documenté
[x] Vercel est documenté
[x] MapLibre est documenté
[x] Le fallback local est documenté
[x] Le report des APIs voyage est documenté
[x] Les risques et revues futures sont notés
[x] L’architecture actuelle est compréhensible dans le temps
```

---

# 14. Prochaine étape

```text
Lot 6.5 — Créer une checklist de non-régression IA/local
```

Objectif : vérifier rapidement après chaque modification que l’IA, le fallback, le stockage et les pages principales fonctionnent encore.
