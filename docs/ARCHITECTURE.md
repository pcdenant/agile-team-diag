# Architecture — Team Dysfunction Diagnostic

## Stack

- **Runtime** : React 18 + Vite (SPA, client-side uniquement)
- **Styling** : Inline styles via shared `C`, `FONT`, `MONO`, `CARD` tokens (définis dans `src/theme.js`) + classes CSS bento-grid et interactives dans `index.css`
- **State** : `useState` — pas de store externe
- **Responsive** : mobile-first — breakpoints 640px (2 col) / 1024px (4 col bento)
- **Validation** : `validateTrees()` dans `useEffect` au premier rendu — affiche un écran d'erreur si erreur détectée
- **Tests** : Vitest + React Testing Library

## Structure des fichiers

```
src/
├── App.jsx              # Navigation state, rendu conditionnel, re-exports compat
├── main.jsx             # Entrée React
├── theme.js             # Tokens design : C, FONT, MONO, btnReset, linkBtn, primaryBtn
├── constants.js         # STEPS, TREE_IDS, SEVERITY, TIMING
├── index.css            # Reset + bento-grid (.bento-grid/.bento-card/.bento-span-*) + classes CSS interactives
├── utils/
│   └── ui.jsx           # Badge, PillBadge, SectionTitle, severityLabel, severityColor,
│                        #   palierMeta (label/shortLabel/pillLabel/color), severityPillMeta
├── data/
│   ├── causes.js        # CAUSES — 21 causes racine + exit_observe
│   ├── actionPlans.js   # ACTION_PLANS — plans d'action (21/21)
│   ├── symptoms.js      # SYMPTOMS — 4 symptômes
│   └── trees.js         # SHARED_NODES, PREDICTABILITY_NODES, TTM_NODES, TREES
├── components/
│   ├── Header.jsx            # En-tête statique de l'application
│   ├── ContextStrip.jsx      # Barre contexte (dot couleur groupe) — prop showButtons
│   ├── PathTrail.jsx         # Historique du parcours — props: collapsible, flat
│   ├── PlanHeader.jsx        # En-tête du plan — bento-card bento-span-full
│   ├── PlanMetrics.jsx       # Fragment → cost-alert + impact + inspection (3 bento items)
│   ├── PlanBusinessPitch.jsx # Fragment → section label + statusQuo + expected + leadership
│   └── PlanExperiments.jsx   # Fragment → section label + N experiment bento-cards
├── screens/
│   ├── SymptomScreen.jsx     # Étape 1 : sélection du symptôme (groupement 2 paires)
│   ├── DiagnosisScreen.jsx   # Étape 2 : arbre de diagnostic (hints hint-info, footer restart)
│   ├── ResultScreen.jsx      # Étape 3 : cause identifiée (3 PillBadge)
│   ├── ExitObserveScreen.jsx # Sortie palier 0 : 5 questions rétro, pas de plan
│   └── PlanScreen.jsx        # Étape 4 : plan d'action
└── tests/
    ├── App.test.jsx          # Tests d'intégration (navigation complète)
    ├── data.test.js          # Validation des structures de données
    ├── helpers.test.js       # Tests des fonctions utilitaires
    └── setup.js              # Configuration Vitest globale
```

### Responsabilités de `App.jsx`

`App.jsx` est réduit à ~164 lignes — navigation et state uniquement.

```
┌─ RUNTIME VALIDATION ───── validateTrees() dans useEffect + état dataError
├─ LOOKUP ────────────────── lookupNode(treeId, nodeId)
├─ STATE + NAVIGATION ────── 6 useState, handlers (pickSymptom, answer, backOne, restart)
├─ RENDU CONDITIONNEL ────── import + affichage des 4 screens selon step
└─ RE-EXPORTS COMPAT ─────── CAUSES, TREES, severityLabel, C, etc. (pour les tests)
```

Les tokens de style sont définis dans `src/theme.js` et `src/utils/ui.jsx`. `App.jsx` les ré-exporte pour la compatibilité des tests existants (`helpers.test.js` importe depuis `App.jsx`).

## Concepts clés

### SHARED_NODES

Nœuds de l'arbre réutilisés par les deux arbres (Predictability et Time to Market), sans duplication. Accessibles via `lookupNode()` qui cherche dans SHARED_NODES avant les arbres spécifiques.

Nœuds partagés actuels :

| ID | Rôle |
|----|------|
| `finish_state` | Entrée branche finish — bloqué vs qui traîne |
| `finish_blocked_nature` | Ext ou int ? |
| `finish_ext_type` | Dépendance / expert / inconnu |
| `finish_dep_anticipable` | A-t-elle été anticipée ? |
| `finish_dep_quantify` | Impact chiffré ? |
| `finish_dep_decision` | Pourquoi pas encore résolu ? (→ c4q_dep ou c_org) |
| `p_internal_nature_finish` | Nature blocage interne en exécution |
| `finish_drags` | Item qui traîne — trop gros / scope creep / multitâche |
| `carryover_nature` | Surengagement vs blocage réel (Predictability uniquement) |

`p_internal_nature_start` appartient à `PREDICTABILITY_NODES` — il n'est pas partagé avec TTM. Son placement antérieur dans SHARED_NODES était une erreur.

### lookupNode(treeId, nodeId)

Résolution d'un nœud par ID dans l'ordre :
1. `CAUSES` — cause terminale (retourne null, l'app passe en mode résultat)
2. `SHARED_NODES` — nœud partagé
3. `TREES[treeId].nodes` — nœud de l'arbre courant

Si l'ID n'est résolu par aucune des trois étapes, `lookupNode()` retourne null et loggue une erreur. `validateTrees()` doit avoir attrapé ce cas au chargement. Aucun fallback cross-tree : un ID introuvable est une erreur d'authoring, pas un cas à corriger silencieusement.

### validateTrees()

Exécutée dans un `useEffect` au premier rendu de `App`. Retourne un tableau d'erreurs (`string[]`).

- Si vide → log console `[VALIDATION] ✓ N IDs valides · M nœuds vérifiés · 0 erreur`
- Si non-vide → `dataError` state non-null → l'app affiche un écran d'erreur dédié à la place du contenu normal

Vérifie :
- Chaque `entry` des symptômes résout dans l'union de tous les IDs valides
- Chaque `next:` de chaque réponse de chaque nœud (SHARED + PREDICTABILITY + TTM) résout dans l'union de tous les IDs valides

Toute modification des données (ajout de nœud, modification de `next:`) est détectée au prochain rendu.

### treeFocus dans le state

```typescript
treeFocus: "predictability" | "time_to_market" | null
```

- Alimenté dans `pickSymptom(s)` → `setTreeFocus(s.tree)`
- Remis à null dans `restart()`. Si `path` est vide après un `backOne()`, l'app retourne à `SymptomScreen` et remet `treeFocus` à null — cette condition est vérifiée dans `App` après chaque pop, pas dans `backOne()` elle-même.
- Passé à `ResultScreen` et `PlanScreen` pour moduler les plans d'action (`focusVariant`) — le badge "Focus arbre" a été supprimé de l'affichage utilisateur (UX rev. 9, décision #6) mais `treeFocus` reste dans le state
- Prérequis pour la modulation des plans d'action sur les causes partagées entre les deux arbres (ex. `c_urgency_misalign` accessible depuis les deux — le libellé du plan d'action différera selon le focus)

### teamName dans le state

```typescript
teamName: string | null
```

- Saisi sur `SymptomScreen` (champ optionnel)
- Affiché dans l'en-tête de toutes les étapes suivantes si renseigné
- Remis à null dans `restart()`
- Non persisté entre sessions (persistence reportée à V4)

## Schéma de données

### Symptom

```typescript
{
  id: string,
  label: string,   // libellé unique — pas de variante par profil
  tree: "predictability" | "time_to_market",
  entry: string,   // ID du premier nœud de l'arbre
}
```

### Tree Node

```typescript
{
  question: string,
  hint?: string,     // indice contextuel — affiché sous la question, token hint-info (bleu, icône 💡)
  answers: {
    label: string,   // libellé affiché à l'utilisateur
    next: string,    // ID du nœud suivant OU ID d'une cause terminale
  }[]
}
```

Le champ `type` (binary/gradient/choice) a été supprimé — toutes les réponses sont uniformément `{label, next}[]`.

### Cause

```typescript
{
  label: string,
  description: string,
  severity: "high" | "medium" | "low",
  owner: string,      // propriétaire de la décision (affiché en badge, texte libre)
  palier: 0 | 1 | 2 | 3,
}
```

Champs supprimés vs V1 : `id` (redondant avec la clé de l'objet), `flagDependencies` (remplacé par la cause contextuelle `c_org`).

`palier: 0` est réservé à `exit_observe` — sortie non-diagnostique déclenchée quand les données sont insuffisantes pour conclure. Elle ne produit pas de plan d'action mais une consigne d'observation. Elle figure dans `CAUSES` pour que `lookupNode()` la traite comme une cause terminale et que `validateTrees()` la valide.

### State applicatif

```typescript
{
  step: "symptom" | "diagnosis" | "result" | "plan",
  teamName: string | null,
  symptom: Symptom | null,
  path: DiagnosisAnswer[],
  terminalId: string | null,
  treeFocus: "predictability" | "time_to_market" | null,
}
```

### DiagnosisAnswer (entrée du path)

```typescript
{
  nodeId: string,     // ID du nœud où la réponse a été donnée
  question: string,   // texte de la question (pour affichage dans PathTrail)
  answer: string,     // libellé de la réponse choisie
  next: string,       // ID du nœud ou cause suivant
}
```

### Action Plan

```typescript
{
  cost: string,           // coût du problème non résolu (quadrant Impact)
  costHint?: string,      // précision contextuelle sur le coût
  indicators: {
    metric: string,
    target: string,
    frequency: string,
  }[],
  ownerNote: string,      // note sur le propriétaire de la décision
  businessPitch: {
    statusQuoCost: string,
    expectedResult: string,
    leadershipQuestion: string,
    focusVariant?: {
      predictability: { statusQuoCost: string, expectedResult: string },
      time_to_market: { statusQuoCost: string, expectedResult: string },
    }
  },
  experiments: {
    label: string,        // titre de l'étape
    timing: string,       // TIMING.THIS_WEEK | THIS_SPRINT | NEXT_SPRINT
    description: string,  // action concrète à mener
    criterion: string,    // critère de succès observable
    gate: boolean,        // si true : l'étape suivante attend que celle-ci soit conclue
    context?: string,     // (optionnel) "Pourquoi maintenant" — affiché en encart context-warm
  }[]
}
```

21 plans d'action implémentés — un par cause racine.

## Étendre les données

### Ajouter une cause

1. Ajouter l'objet dans `CAUSES`
2. Ajouter un `next: "nouvelle_cause"` dans le nœud de l'arbre approprié
3. `validateTrees()` confirmera au chargement que le lien est valide
4. Ajouter le plan d'action correspondant dans `ACTION_PLANS` (à venir)

### Ajouter un nœud partagé

1. Ajouter le nœud dans `SHARED_NODES`
2. Référencer son ID dans un `next:` d'un nœud existant
3. `validateTrees()` confirmera la résolution

### Ajouter un arbre de symptômes (ex : Qualité)

Il n'existe pas de sélection de catégorie dans le parcours utilisateur. Les nouveaux symptômes sont ajoutés directement dans `SYMPTOMS` et routés automatiquement vers leur arbre. L'utilisateur voit tous les symptômes disponibles sur l'écran Symptôme, sans étape de catégorie intermédiaire.

Procédure :

1. Créer `QUALITY_SYMPTOMS`, `QUALITY_NODES`, `QUALITY_ACTION_PLANS`
2. Ajouter une entrée dans `TREES` : `quality: { label: "Qualité", nodes: QUALITY_NODES }`
3. Ajouter les symptômes dans `SYMPTOMS` avec `tree: "quality"`
4. `validateTrees()` couvrira automatiquement les nouveaux nœuds

*Note UX : les symptômes sont désormais groupés en 2 paires par arbre (bleu Engagements / ambre Flux). L'ajout d'un troisième arbre nécessitera un nouveau groupe et potentiellement une évolution du layout si les groupes dépassent 2.*

## Décisions d'architecture

| Décision | Raison |
|----------|--------|
| Données dans `src/data/` | Séparation authoring/UI sans ajouter de couche d'abstraction. Chaque fichier a une seule responsabilité. |
| `PlanScreen` découpé en 4 composants | Chaque quadrant du plan est indépendant. Les extraire réduit la taille de App.jsx et facilite les tests ciblés. |
| Tokens dans `src/theme.js` + helpers dans `src/utils/ui.jsx` | Supprime les imports circulaires (enfants qui importaient depuis le parent `App.jsx`). App.jsx garde des re-exports pour la compatibilité des tests. |
| `src/constants.js` pour STEPS/TREE_IDS/SEVERITY/TIMING | Élimine les magic strings dispersés. Un seul point de vérité pour les enums navigation, sévérité et timing. |
| Inline styles + classes CSS interactives | Tokens centralisés en JS pour les styles statiques ; `:hover`/`:active`/`:focus-visible` en CSS — pas de manipulation DOM directe dans les handlers React. |
| SHARED_NODES | Évite la duplication de la branche finish (identique dans les deux arbres). `lookupNode()` résout la priorité. |
| `validateTrees()` dans useEffect | S'exécute au premier rendu. En cas d'erreur, affiche un écran dédié au lieu de crasher silencieusement. Retourne `string[]` pour permettre l'affichage. |
| `treeFocus` dans le state (pas dérivé de symptom) | Champ explicite persisté indépendamment de `symptom`, passé aux composants sans re-dériver à chaque render. |
| Schéma Node uniforme `{label, next}[]` | Supprime la couche d'abstraction `type/answers` inutile — chaque réponse est une paire label+next. |
| Causes contextuelles (Option A) | Le label doit être précis sans que le SM relise le chemin. Un label générique est inutilisable sur l'écran résultat. |
| "Pourquoi pas encore résolu ?" comme question | Force le SM à articuler la raison réelle avant de voir la cause — produit une réponse plus honnête sur c_org vs c2q/c4q_dep. |
| `c_defects` comme cause palier 1 | Pas une sortie hors scope — cause réelle avec plan de collecte immédiat. Renommé depuis `exit_quality` (rev. 7). |
| Pas de profil utilisateur | Le rôle ne pilotait que la formulation des symptômes — supprimé en rev. 7, libellé unique par symptôme. |
| Pas de sélection de catégorie | Étape UI sans valeur diagnostique propre. Les symptômes routent directement vers leur arbre. |
| `teamName` dans le state (pas persisté) | Champ optionnel affiché dans le parcours. La persistence entre sessions est reportée à V4. |

| `ExitObserveScreen` séparé de `ResultScreen` | Les layouts, contenus et footers sont fondamentalement différents. Un seul composant avec des conditions `if terminalId === exit_observe` aurait été difficile à maintenir. Le routing conditionnel dans `App.jsx` garde la séparation propre. |
| `showButtons` sur `ContextStrip` | Permet à `DiagnosisScreen` de gérer sa propre navigation dans un footer dédié (back + restart conditionnel) sans dupliquer les boutons. `ResultScreen` et `PlanScreen` gardent le comportement par défaut (`showButtons=true`). |
| `pillLabel` dans `palierMeta()` | Champ additionnel ("Palier N — [court]") qui coexiste avec `label` long — évite de reconstruire la string dans les composants et préserve la compatibilité des tests existants sur `label`. |
| Bento grid — CSS classes + inline styles | `.bento-grid`, `.bento-card`, `.bento-span-*` définis dans `index.css` (pas de framework). Les propriétés variant par composant (border-left sévérité, bg couleur alertes) restent en inline styles — override naturel sur les classes. Aucune dépendance ajoutée. |
| Breakpoints 640/1024px | Mobile < 640px : 1 col. Tablet 640–1023px : 2 col. Desktop ≥ 1024px : 4 col. Choix Apple-style — la densité n'augmente qu'à partir de résolutions réellement confortables. |
| React Fragments pour Plan sub-composants | `PlanMetrics`, `PlanBusinessPitch`, `PlanExperiments` retournent des Fragments dont les enfants participent directement dans la `.bento-grid` parente. Évite d'imbriquer des grids ou d'éclater la logique de chaque section dans `PlanScreen`. Prop API inchangée. |
| `flat` sur `PathTrail` | Quand `PathTrail` est imbriqué dans une bento-card parente (ResultScreen), `flat=true` supprime son propre border/bg — évite le double-card. `collapsible=true` (DiagnosisScreen) l'affiche dans un `<details>` fermé par défaut — PathTrail accessible sans occuper l'espace visuel primaire. |

*Updated: 2026-06-02*
