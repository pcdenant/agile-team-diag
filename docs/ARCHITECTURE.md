# Architecture — Team Dysfunction Diagnostic

## Stack

- **Runtime** : React (artifact Claude / standalone SPA)
- **Styling** : Inline styles via shared `COLORS`, `TYPE`, `FONT` tokens
- **State** : `useState` — pas de store externe
- **Responsive** : breakpoint 768px
- **Validation** : `validateTrees()` au chargement du module (console, non-bloquant)

## Structure du fichier (1 fichier, 6 sections)

```
┌─ STYLE SYSTEM ─────────────── COLORS, FONT, TYPE
├─ DATA LAYER ───────────────── CAUSES, SYMPTOMS
│   ├─ SHARED_NODES             ← branche finish + branche interne-start
│   ├─ PREDICTABILITY_NODES
│   ├─ TTM_NODES
│   ├─ TREES                    ← registry des deux arbres
│   └─ validateTrees()          ← validation runtime au chargement
├─ LOOKUP ───────────────────── lookupNode(treeId, nodeId)
├─ HELPERS ──────────────────── severityLabel, severityColor, palierMeta
├─ STEP COMPONENTS ──────────── SymptomScreen, DiagnosisScreen, ResultScreen, PlanScreen
└─ MAIN APP ─────────────────── App (state + navigation)
```

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

Exécutée une fois au chargement du module, avant tout rendu React. Non bloquante.

Vérifie :
- Chaque `entry` des symptômes résout dans l'union de tous les IDs valides
- Chaque `next:` de chaque réponse de chaque nœud (SHARED + PREDICTABILITY + TTM) résout dans l'union de tous les IDs valides

Output :
```
[VALIDATION] ✓ N IDs valides · M nœuds vérifiés · 0 erreur
[VALIDATION] Nœud "xxx" → next "yyy" introuvable   ← si erreur
```

Toute modification des données (ajout de nœud, modification de `next:`) est immédiatement détectée au prochain chargement.

### treeFocus dans le state

```typescript
treeFocus: "predictability" | "time_to_market" | null
```

- Alimenté dans `pickSymptom(s)` → `setTreeFocus(s.tree)`
- Remis à null dans `restart()`. Si `path` est vide après un `backOne()`, l'app retourne à `SymptomScreen` et remet `treeFocus` à null — cette condition est vérifiée dans `App` après chaque pop, pas dans `backOne()` elle-même.
- Passé à `ResultScreen` et `PlanScreen` pour sourcer le badge "Focus arbre" et moduler les plans d'action
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
  hint?: string,     // indice contextuel — affiché sous la question, fond jaune
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

### Action Plan (schéma cible — à implémenter)

```typescript
{
  collect: {
    what: string,
    report: string,
    cost: string,
    check: string,
    protocol?: BlockageMVProtocol,
  },
  actions: ActionItem[],
  experiments: ExperimentItem[],
  indicators: IndicatorItem[],
  businessPitch: {
    statusQuoCost: string,
    expectedResult: string,
    leadershipQuestion: string,
    focusVariant?: {
      predictability: { statusQuoCost: string, expectedResult: string },
      time_to_market: { statusQuoCost: string, expectedResult: string },
    }
  }
}
```

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

*Note UX : avec 8+ symptômes visibles, l'écran Symptôme devra évoluer. L'évolution de l'UX est reportée — une liste plate est acceptée temporairement jusqu'à ce que le deuxième arbre soit prêt à implémenter.*

## Décisions d'architecture

| Décision | Raison |
|----------|--------|
| Fichier unique | Contrainte artifact Claude — migration vers multi-fichier triviale |
| Inline styles | Pas de build step / CSS modules en artifact |
| SHARED_NODES | Évite la duplication de la branche finish (identique dans les deux arbres). lookupNode() résout la priorité. |
| validateTrees() au module level | S'exécute avant tout rendu React, sans useEffect. Les données sont statiques — une seule passe au chargement suffit. |
| treeFocus dans le state (pas dérivé de symptom) | treeFocus est un champ de state explicite, persisté indépendamment de symptom, pour être passé aux composants DiagnosisScreen, ResultScreen et PlanScreen sans re-dériver. |
| Schéma Node uniforme {label, next}[] | Supprime la couche d'abstraction type/answers inutile — chaque réponse est une paire label+next, quel que soit le "type" de question. |
| Causes contextuelles (Option A) | Le label de la cause est lu directement par le SM sur l'écran résultat — il doit être précis sans que le SM relise le chemin. Un label générique sans contexte (dépendance ? interne ?) est inutilisable. |
| "Pourquoi pas encore résolu ?" comme question | Plus engageant qu'un menu de classification. Force le SM à articuler la raison réelle avant de voir la cause — produit une réponse plus honnête sur c_org vs c2q/c4q_dep. |
| `c_defects` comme cause palier 1 | Pas une sortie hors scope — c'est une cause réelle avec un plan de collecte immédiat. La qualité impacte le flux. Renommé depuis `exit_quality` (rev. 7) — le préfixe `exit_` était un vestige de l'époque où cette cause était hors scope. |
| Pas de profil utilisateur | Le rôle ne pilotait que la formulation des symptômes. Supprimé en rev. 7 — libellé unique par symptôme. |
| Pas de sélection de catégorie | La catégorie était une étape UI sans valeur diagnostique propre. Les symptômes routent directement vers l'arbre. Supprimé en rev. 7. |
| teamName dans le state (pas persisté) | Champ optionnel affiché dans le parcours. La persistence entre sessions est reportée à V4. |
