# Capi — Sécurité des secrets

## Lot 6.5 — Sécuriser les secrets

Date de création : 2026-05-22  
Objectif : garantir qu’aucune clé API sensible ne se retrouve dans le front, dans GitHub ou dans la console navigateur.

---

# 1. Principe de sécurité

Les clés API sensibles doivent toujours rester côté serveur.

## Secrets concernés maintenant

```text
OPENAI_API_KEY
GEMINI_API_KEY
```

## Secrets concernés plus tard

```text
AMADEUS_API_KEY
AMADEUS_API_SECRET
SKYSCANNER_API_KEY
EXPEDIA_RAPID_API_KEY
VIATOR_API_KEY
GETYOURGUIDE_API_KEY
GOOGLE_PLACES_API_KEY
STRIPE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Règle absolue

```text
Aucune clé sensible ne doit être présente dans src/
Aucune clé sensible ne doit être commitée dans GitHub
Aucune clé sensible ne doit être visible dans la console navigateur
Aucune clé sensible ne doit être préfixée par VITE_
```

---

# 2. Variables autorisées côté front

Les variables exposées au navigateur peuvent exister seulement si elles ne sont pas secrètes.

## Autorisées

```text
VITE_APP_MODE=ai
VITE_PUBLIC_APP_NAME=Capi
VITE_PUBLIC_ENV=production
```

## Interdites

```text
VITE_OPENAI_API_KEY
VITE_GEMINI_API_KEY
VITE_STRIPE_SECRET_KEY
VITE_EXPEDIA_RAPID_API_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY
```

Pourquoi : avec Vite, une variable préfixée par `VITE_` peut être intégrée dans le bundle front et donc devenir visible côté navigateur.

---

# 3. Variables Vercel attendues

Dans Vercel → Project → Settings → Environment Variables.

## Production

```text
VITE_APP_MODE=ai
AI_PROVIDER=openai
OPENAI_API_KEY=configurée côté Vercel
OPENAI_MODEL=gpt-4.1-mini
GEMINI_API_KEY=configurée côté Vercel
GEMINI_MODEL=gemini-2.5-flash-lite
```

## Preview

Même logique que Production, sauf si tu veux tester un provider différent.

```text
VITE_APP_MODE=ai
AI_PROVIDER=openai
OPENAI_API_KEY=configurée côté Vercel
OPENAI_MODEL=gpt-4.1-mini
GEMINI_API_KEY=configurée côté Vercel
GEMINI_MODEL=gemini-2.5-flash-lite
```

## Development

Optionnel selon ton usage.

```text
VITE_APP_MODE=local
AI_PROVIDER=openai
OPENAI_API_KEY=configurée côté Vercel si vercel dev est utilisé
```

---

# 4. Variables à ne jamais mettre dans le code

Ne jamais écrire dans un fichier :

```js
const apiKey = "sk-...";
const geminiKey = "AIza...";
```

Ne jamais écrire :

```js
OPENAI_API_KEY: "sk-..."
GEMINI_API_KEY: "AIza..."
```

Ne jamais mettre une clé dans :

```text
src/
public/
README.md
docs/
console.log()
localStorage
sessionStorage
window
```

---

# 5. Fichiers à ignorer par Git

Le fichier `.gitignore` doit contenir :

```gitignore
.env
.env.local
.env.*.local
*.local
```

Le fichier `.env.local` peut exister en local, mais il ne doit jamais être commit.

---

# 6. Fichiers autorisés

Ces fichiers peuvent être commités car ils ne contiennent pas de vraie clé :

```text
.env.example
.env.local.example
docs/SECRETS_SECURITY.md
docs/PRODUCT_DECISIONS.md
docs/PROJECT_STATUS.md
```

Ils doivent contenir uniquement des valeurs fictives :

```text
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=AIza-xxx
```

---

# 7. Règle pour les futurs providers voyage

Quand une API voyage sera ajoutée, appliquer la même règle :

## Si la clé donne accès à un compte, un quota, une facturation ou une donnée sensible

```text
Serveur uniquement
Pas de VITE_
Pas dans src/
Pas dans GitHub
Pas dans la console
```

## Si la clé est uniquement publique et prévue pour être exposée

Exemple possible plus tard : certaines clés de carte ou SDK publics.

Dans ce cas :

```text
Préfixe VITE_ possible
Restriction de domaine obligatoire
Quota limité
Monitoring activé
Documentation obligatoire
```

---

# 8. Rotation de clé en cas de fuite

Une clé est considérée comme exposée si elle apparaît dans :

```text
GitHub
StackBlitz public
console navigateur
screenshot partagé
message ChatGPT
fichier ZIP envoyé
historique de commit
localStorage
```

## Procédure immédiate

1. Aller dans le dashboard du provider.
2. Révoquer ou supprimer la clé exposée.
3. Créer une nouvelle clé.
4. Remplacer la variable dans Vercel.
5. Redéployer Vercel.
6. Vérifier que l’app fonctionne.
7. Scanner le dépôt.
8. Documenter l’incident dans `docs/SECURITY_INCIDENTS.md` si nécessaire.

## Pour OpenAI

```text
OpenAI Platform → API keys → supprimer la clé exposée → créer une nouvelle clé
```

## Pour Gemini

```text
Google AI Studio → API keys → supprimer ou régénérer la clé exposée
```

---

# 9. Checklist avant chaque push

Avant chaque push important :

```text
[ ] Aucun fichier .env n’est modifié
[ ] Aucun OPENAI_API_KEY en clair
[ ] Aucun GEMINI_API_KEY en clair
[ ] Aucun sk- dans src/
[ ] Aucun AIza dans src/
[ ] Aucun console.log d’objet contenant des secrets
[ ] scripts/check-secrets.mjs exécuté
```

---

# 10. Checklist navigateur

Sur le site Vercel, ouvrir la console et vérifier :

```js
Object.keys(window).filter((key) => key.toLowerCase().includes('key'))
```

Puis vérifier localStorage :

```js
Object.entries(localStorage).filter(([key, value]) =>
  `${key} ${value}`.toLowerCase().includes('openai') ||
  `${key} ${value}`.toLowerCase().includes('gemini') ||
  `${key} ${value}`.includes('sk-') ||
  `${key} ${value}`.includes('AIza')
)
```

Résultat attendu :

```text
[]
```

Attention : il est normal de voir des métadonnées comme `ai_provider` ou `generation_source`. Il ne doit jamais y avoir de vraie clé.

---

# 11. Checklist GitHub

Dans GitHub, utiliser la recherche du dépôt avec :

```text
OPENAI_API_KEY
GEMINI_API_KEY
sk-
AIza
API_KEY
SECRET
```

Résultat attendu :

```text
Aucune vraie clé
```

Les noms de variables comme `OPENAI_API_KEY` peuvent apparaître dans la documentation ou le code serveur. Les valeurs réelles ne doivent jamais apparaître.

---

# 12. Validation Lot 6.5

Le Lot 6.5 est validé si :

```text
[ ] docs/SECRETS_SECURITY.md existe
[ ] scripts/check-secrets.mjs existe
[ ] .gitignore ignore bien .env et .env.local
[ ] OPENAI_API_KEY est uniquement dans Vercel
[ ] GEMINI_API_KEY est uniquement dans Vercel
[ ] Aucune clé réelle dans src/
[ ] Aucune clé réelle dans GitHub
[ ] Aucune clé réelle dans la console navigateur
[ ] Procédure de rotation connue
[ ] Variables séparées par environnement
```

---

# 13. Prochaine étape

```text
Lot 6.6 — Créer une checklist de non-régression IA/local
```

Objectif : vérifier après chaque changement que l’IA, le fallback, le stockage et les pages principales fonctionnent encore.
