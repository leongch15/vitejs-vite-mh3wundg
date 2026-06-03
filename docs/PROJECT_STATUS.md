# Capi — État stable Lot 6.1

## Date de gel

Date : 2026-05-22

## Version Git

Tag stable prévu :

```text
capi-lot-6-1-stable
```

Repository GitHub :

```text
leongch15/vitejs-vite-mh3wundg
```

## URL de production Vercel

```text
https://vitejs-vite-mh3wundg.vercel.app/
```

## État fonctionnel actuel

```text
[x] Application accessible en ligne
[x] Page d’accueil fonctionnelle
[x] Page Mes voyages fonctionnelle
[x] Page détail voyage fonctionnelle
[x] Carte fonctionnelle
[x] Création de voyage possible
[x] Ouverture d’un voyage possible
[x] Aucun écran blanc observé
[x] Génération IA connectée
[x] Provider IA principal : OpenAI
[x] Fallback local actif
[x] Validation post-IA active
[ ] Qualité des voyages IA encore insuffisante pour lancement public
```

## Provider IA actuel

```text
Provider principal : OpenAI
Modèle principal : gpt-4.1-mini
Provider secondaire disponible : Gemini
Modèle Gemini de secours : gemini-2.5-flash-lite
```

## Variables Vercel configurées

Ne jamais noter les valeurs secrètes.

```text
VITE_APP_MODE = ai
AI_PROVIDER = openai
OPENAI_API_KEY = configurée côté Vercel
OPENAI_MODEL = gpt-4.1-mini
GEMINI_API_KEY = configurée côté Vercel
GEMINI_MODEL = gemini-2.5-flash-lite
```

## Coût observé

Observation actuelle :

```text
Environ 0,01 $ pour 2 générations :
- Paris 3 jours
- Danemark 8 jours
```

Estimation observée :

```text
Environ 0,005 $ par génération courte/moyenne
```

Points à surveiller :

```text
- coût réel sur voyages longs
- coût Italie 14 jours
- coût avec retries IA
- coût avec pipeline multi-étapes
- coût après ajout des APIs voyage
```

## Problème principal actuel

L’application fonctionne techniquement, mais les voyages générés par l’IA ne sont pas encore assez fiables pour une mise en production grand public.

Problèmes observés :

```text
- dernier jour parfois vide
- lieux fermés placés au mauvais jour
- budget parfois trop optimiste
- itinéraires longs mal répartis
- répétitions de lieux
- intérêts utilisateur parfois mal incarnés
- fallback local parfois utilisé si l’IA échoue
- nécessité de créer un Trip Quality Engine
```

