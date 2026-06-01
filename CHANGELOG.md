# Changelog — agile-team-diag

Format : [Conventional Commits](https://www.conventionalcommits.org/). Versions calées sur `package.json`.

---

## [2.7.1] — 2026-06-01 — UX rev. 9 — gaps post-audit (PR #26)

### Fix
- Badge palier dans `ResultScreen` : affiche désormais le format court spec "Palier N — [shortLabel]" (ex. "Palier 1 — Collecter") et non le label long "Palier 1 — Données à collecter"
- `palierMeta()` enrichi du champ `pillLabel` — additionnel, aucune régression sur `label` et `color`

### Feat
- `PlanExperiments` : rendu conditionnel d'un encart `context-warm` (ambre léger) si `exp.context` est fourni — infrastructure prête pour l'authoring éditorial du champ "Pourquoi maintenant"

### Test
- Test de non-régression sur `pillLabel` dans `helpers.test.js`
- 3 tests unitaires directs sur `PlanExperiments` avec données mock (présence / absence de `exp.context`)
- Test badge ResultScreen assertant le format court ET l'absence du label long

---

## [2.7.0] — 2026-06-01 — UX specs rev. 9 — 7 décisions (PR #25)

### Feat
- **SymptomScreen** : ligne d'ancrage statique ("En 5 questions, tu identifies…") sous le titre
- **SymptomScreen** : groupement des 4 symptômes en 2 paires avec code couleur (bleu Engagements / ambre Flux), headers de groupe + hints de différenciation, hover couleur groupe via CSS classes
- **ContextStrip** : dot coloré (● bleu ou ambre) propagé depuis `symptom.tree` pour maintenir le contexte visuel en diagnostic
- **DiagnosisScreen** : indicateur de durée statique ("3 à 6 questions — environ 3 minutes") affiché sur la Q1 uniquement
- **DiagnosisScreen** : lien "Recommencer le diagnostic" (rouge, `#C94040`) dans le footer, visible à partir de la Q2 (`path.length >= 1`) — remplace le "↻ Recommencer" toujours visible en haut
- **ResultScreen** : 3 `PillBadge` (Sévérité · Palier · Propriétaire) — badge "Focus arbre" supprimé de l'affichage (`treeFocus` conservé dans le state pour `focusVariant`)
- **ExitObserveScreen** : nouvel écran dédié pour `exit_observe` (palier 0) — titre, 2 pill badges, 5 questions de rétro numérotées, encart hint-info, footer distinct — PlanScreen inaccessible depuis cette sortie

### Style system
- Remplacement du token jaune générique (`hintBg/hintBorder/hintText`) par 3 tokens sémantiques :
  - `hint-info` (bleu `#EBF3FF`) : hints diagnostiques — icône 💡
  - `cost-alert` (ambre foncé `#FFF0CC`) : encart coût PlanMetrics — icône ⚠, border 1.5px
  - `context-warm` (ambre léger `#FFF8EC`) : contexte actionnable dans les expérimentations
- Nouveau composant `PillBadge` dans `src/utils/ui.jsx` (DM Mono, uppercase, borderRadius 20, fond coloré)
- Nouvelle fonction `severityPillMeta()` avec palette sémantique par sévérité

### Test
- 16 tests de non-régression ajoutés (tokens couleur, ancrage, groupement, durée, restart conditionnel, ExitObserveScreen, badges pill)
- Tests existants mis à jour pour refléter les nouvelles interactions (restart depuis Q2, format badges)

---

## [2.6.1] — 2026-06-01 — Qualité de code P2 (PRs #21, #22, #23)

### Fix
- Clés React stables dans les listes : `key={a.next}` (DiagnosisScreen), `key={exp.label}` (PlanExperiments), `key={ind.metric}` (PlanMetrics) — remplace `key={i}`
- PropTypes sur les 4 composants `Plan*` (`PlanHeader`, `PlanMetrics`, `PlanBusinessPitch`, `PlanExperiments`)

### Refactor
- `SEVERITY` et `TIMING` exportés depuis `constants.js` — remplace 65 string literals dans `causes.js`, `actionPlans.js` et `utils/ui.jsx`
- Handlers `onMouseEnter/Leave/Down/Up` remplacés par classes CSS `.btn-choice` et `.btn-primary` dans `index.css` — WCAG 2.1 AA, plus de manipulation DOM directe

### Chore
- Installation de `prop-types ^15.8.1` (retiré de React 18 core)

---

## [2.6.0] — 2026-06-01 — Refactoring architecture P1 (PRs #18, #19, #20)

### Refactor
- `validateTrees()` déplacée dans un `useEffect` au premier rendu — affiche un écran d'erreur visible si des données sont corrompues, remplace le `console.error` silencieux
- Création de `src/theme.js` (tokens design : `C`, `FONT`, `MONO`, `btnReset`, `linkBtn`, `primaryBtn`) et `src/utils/ui.jsx` (composants `Badge`, `SectionTitle` + helpers `severityLabel`, `severityColor`, `palierMeta`) — supprime les imports circulaires des 4 composants `Plan*` vers `App.jsx`
- Extraction de 7 composants/screens inline d'`App.jsx` vers des fichiers dédiés : `Header`, `ContextStrip`, `PathTrail` dans `src/components/` ; `SymptomScreen`, `DiagnosisScreen`, `ResultScreen`, `PlanScreen` dans `src/screens/`
- `App.jsx` réduit de ~319 lignes à ~164 lignes (navigation + state uniquement)

---

## [2.5.9] — 2026-06-01 — Bug fix P0 : focusVariant absent sur c2 et c2q (PR #17)

### Fix
- Ajout du `focusVariant` manquant dans `ACTION_PLANS.c2.businessPitch` et `ACTION_PLANS.c2q.businessPitch` — la section "Statu quo / Résultat attendu" était silencieusement absente pour ces deux causes sur tous les parcours

---

## [2.5.8] — 2026-06-01 — Documentation et tests P3 (PR #16)

### Test
- Ajout d'un test de couverture cause → plan : vérifie que chaque cause (hors `exit_observe`) a un plan d'action correspondant dans `ACTION_PLANS`

### Docs
- `PRD.md` mis à jour : roadmap V2.5 marquée ✅, schéma `experiments[]` aligné sur l'implémentation réelle (remplace le schéma aspirationnel `actions[]` / `collect{}`)

---

## [2.5.7] — 2026-05-08 — Refactoring structure (PR #11)

### Refactor
- Extraction des données statiques de `App.jsx` vers `src/data/` : `causes.js`, `actionPlans.js`, `symptoms.js`, `trees.js`
- Découpage de `PlanScreen` en quatre sous-composants : `PlanHeader`, `PlanMetrics`, `PlanBusinessPitch`, `PlanExperiments`
- Extraction des constantes magiques `step`/`treeId` vers `src/constants.js` (`STEPS`, `TREE_IDS`)
- Extraction de `sectionHeaderStyle` et alignement des couleurs info sur la palette `C`

### Fix
- Guard sur `ResultScreen` et `PlanScreen` contre un `terminalId` inconnu

### Chore
- Ajout de `coverage/` au `.gitignore`

---

## [2.5.6] — 2026-05-08 — Plans cluster 7 + tests (PR #10)

### Feat
- Plans d'action pour les causes de priorisation : `c_urgency_misalign`, `c_strategy_vague`, `c_org`
- Tests de navigation pour 10 causes précédemment non couvertes
- Instrumentation Vitest Coverage (`@vitest/coverage-v8`)

---

## [2.5.5] — 2026-05-07 — Plans cluster 6 (PR #9)

### Feat
- Plans d'action : `c4_dep`, `c4q_dep`, `c_defects`

---

## [2.5.4] — 2026-05-07 — Plans cluster 5 (PR #8)

### Feat
- Plans d'action pour les causes de dépendance en exécution : `c3_ext`, `c3_int`, `c_anticipation`, `c_skill_unavailable`

---

## [2.5.3] — 2026-05-07 — CLAUDE.md (PR #7)

### Docs
- Renseignement complet de `CLAUDE.md` avec stack, règles d'architecture, contraintes et standards du projet

---

## [2.5.2] — 2026-05-07 — Plans cluster 3 + 4 (PR #5, PR #6)

### Feat
- Plans d'action : `c1_ext`, `c1_int`, `c_dor` (cluster 3)
- Plans d'action : `c2`, `c2q`, `c_cap` (cluster 4)

---

## [2.5.1] — 2026-05-07 — Plans cluster 1 + 2 (PR #3, PR #4)

### Feat
- Plans d'action : `c_oversize`, `c_scope_creep`, `c_wip`
- Suite de tests Vitest : 68 tests (data, helpers, intégration)

---

## [2.5.0] — 2026-05-07 — MVP initial (PR #1, PR #2)

### Feat
- Infrastructure `PlanScreen` + plans d'action initiaux : `c_tech`, `c_gate` (rev. 8)
- Init Vite + React 18 — App.jsx v2.5 rev. 7

### Architecture
- Arbre de décision Flow complet : 21 causes, 2 arbres (`predictability`, `time_to_market`), `SHARED_NODES`
- `validateTrees()` : validation runtime au chargement du module
- `treeFocus` dans le state applicatif
- Schéma Node uniforme `{label, next}[]` — suppression du champ `type`
- Parcours en 4 étapes : Symptôme → Diagnostic → Résultat → Plan d'action

### Contenu
- 4 symptômes Flow
- 21 causes racine : `c1_ext`, `c1_int`, `c2`, `c2q`, `c3_ext`, `c3_int`, `c4_dep`, `c4q_dep`, `c_org`, `c_wip`, `c_cap`, `c_dor`, `c_tech`, `c_gate`, `c_anticipation`, `c_oversize`, `c_scope_creep`, `c_skill_unavailable`, `c_urgency_misalign`, `c_strategy_vague`, `c_defects`
- `exit_observe` : sortie palier 0 (données insuffisantes pour conclure)
