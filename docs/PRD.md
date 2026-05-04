# PRD — Team Dysfunction Diagnostic Tool v2.5

**Marque** : Collaboration Solved  
**Auteur** : Pierre-Cyril Denant  
**Plateforme actuelle** : Artifact React (Claude)  
**Cible future** : Web app standalone  
**Version** : 2.5  
**Basé sur** : V1.0-refactored (2025-02-25)  
**Statut** : Arbre Flow validé — Plans d'action à implémenter

---

## Résumé

Outil web de diagnostic d'équipe pour Scrum Masters, Agile Coaches et Managers. Identifie la cause racine d'un dysfonctionnement de flux via un arbre de décision guidé, génère un plan d'action structuré avec expérimentations 48h et protocole de collecte de données outil-agnostique.

**Différenciateur V2.5** : les arbres de décision couvrent les trois niveaux de maturité diagnostique — construire le cas, quantifier le cas, utiliser le cas pour forcer une décision. Le protocole de collecte est autonome, sans outil spécialisé requis. Le diagnostic distingue systématiquement blocages externes, blocages internes, et patterns de non-finition.

---

## Problème résolu

Les outils existants (Agile Signals, etc.) prescrivent des solutions génériques sans diagnostic de cause racine. Ce tool suit la logique : **Symptôme → Causes possibles → Cause confirmée → Action**, en forçant la compréhension avant la prescription.

**Problème additionnel résolu en V2.5** : les arbres originaux prescrivaient "Consider Blocked" — une référence à un outil spécialisé (ActionableAgile / Nave) inaccessible à la majorité des utilisateurs cibles. V2.5 substitue un protocole de collecte concret, universel, utilisable immédiatement.

---

## Hypothèses de conception (scope explicite)

Ces hypothèses délimitent ce que les arbres diagnostiquent. Les éléments hors scope ne sont pas des lacunes — ce sont des choix documentés.

**Dans le scope :** dysfonctionnements de flux — blocages externes et internes, dépendances, WIP, capacité, priorisation, items non prêts, time to market. Les défauts qualité sont dans le scope diagnostique : `exit_quality` produit un plan de collecte immédiat et signale que la qualité interne freine le flux — la résolution complète appartient au diagnostic Qualité à venir.

**Hors scope (hypothèses explicites) :**
- Dynamique d'équipe et conflits interpersonnels
- Surcharge de cérémonies Scrum consommant la capacité réelle
- Ambiguïté de la Definition of Done

---

## Parcours utilisateur (4 étapes)

### Étape 1 — Symptôme
- Champ optionnel : nom de l'équipe (affiché dans tout le parcours)
- 4 symptômes Flow, libellé unique et universel
- Sélection unique, routing direct vers l'entrée de l'arbre correspondant
- *Sauvegarde de la progression : à implémenter dans une version ultérieure*

### Étape 2 — Diagnostic
- Questions d'observation du board en entrée (pas d'interprétation immédiate)
- Structure : externe vs interne → nature du blocage → maturité des données → décision
- Indice contextuel (hint) affiché sur les questions ambiguës
- Protection double-clic (transition 150ms)
- Contexte permanent : symptôme sélectionné
- `treeFocus` mémorisé dans le state depuis la sélection du symptôme
- *Sauvegarde de la progression : à implémenter dans une version ultérieure*

### Étape 3 — Résultat
- Cause racine identifiée avec label contextuel précis
- Badges : Sévérité / Palier de maturité / Propriétaire / Focus arbre
- Chemin de diagnostic complet (trail d'élimination)

### Étape 4 — Plan d'action (layout quadrants) — *à implémenter*

**Haut gauche — Impact — Objectif**
- Coût du problème non résolu (encart jaune)
- Indicateurs à suivre avec targets (texte gauche, target droite)

**Haut droite — Inspecter — Mesurer**
- Protocole Blocage MV intégré
- Quoi collecter : format de capture en 6 champs
- Comment collecter : rituel de collecte en temps réel
- Quoi valider : critère de fiabilité des données
- Tableau Top 5 : Blockers actifs + Dependencies anticipées + Signal contrainte
- Quoi faire ensuite → pointe vers section Adapter

**Bas pleine largeur — Adapter — Expérimenter**
- Actions triées par impact (haut → faible), sélectionnables par tabs
- Panneau gauche : action + pourquoi/pourquoi maintenant (encart jaune)
- Panneau droite : expérimentation 48h liée

**Section Parler business** (entre quadrants haut et section Adapter)
- Coût du statu quo / Résultat mesurable attendu / Question prête à l'emploi pour le management
- Modulée selon le propriétaire de la décision (SM vs Leadership)

---

## Logique diagnostique V2.5

### Structure des arbres

Deux arbres complémentaires, sélectionnés par le symptôme :

**Predictability Focus** — symptômes : "sprint commitment non tenu" / "dates imprévisibles"  
Entrée : observation du board sprint → travail planifié bloqué ou autre travail s'invite ?

**Time to Market Focus** — symptômes : "travail attend en file" / "travail démarre mais ne sort pas"  
Entrée directe : branche waiting (s3) ou branche doing (s4), sans question intermédiaire

### Questions structurantes de l'arbre

Chaque arbre suit une progression en couches :

1. **Observation du board** — ce qui s'est passé concrètement, pas d'interprétation
2. **Externe ou interne** — la source du blocage est-elle hors du périmètre de l'équipe ?
3. **Nature du blocage** — si interne : tech / gate / DoR / défauts / inconnu
4. **Anticipation** — si dépendance externe identifiée : était-elle anticipable ?
5. **Maturité des données** — la source est-elle tracée ? l'impact est-il chiffré ?
6. **Décision** — "Pourquoi pas encore résolu ?" → périmètre équipe ou strate au-dessus

### Branche carryover (Predictability)

Nœud discriminant `carryover_nature` avant la branche finish :
- **Surengagement** → `p_capacity_split` → c_wip ou c_cap directement
- **Blocage réel** → `finish_state` → diagnostic complet du blocage

### Branche finish (SHARED_NODES)

Partagée entre les deux arbres. Entrée : `finish_state`.

- **Bloqué** (hard stop) → externe ou interne ?
  - Externe : dépendance / expert-skill / inconnu → anticipation → quantification → décision
  - Interne : tech / gate / défauts (→ c_defects) / inconnu
- **Qui traîne** (pas de bloqueur dur) → item trop gros / scope creep / multitâche

### Paliers de maturité

| Palier | État | Question clé | Cause terminale type |
|--------|------|-------------|---------------------|
| 1 | Source non identifiée ou non tracée | "Qu'est-ce qui se passe exactement ?" | c1_ext, c1_int, c3_ext, c3_int |
| 2 | Source identifiée, impact non chiffré | "Combien ça coûte ?" | c2, c4_dep |
| 3 | Source identifiée ET impact chiffré | "Pourquoi pas encore résolu ?" | c_org |

### Question "Pourquoi pas encore résolu ?"

Formulée explicitement à chaque nœud de décision finale (palier 2 → 3). Distingue :
- L'équipe ou le SM peut agir → cause quantifiée, décision interne (c2q, c4q_dep)
- La décision appartient à une strate au-dessus et n'est pas prise → c_org

---

## Données — Catégorie Flow & Livraison (V2.5)

### Symptômes (4)

| ID | Libellé | Arbre | Entrée |
|----|---------|-------|--------|
| s1 | Le sprint commitment n'est pas tenu | predictability | p_observe |
| s2 | Les dates de livraison sont imprévisibles | predictability | p_observe |
| s3 | Beaucoup de travail attend en file (rien ne démarre) | time_to_market | ttm_urgent_slow |
| s4 | Beaucoup de travail démarre mais ne sort pas | time_to_market | finish_state |

### Causes racine (21)

| ID | Cause | Sévérité | Propriétaire | Palier |
|----|-------|----------|--------------|--------|
| c1_ext | Blocage démarrage — dépendance externe inconnue | high | SM | 1 |
| c1_int | Blocage démarrage — cause interne inconnue | high | SM | 1 |
| c2 | Dépendance externe au démarrage — identifiée mais non quantifiée | high | SM | 2 |
| c2q | Dépendance externe au démarrage — quantifiée, décision dans le périmètre | medium | SM | 2 |
| c3_ext | Blocage en exécution — dépendance externe inconnue | high | SM | 1 |
| c3_int | Blocage en exécution — cause interne inconnue | high | SM | 1 |
| c4_dep | Dépendance externe découverte en exécution — non quantifiée | high | SM | 2 |
| c4q_dep | Dépendance externe découverte en exécution — quantifiée, décision dans le périmètre | medium | SM | 2 |
| c_org | Blocage organisationnel — données complètes, décision manquante | high | Leadership | 3 |
| c_wip | WIP excessif — capacité fragmentée par multitâche | high | Équipe + SM | 1 |
| c_cap | Capacité réelle insuffisante | high | Leadership | 1 |
| c_dor | Items non prêts au démarrage — DoR failure | medium | PO + SM | 1 |
| c_tech | Blocage technique — système, environnement ou outil indisponible | high | Équipe + Ops/Infra | 1 |
| c_gate | Process interne créant un goulot | medium | SM + Process owner | 1 |
| c_anticipation | Dépendance prévisible mal anticipée | medium | SM + PO | 1 |
| c_oversize | Item trop gros — ne peut pas finir dans le cycle | high | Équipe + PO | 1 |
| c_scope_creep | Scope creep en cours d'exécution | medium | PO + SM | 1 |
| c_skill_unavailable | Expert ou skill indisponible — goulot de dépendance interne | high | SM | 1 |
| c_urgency_misalign | Désaccord sur l'urgence — stratégie claire, arbitrages locaux divergents | medium | PO + Leadership | 1 |
| c_strategy_vague | Stratégie trop vague — pas d'arbitrage local possible | high | Leadership | 1 |
| c_defects | Défauts récurrents — la qualité interne freine le flux | high | Équipe + Tech lead | 1 |

*Note : `c_defects` est une cause terminale dans le scope diagnostique Flow. Elle produit un plan de collecte minimal immédiat et signale que la résolution complète relève du diagnostic Qualité (à venir).*

*Note : les causes c5, c5q, c6, c6u, c1, c3, c4, c4q présentes dans le PRD original ont été scindées ou remplacées par les variantes contextuelles ci-dessus. `none` est supprimé — l'arbre atteint toujours une cause ou `exit_observe`. `exit_quality` a été renommé `c_defects` en rev. 7.*

### Plans d'action (à implémenter — priorité prochaine itération)

Volume estimé par cause :

| Cause | Actions | Expérimentations | Indicateurs |
|-------|---------|-----------------|-------------|
| Chaque cause palier 1 (×17) | 2–3 | 2–3 | 2–3 |
| Chaque cause palier 2 (×4) | 2 | 2 | 3 |
| c_org (palier 3) | 3 | 3 | 4 |
| c_defects | 1 (collecte) | 1 | 2 |

---

## Schéma de données V2.5

### Symptom

```typescript
{
  id: string,
  label: string,
  tree: "predictability" | "time_to_market",
  entry: string,           // ID du nœud d'entrée dans l'arbre
}
```

### Tree Node

```typescript
{
  question: string,
  hint?: string,           // indice contextuel affiché sous la question
  answers: {
    label: string,         // libellé de la réponse (affiché à l'utilisateur)
    next: string,          // ID du nœud suivant ou de la cause terminale
  }[]
}
```

### Cause

```typescript
{
  label: string,
  description: string,
  severity: "high" | "medium" | "low",
  owner: string,           // propriétaire de la décision (affiché en badge)
  palier: 0 | 1 | 2 | 3,  // niveau de maturité diagnostique
}
```

### State applicatif

```typescript
{
  step: "symptom" | "diagnosis" | "result" | "plan",
  teamName: string | null,
  symptom: Symptom | null,
  path: DiagnosisAnswer[],       // historique des questions/réponses
  terminalId: string | null,     // ID de la cause terminale atteinte
  treeFocus: "predictability" | "time_to_market" | null,
}

type DiagnosisAnswer = {
  nodeId: string,
  question: string,
  answer: string,
  next: string,
}
```

*Note : la sauvegarde de la progression (reprise de parcours entre sessions) est une fonctionnalité identifiée, non implémentée. Elle est reportée à une version ultérieure.*

### Action Plan (schéma cible — à implémenter)

```typescript
{
  collect: {
    what: string,          // quoi collecter
    report: string,        // rapport visé
    cost: string,          // coût du problème (quadrant Impact)
    check: string,         // critère de fiabilité
    protocol?: {           // Protocole Blocage MV (causes de dépendance)
      fields: string[],
      ritual: string,
      clusterTable: boolean,
      constraintRule: string,
    }
  },
  actions: {
    what: string,
    why: string,
    whyNow: string,
    impact: "high" | "medium" | "low",
  }[],
  experiments: {
    label: string,
    actionIndex: number,
    do: string,
    observe: string,
    confirm: string,
  }[],
  indicators: {
    metric: string,
    target: string,
    why: string,
  }[],
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

---

## Spécifications techniques

### Layout
- Desktop-first : 960px max-width
- Responsive : breakpoint 768px (grilles stack en 1 col)
- Print CSS basique

### Architecture
- Fichier unique JSX (contrainte artifact)
- SHARED_NODES : nœuds partagés entre les deux arbres (branche finish, branche interne)
- `validateTrees()` : validation runtime au chargement du module, non bloquante
- Shared style system (COLORS, TYPE, FONT)

### Navigation
- 4 étapes : symptôme → diagnostic → résultat → plan d'action
- Retour arrière question par question (undo) dans le diagnostic
- Bouton "Recommencer" disponible à chaque étape

### Modulation par treeFocus
- `treeFocus` stocké dans le state depuis la sélection du symptôme
- Persisté jusqu'au `restart`
- Utilisé par le plan d'action pour sélectionner la variante de libellé correcte pour les causes partagées entre les deux arbres

---

## Protocole Blocage MV (Inspecter / Mesurer)

### Composante 1 — Format de capture (6 champs par item)

| Champ | Question concrète | Valeurs |
|-------|-------------------|---------|
| Temporalité | Actif ou anticipé ? | Blocker / Dependency |
| Cluster | Catégorie de la cause | Voir table ci-dessous |
| Source | Équipe, système, rôle | Texte libre |
| Durée | Jours bloqués / jours avant impact | Entier |
| Impact | Items affectés par cette cause | Entier |
| Type (optionnel) | Ce qui manque exactement | Knowledge / Task / Resource |

**Table de clustering (5 catégories) :**

| Cluster | Exemples |
|---------|----------|
| Décision en attente | Approbation PO, choix architecture, go/no-go |
| Dépendance équipe | Autre équipe interne ou externe |
| Compétence / Accès | Expertise absente, droits manquants |
| Clarification fonctionnelle | Besoin flou, critères absents |
| Validation / Conformité | Legal, sécurité, audit |

### Composante 2 — Rituel de collecte

Tagger chaque item dès qu'il entre en état bloqué. Pas de reconstitution a posteriori.

### Composante 3 — Rapport Top 5 enrichi

Deux tableaux : Blockers actifs / Dependencies anticipées.  
Règle de détection contrainte : même Source × 3 items → signal ⚠️ Contrainte systémique.

---

## Roadmap

### V2.5 — Arbre validé ✅ / Plans d'action à implémenter

Arbre de décision Flow complet (21 causes, 2 arbres, SHARED_NODES). Prochaine étape : rédaction et implémentation des plans d'action cause par cause, avec validation de contenu avant code.

### V4 — Migration web app

- Multi-fichier, routing, persistence locale
- Sauvegarde et reprise de parcours (LocalStorage)
- Export PDF du plan d'action
- Dashboard de suivi des expérimentations
- Contenu écosystème (newsletter, podcast) embarqué dans les plans d'action
- Table de clustering enrichie à 8 catégories
- Intégration Vite + React 18 + Vercel (structure préparée, en standby)

---

## Critères de succès

- Un SM peut compléter un diagnostic en < 3 minutes
- Le plan d'action est utilisable en réunion ou imprimable sans outil externe
- Le Protocole Blocage MV est applicable dès le prochain sprint, sans achat d'outil
- Le SM sait immédiatement à qui parler : le propriétaire est affiché dès l'écran Résultat
- Le SM sait où il en est : le palier lui indique s'il doit collecter, quantifier, ou convaincre

---

## Changelog

### V2.5 — Parcours simplifié (rev. 7)

- **[SUPPRIMÉ] Étape Profil** : choix de rôle retiré — le rôle ne pilotait que la formulation des symptômes, pas le diagnostic
- **[SUPPRIMÉ] Étape Catégorie** : sélection de catégorie retirée — Flow est la catégorie active par défaut, les autres seront intégrées dans l'arbre diagnostique au fur et à mesure
- **[SUPPRIMÉ] Double registre symptômes** : libellé unique et universel par symptôme — la variante management/team view est abandonnée
- **[MODIFIÉ] Étape Symptôme** : devient l'étape 1. Inclut le champ nom d'équipe (optionnel, migré depuis l'ancien Profil)
- **[MODIFIÉ] Parcours** : 6 étapes → 4 étapes (Symptôme → Diagnostic → Résultat → Plan d'action)
- **[MODIFIÉ] State applicatif** : ajout de `teamName`, ajout de `"plan"` dans l'enum `step`
- **[MODIFIÉ] Hypothèses de conception** : exit_quality reclassifiée dans le scope — la qualité impacte le flux
- **[MODIFIÉ] Roadmap** : V3 supprimée — ses items résiduels (contenu écosystème, clustering enrichi) fusionnés dans V4
- **[REPORTÉ] Sauvegarde de progression** : fonctionnalité identifiée, reportée à V4

### V2.5 — MVP arbre validé (rev. 1–6)

#### Arbre de décision — restructuration majeure

- **[NOUVEAU] Question d'entrée d'observation** : première question de chaque arbre = observation du board (pas d'interprétation), avec hint contextuel
- **[NOUVEAU] Question discriminante externe/interne** : remplace "dépendance ou pas" — plus fidèle à ce que le SM observe
- **[NOUVEAU] SHARED_NODES** : branche finish et branche interne-démarrage partagées entre les deux arbres, sans duplication
- **[MODIFIÉ] Routing symptômes** : s3 et s4 entrent directement dans la branche correspondante (ttm_urgent_slow / finish_state) — `ttm_observe` supprimé
- **[NOUVEAU] Nœud carryover_nature** : discrimine surengagement (→ c_wip/c_cap) vs blocage réel (→ finish_state) avant d'explorer la branche finish
- **[MODIFIÉ] Questions mémoielles reformulées** : "Sais-tu ?" → "La source est-elle identifiée et tracée ?" / "Peux-tu quantifier ?" → "L'impact est-il chiffré ?"
- **[NOUVEAU] Question "Pourquoi pas encore résolu ?"** : remplace "la décision est-elle dans tes mains ?" sur tous les nœuds de décision finale — formulée explicitement sur p_decision_owner_start, finish_dep_decision, ttm_q3b
- **[NOUVEAU] Question d'anticipation** : sur toutes les branches de dépendance externe identifiée — "Cette dépendance a-t-elle été anticipée ?" (oui = mal planifiée/coordonnée, non = imprévisible)

#### Causes — Option A (variantes contextuelles)

Les anciennes causes génériques c1, c3, c4, c4q ont été scindées en variantes contextuelles précises :

- **c1 → c1_ext + c1_int** : blocage externe inconnue vs blocage interne inconnue
- **c3 → c3_ext + c3_int** : dépendance externe inconnue en exécution vs cause interne inconnue
- **c4 → c4_dep** : dépendance externe découverte en exécution, non quantifiée
- **c4q → c4q_dep** : dépendance externe découverte en exécution, quantifiée

Nouvelles causes issues des observations terrain :

- **[NOUVEAU] c_tech** : blocage technique — système, environnement ou outil indisponible
- **[NOUVEAU] c_gate** : process interne créant un goulot (review, validation, signature)
- **[NOUVEAU] c_anticipation** : dépendance prévisible mal anticipée au refinement ou Sprint Planning
- **[NOUVEAU] c_oversize** : item trop gros — complexité sous-estimée, testing à rallonge, scope initial mal découpé
- **[NOUVEAU] c_scope_creep** : scope qui se rajoute en cours d'exécution (requis qui évoluent, stakeholder qui rajoute)
- **[NOUVEAU] c_skill_unavailable** : expert ou skill indisponible — interne ou externe, leviers identiques (swarming, pair programming, transfer de connaissance)
- **[NOUVEAU] c_defects** : "Défauts récurrents — la qualité interne freine le flux" — palier 1, sévérité high, plan de collecte immédiat, dans le scope Flow. Renommé depuis `exit_quality` (rev. 7) — le préfixe `exit_` était un vestige de l'époque hors scope.
- **[SUPPRIMÉ] c5, c5q, c6, c6u** : remplacés par c_wip, c_cap, c_urgency_misalign, c_strategy_vague
- **[SUPPRIMÉ] none** : l'arbre atteint toujours une cause ou exit_observe

Branche prioritization :
- **[NOUVEAU] c_urgency_misalign** : désaccord sur l'urgence — stratégie claire mais arbitrages locaux divergents
- **[NOUVEAU] c_strategy_vague** : stratégie trop vague — pas d'arbitrage local possible
- **[SUPPRIMÉ] c6u** : remplacé par c_urgency_misalign et c_strategy_vague, plus précis

#### Architecture technique

- **[NOUVEAU] validateTrees()** : fonction de validation runtime exécutée au chargement du module — vérifie toutes les `entry` des symptômes et tous les `next:` de tous les nœuds. Non bloquante, log console uniquement.
- **[NOUVEAU] treeFocus dans le state** : `"predictability" | "time_to_market" | null` — alimenté par `pickSymptom`, remis à null dans `restart`. Passé à `ResultScreen`, badge "Focus arbre" sourcé depuis `treeFocus`. Prérequis pour la modulation des plans d'action.
- **[MODIFIÉ] Schéma Node** : suppression du champ `type` (binary/gradient/choice) — toutes les réponses sont `{label, next}[]`, uniformes.
- **[MODIFIÉ] Schéma Cause** : suppression de `flagDependencies` et `id` redondant — ajout de `palier` (0/1/2/3) et `owner` (string libre affichée en badge).

---

*PRD V2.5 — Collaboration Solved — Pierre-Cyril Denant*
