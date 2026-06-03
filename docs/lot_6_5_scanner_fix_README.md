# Correctif Lot 6.5 — Secret scanner v2

## Problème corrigé

Le premier script détectait certains placeholders documentaires comme des secrets :

```text
GEMINI_API_KEY=AIza-xxx
GEMINI_API_KEY=ta clé Gemini
```

Ce n’étaient pas de vraies fuites, mais des faux positifs.

## Fichier à remplacer

```text
scripts/check-secrets.mjs
```

## Test

```bash
node scripts/check-secrets.mjs
```

Résultat attendu :

```text
✅ Aucun secret évident détecté.
```

## Important

Si une vraie clé a déjà été copiée dans GitHub, StackBlitz, une capture ou une conversation, il faut la supprimer et la régénérer côté provider.
