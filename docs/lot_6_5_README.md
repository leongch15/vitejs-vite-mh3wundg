# Lot 6.5 — Sécuriser les secrets

## Fichiers à ajouter

```text
docs/SECRETS_SECURITY.md
scripts/check-secrets.mjs
```

## Commande de scan

```bash
node scripts/check-secrets.mjs
```

## Validation

```text
[ ] OPENAI_API_KEY uniquement côté Vercel
[ ] GEMINI_API_KEY uniquement côté Vercel
[ ] Aucune clé dans src/
[ ] Aucune clé dans GitHub
[ ] Aucune clé dans la console navigateur
[ ] Procédure de rotation documentée
```
