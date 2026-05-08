# agile-team-diag

Outil interactif de diagnostic de dysfonctionnements de flux pour Scrum Masters, Agile Coaches et Managers. Identifie la cause racine via un arbre de décision guidé et génère un plan d'action structuré avec expérimentations 48h.

**Marque :** Collaboration Solved  
**Auteur :** Pierre-Cyril Denant  
**Version :** 2.5.7  
**Statut :** MVP — 21 causes couvertes, tous les plans d'action implémentés

---

## Stack

- React 18 + Vite (SPA, client-side uniquement — aucun backend)
- Inline styles via tokens `C`, `FONT`, `MONO`
- Tests : Vitest + React Testing Library
- Déploiement : build statique (`dist/`)

## Installation

```bash
npm install
npm run dev       # Serveur de développement (http://localhost:5173)
npm run build     # Build de production → dist/
npm run preview   # Prévisualisation du build
npm run test      # Suite de tests
npm run coverage  # Couverture de code
```

## Parcours utilisateur

4 étapes : **Symptôme → Diagnostic → Résultat → Plan d'action**

1. Saisie optionnelle du nom d'équipe, sélection du symptôme observé
2. Questions d'observation guidées par l'arbre de décision
3. Cause racine identifiée — badges Sévérité / Palier / Propriétaire / Focus arbre
4. Plan d'action structuré : coût du problème, métriques, expérimentations 48h, pitch business

## Arbres diagnostiques

| Arbre | Symptômes |
|-------|-----------|
| Predictability | Sprint commitment non tenu · Dates de livraison imprévisibles |
| Time to Market | Beaucoup de travail en file · Travail démarre mais ne sort pas |

21 causes racine couvrent les dysfonctionnements de flux : blocages externes/internes, dépendances, WIP, capacité, DoR, tech, scope creep, qualité, priorisation.

## Structure

```
src/
├── App.jsx              # Composants UI, navigation, runtime validation
├── main.jsx             # Entrée React
├── constants.js         # STEPS, TREE_IDS
├── index.css            # Reset minimal
├── data/
│   ├── causes.js        # 21 causes racine + exit_observe
│   ├── actionPlans.js   # Plans d'action (21/21 implémentés)
│   ├── symptoms.js      # 4 symptômes
│   └── trees.js         # SHARED_NODES, PREDICTABILITY_NODES, TTM_NODES, TREES
├── components/
│   ├── PlanHeader.jsx
│   ├── PlanMetrics.jsx
│   ├── PlanBusinessPitch.jsx
│   └── PlanExperiments.jsx
└── tests/
    ├── App.test.jsx
    ├── data.test.js
    ├── helpers.test.js
    └── setup.js
docs/
├── ARCHITECTURE.md      # Structure technique détaillée
└── PRD.md               # Product requirements
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure technique, schémas de données, décisions d'architecture
- [`docs/PRD.md`](docs/PRD.md) — product requirements, logique diagnostique, roadmap
- [`CHANGELOG.md`](CHANGELOG.md) — historique des versions
- [`CLAUDE.md`](CLAUDE.md) — instructions pour Claude Code
