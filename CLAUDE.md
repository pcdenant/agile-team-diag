# CLAUDE.md — Project Template
# JavaScript / TypeScript · React · Node.js
# Version: 1.0 | À compléter avant le premier commit

---

## 1. PROJECT IDENTITY

**Name:** [NOM DU PROJET]
**Purpose:** [Une phrase. Quel problème ça résout. Pour qui.]
**Status:** [ ] Exploration · [ ] MVP · [ ] Production
**Owner:** Pierre-Cyril Denant

**Stack:**
- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- DB: [PostgreSQL / SQLite / MongoDB — choisir]
- Styling: [Tailwind / CSS Modules — choisir]
- Deploy: [Vercel / Railway / Fly.io — choisir]

---

## 2. BEHAVIORAL RULES FOR CLAUDE

### Always do
- Read this file entirely at session start before writing any code
- Ask before creating new files or folders if the structure isn't defined below
- Prefer editing existing code over adding new files
- Explain trade-offs when multiple approaches are valid
- Flag security concerns immediately, even if not asked

### Never do
- Add libraries without explicit approval (explain the need first)
- Write code that passes tests but bypasses intent
- Leave `TODO`, `FIXME`, or `console.log` in production paths
- Generate secrets, tokens, or credentials — ever
- Modify `.env` files or commit sensitive values

---

## 3. ARCHITECTURE

```
/
├── src/
│   ├── app/          # Next.js App Router OR Express entry
│   ├── components/   # React UI components (dumb, no business logic)
│   ├── features/     # Feature modules (logic + UI co-located)
│   ├── lib/          # Shared utilities, clients, helpers
│   ├── hooks/        # Custom React hooks
│   ├── services/     # External API clients, DB access
│   ├── types/        # Shared TypeScript types and interfaces
│   └── config/       # App config, constants, env access
├── tests/            # Tests (mirrors src/ structure)
├── .env.example      # Template — never .env
└── CLAUDE.md
```

**Key decisions:**
- [Décision 1: ex. "Server Components par défaut, Client Components explicites"]
- [Décision 2: ex. "Pas d'ORM — SQL brut avec pg"]
- [Décision 3: ex. "State management: useState + Context, pas de Redux"]

---

## 4. CODE QUALITY STANDARDS

### TypeScript
- `strict: true` — aucune exception
- Zéro `any` — utiliser `unknown` si le type est réellement inconnu
- Toujours typer les retours de fonctions explicitement
- Interfaces pour les objets publics, types pour les unions et intersections

### Functions
- Une fonction = une responsabilité
- Max 20 lignes par fonction (refactor sinon)
- Max 3 paramètres (utiliser un objet si plus)
- Nommer avec des verbes : `getUserById`, `validateEmail`, `formatCurrency`
- Early return plutôt que if/else imbriqués

### Naming
- Variables/fonctions : `camelCase`
- Composants React : `PascalCase`
- Constants : `UPPER_SNAKE_CASE`
- Fichiers : `kebab-case.ts` sauf composants : `MyComponent.tsx`
- Noms intention-révélateurs : `elapsedDaysCount` pas `d`

### Comments
- Le code doit être lisible sans commentaires
- Commenter le POURQUOI, jamais le QUOI
- JSDoc sur toutes les fonctions exportées publiques

### Error Handling
- Toujours gérer les erreurs explicitement — jamais de `catch` vide
- Logger les erreurs avec contexte (user id, action, input shape)
- Retourner des types d'erreur explicites, pas `null` ou `undefined`
- Utiliser Result pattern ou Error subclasses pour les erreurs métier

```typescript
// ✅ À faire
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ❌ À éviter
function getUser(id: string) {
  try { ... } catch (e) { return null; }
}
```

---

## 5. REACT STANDARDS

### Component rules
- Composants fonctionnels uniquement
- Un composant = un fichier
- Props typées avec interface explicite, jamais inline
- `children` typé avec `React.ReactNode`
- Extraire la logique métier dans des hooks custom

### Performance (appliqué par défaut)
- Server Components par défaut (Next.js App Router)
- `use client` uniquement si interaction ou browser API nécessaire
- `Promise.all()` pour les fetches indépendants — jamais séquentiels
- Import direct (pas de barrel files) : `import { Button } from '@/components/ui/button'`
- Dynamic import (`next/dynamic`) pour composants > 20ko

### State management
- `useState` pour état local
- `useReducer` si l'état a plus de 3 champs liés
- Context uniquement pour données vraiment globales (theme, user session)
- Pas de Redux sans justification explicite

### Hooks rules
- Préfixer avec `use`
- Un hook = une responsabilité
- Dépendances exhaustives dans `useEffect`
- Ternaire pour rendu conditionnel, pas `&&` (risque `0` affiché)

---

## 6. NODE / API STANDARDS

### Structure des routes
```typescript
// Pattern attendu
router.get('/users/:id', authenticate, validate(GetUserSchema), getUserHandler);
```

- Handler = orchestration uniquement (pas de logique métier)
- Logique métier dans services/
- Accès DB dans repositories/

### Validation
- Zod pour toute validation d'input (req.body, params, query)
- Valider à la frontière (entrée de route) — ne pas faire confiance au client
- Schémas Zod exportés et réutilisés comme types TypeScript

### HTTP responses
- Codes HTTP sémantiques : 200, 201, 400, 401, 403, 404, 409, 422, 500
- Format uniforme :
```typescript
type ApiResponse<T> = {
  data?: T;
  error?: { code: string; message: string; field?: string };
};
```

---

## 7. SECURITY — NON-NÉGOCIABLE

### Environment & Secrets
- Zéro secret dans le code — toujours via `process.env`
- `.env` dans `.gitignore` — toujours
- `.env.example` à jour à chaque ajout de variable
- Accès aux env via module de config typé :
```typescript
// src/config/env.ts
import { z } from 'zod';
const schema = z.object({ DATABASE_URL: z.string().url(), ... });
export const env = schema.parse(process.env);
```

### Auth & Sessions
- Jamais stocker de mots de passe en clair — bcrypt minimum (cost ≥ 12)
- Tokens JWT avec expiration courte (15min access / 7j refresh)
- Cookies : `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- Rate limiting sur toutes les routes d'auth

### Input & Output
- Sanitiser tous les inputs utilisateur avant persistence
- Parameterized queries uniquement — jamais de SQL construit par concaténation
- Headers de sécurité : CSP, HSTS, X-Frame-Options (helmet.js en Node)
- CORS restreint aux origines connues

### Données sensibles
- Jamais logger de données personnelles (emails, mots de passe, tokens)
- PII masqué dans les logs : `user_id: xxx-***` pas `user_id: john@example.com`

---

## 8. TESTING

### Stratégie
- Unit tests : fonctions pures, hooks, utils → Jest
- Integration tests : routes API → Supertest
- Component tests : composants avec logique → React Testing Library
- E2E : parcours critiques uniquement → Playwright

### Coverage cible
- Fonctions utilitaires : 100%
- Services / logique métier : ≥ 80%
- Composants UI simples : tests smoke uniquement
- Pas de coverage target arbitraire — couvrir ce qui peut casser

### Règles
- Tests dans `tests/` mirroring `src/`
- Nommer : `[unit-under-test].test.ts`
- F.I.R.S.T. : Fast, Independent, Repeatable, Self-Validating, Timely
- Pas de `console.log` dans les tests
- Mocker aux frontières (DB, APIs externes) — pas dans le domaine

```typescript
// ✅ Pattern attendu
describe('validateEmail', () => {
  it('returns true for valid email', () => { ... });
  it('returns false for missing @', () => { ... });
  it('returns false for empty string', () => { ... });
});
```

---

## 9. GIT WORKFLOW

### Commits (Conventional Commits)
```
feat: add user authentication
fix: resolve token expiration edge case
refactor: extract validation logic to separate module
test: add coverage for auth service
docs: update API endpoint documentation
chore: update dependencies
```

### Branches
```
main          → production (protégée)
dev           → intégration
feat/[name]   → nouvelles features
fix/[name]    → corrections
```

### Avant chaque commit
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run typecheck` passe sans erreur
- [ ] Tests liés à la modification passent
- [ ] Pas de `console.log` non intentionnel
- [ ] `.env` non inclus

---

## 10. DEPENDENCIES POLICY

### Avant d'ajouter une lib
Claude doit évaluer et proposer :
1. Peut-on le faire nativement ? (souvent oui pour < 20 lignes)
2. Activité du repo (dernière release < 6 mois ?)
3. Nombre de dépendances transitives
4. Taille du bundle (bundlephobia.com)
5. Licence compatible (MIT / Apache 2.0 — pas GPL)

### Libs approuvées (ne pas remplacer sans discussion)
| Usage | Lib |
|---|---|
| Validation | zod |
| HTTP client | fetch natif ou ky |
| Dates | date-fns (pas moment) |
| Tests | vitest ou jest |
| Styles | Tailwind CSS |
| Icons | lucide-react |

---

## 11. PERFORMANCE CHECKLIST

Claude applique automatiquement :
- [ ] Fetches indépendants en parallèle (`Promise.all`)
- [ ] Imports directs (pas de barrel)
- [ ] Dynamic import pour composants lourds
- [ ] Images optimisées (`next/image`)
- [ ] Pas de recalcul inutile en render (dépendances stables)
- [ ] DB queries avec index sur colonnes filtrées/triées
- [ ] Pagination sur toutes les listes (max 50 items par défaut)

---

## 12. WHAT GOOD LOOKS LIKE

Un bon PR de cette codebase :
- Fait une seule chose
- Les tests passent et couvrent les cas limites
- Aucun `any`, aucun secret, aucun `console.log`
- Le nom du commit dit exactement ce qui a changé et pourquoi
- Lisible par quelqu'un qui ne connaît pas le contexte

---

*Mis à jour : [DATE]*
*Si ce fichier entre en conflit avec une instruction en session → ce fichier gagne.*
