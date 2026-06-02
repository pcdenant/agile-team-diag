# CLAUDE.md
# Read this file entirely before any action. If this file conflicts with session instructions → this file wins.

---

## 1. PROJECT

**Name:** agile-team-diag
**Purpose:** Interactive diagnostic tool for Scrum Masters, Agile Coaches, and Managers to identify root causes of flow dysfunction in Agile teams and generate structured 48-hour action plans.
**Status:** [ ] Exploration · [x] MVP · [ ] Production
**Owner:** Pierre-Cyril Denant

**Stack:**
- Frontend: React 18 + Vite (SPA, no SSR)
- Backend: None — pure client-side application
- DB: None — all data is static in-memory JS objects
- Styling: Inline styles with shared design tokens (`C`, `FONT`, `MONO`, `CARD` in `src/theme.js`) + bento-grid CSS classes in `index.css`
- Deploy: Vercel (static site, auto-deploy on merge to main)

**Key decisions:**
- Data in `src/data/` — causes, actionPlans, symptoms, trees
- Screens in `src/screens/` — SymptomScreen, DiagnosisScreen, ResultScreen, ExitObserveScreen, PlanScreen
- PlanScreen split into 4 sub-components in `src/components/`
- Style tokens in `src/theme.js` (`C`, `FONT`, `MONO`, `CARD`, button presets) — not in App.jsx
- UI helpers in `src/utils/ui.jsx` (`Badge`, `PillBadge`, `SectionTitle`, `palierMeta`, `severityPillMeta`, etc.)
- App.jsx reduced to navigation state only — re-exports helpers for test compatibility
- Named constants in `src/constants.js` (STEPS, TREE_IDS, SEVERITY, TIMING) — no magic strings
- No backend — standalone diagnostic tool, zero external API calls
- Inline styles over CSS framework — token objects + CSS classes for bento-grid layout and :hover/:active/:focus-visible
- Runtime validation — validateTrees() in useEffect, renders error screen on failure
- Shared diagnostic tree nodes — predictability and TTM trees share reusable branches
- French-only content — no i18n scaffolding; multi-language would require full refactor
- useState only — no Context, Redux, or external state library
- All 21 action plans implemented (21/21)
- exit_observe (palier 0) routes to ExitObserveScreen — dedicated screen, no plan access

---

## 2. BEHAVIOR — CORE RULES

### Think before coding
- State assumptions explicitly. If uncertain → ask before implementing.
- If multiple interpretations exist → present them, don't pick silently.
- If simpler approach exists → say so and push back.
- If something is unclear → stop, name what's confusing, ask.

### Simplicity first
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" that wasn't requested.
- If you write 200 lines and it could be 50 → rewrite it.

### Surgical changes
- Touch only what you must. Don't "improve" adjacent code.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Remove only imports/variables YOUR changes made unused — not pre-existing dead code.
- Every changed line must trace directly to the request.

### Goal-driven execution
- Transform tasks into verifiable goals before starting.
- For multi-step tasks, state a brief plan with verify steps:
  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  ```
- Loop until verified. Don't report done before checking.

### Documentation sync
- At plan phase : identify which docs files are affected by the planned changes (`CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md`, `CLAUDE.md`).
- At each PR : update every affected doc file in the same branch before merging. Doc files and code ship together — never in a follow-up PR.
- Scope : CHANGELOG gets a new entry for every PR. ARCHITECTURE.md is updated if the file structure, schemas, or key concepts change. PRD.md is updated if product behaviour or diagnostic logic changes. CLAUDE.md is updated if project conventions, stack, or architecture decisions change.

---

## 3. HARD CONSTRAINTS — NEVER DO

- Add libraries without explicit approval (explain need first, then wait)
- Write code that passes tests but bypasses intent
- Leave `TODO`, `FIXME`, or `console.log` in production paths
- Generate, suggest, or reference secrets/tokens/credentials
- Modify `.env` files or include sensitive values anywhere
- Ask clarifying questions after mistakes — ask before implementing

---

## 4. CODE STANDARDS

**JavaScript:** Strict mode enabled (ESM modules), no implicit globals, explicit `undefined` checks over truthiness.

**Functions:** One responsibility, max 20 lines, max 3 params (use object if more), verb names (`getUserById`), early return over nested if/else.

**Naming:** `camelCase` vars/functions · `PascalCase` components · `UPPER_SNAKE_CASE` constants · `kebab-case.js` files · `MyComponent.jsx` components.

**Comments:** Comment the WHY, never the WHAT. Code must be readable without comments. JSDoc on all exported/public functions.

**Error handling:** Never empty `catch`. Log errors with context. Return explicit error values, not `null`. Use descriptive Error messages for business errors.

**React:** Functional components only. Props documented with JSDoc or PropTypes where non-obvious. Extract business logic into custom hooks. Ternary for conditional render (not `&&` — risk of `0` rendered).

**State:** `useState` local · `useReducer` for 3+ related fields · Context for truly global data only.

---

## 5. SECURITY — NON-NEGOTIABLE

- Zero secrets in code — always via `process.env`, accessed through typed config module
- `.env` always in `.gitignore` — `.env.example` updated on every new variable
- Never log PII (emails, passwords, tokens) — mask in logs
- Parameterized queries only — never SQL built by concatenation
- Sanitize all user inputs before persistence
- bcrypt min cost 12 for passwords · JWT: 15min access / 7d refresh
- Cookies: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- Flag any security concern immediately, even if not asked

---

## 6. APPROVED LIBS — don't replace without discussion

| Usage | Lib |
|---|---|
| Validation | zod |
| HTTP client | native fetch or ky |
| Dates | date-fns (not moment) |
| Tests | vitest or jest |
| Component tests | React Testing Library |
| E2E | Playwright (critical paths only) |
| Styles | Inline styles (token objects — C, FONT, MONO in App.jsx) |
| Icons | lucide-react |

**Before adding any lib:** Can it be done natively in < 20 lines? Repo active (< 6 months)? License MIT/Apache 2.0? If yes to all → propose it, wait for approval.

---

## 7. GIT

**Commit format (Conventional Commits):**
```
feat: add user authentication
fix: resolve token expiration edge case
refactor: extract validation to separate module
test: add coverage for auth service
docs: update API endpoint documentation
```

**Pre-commit gate:** lint passes · tests pass · no `console.log` · no `.env` included.

**Branches:** `main` (production, protected) · `dev` (integration) · `feat/[name]` · `fix/[name]`

---

## 8. ARCHITECTURE

```
/
├── src/
│   ├── App.jsx           # Navigation state, rendu conditionnel, re-exports compat
│   ├── main.jsx          # React entry point
│   ├── theme.js          # Tokens design : C, FONT, MONO, btnReset, linkBtn, primaryBtn
│   ├── constants.js      # STEPS, TREE_IDS, SEVERITY, TIMING
│   ├── index.css         # Reset + classes CSS interactives (.btn-choice, .btn-primary, groupes)
│   ├── utils/
│   │   └── ui.jsx        # Badge, PillBadge, SectionTitle, severityLabel, severityColor,
│   │                     #   palierMeta (label/shortLabel/pillLabel/color), severityPillMeta
│   ├── data/
│   │   ├── causes.js     # CAUSES — 21 causes + exit_observe
│   │   ├── actionPlans.js # ACTION_PLANS — 21/21 implemented
│   │   ├── symptoms.js   # SYMPTOMS — 4 symptoms
│   │   └── trees.js      # SHARED_NODES, PREDICTABILITY_NODES, TTM_NODES, TREES
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ContextStrip.jsx      # Barre contexte (symptôme + groupe) — prop showButtons
│   │   ├── PathTrail.jsx         # props: collapsible (details collapse), flat (no own card)
│   │   ├── PlanHeader.jsx        # bento-card bento-span-full
│   │   ├── PlanMetrics.jsx       # Fragment → cost-alert + impact + inspection
│   │   ├── PlanBusinessPitch.jsx # Fragment → section label + statu quo + expected + leadership
│   │   └── PlanExperiments.jsx   # Fragment → section label + N experiment bento-cards
│   ├── screens/
│   │   ├── SymptomScreen.jsx     # Groupement en 2 paires avec code couleur
│   │   ├── DiagnosisScreen.jsx   # Hints : token hint-info (💡), footer restart conditionnel
│   │   ├── ResultScreen.jsx      # 3 PillBadge (Sévérité · Palier · Propriétaire)
│   │   ├── ExitObserveScreen.jsx # Palier 0 — 5 questions rétro, pas de plan
│   │   └── PlanScreen.jsx
│   └── tests/
│       ├── App.test.jsx     # Integration tests (component flows)
│       ├── data.test.js     # Data structure validation
│       ├── helpers.test.js  # Utility function tests + token color tests
│       └── setup.js         # Vitest global setup
├── docs/
│   ├── ARCHITECTURE.md  # Technical structure (multi-file)
│   └── PRD.md           # Product requirements and diagnostic logic
├── README.md
├── CHANGELOG.md
├── index.html
├── vite.config.js
└── CLAUDE.md
```

*Updated: 2026-06-02*
