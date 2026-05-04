import React, { useState } from "react";

// ============================================================
// V2.5 MVP — rev. 7
// Corrections sur rev. 6 :
//   1. exit_quality renommé c_defects — cause dans le scope Flow,
//      pas une sortie hors scope. Préfixe exit_ supprimé.
// ============================================================

// --- DATA: CAUSES ---------------------------------------------------------

const CAUSES = {
  // Démarrage — externe
  c1_ext: {
    label: "Blocage démarrage — dépendance externe inconnue",
    severity: "high", owner: "SM", palier: 1,
    description: "Le démarrage est bloqué par une contrainte externe (autre équipe, input, accès) mais on ne sait pas laquelle. Première action : identifier et tracer la source du blocage.",
  },
  c2: {
    label: "Dépendance externe au démarrage — identifiée mais non quantifiée",
    severity: "high", owner: "SM", palier: 2,
    description: "La dépendance est identifiée (équipe, skill, input) mais son impact n'est pas chiffré. Prochaine étape : quantifier en jours perdus et items bloqués.",
  },
  c2q: {
    label: "Dépendance externe au démarrage — quantifiée, décision dans le périmètre",
    severity: "medium", owner: "SM", palier: 2,
    description: "Cause connue et impact chiffré. La décision pour résoudre est accessible directement par le SM ou l'équipe.",
  },

  // Démarrage — interne
  c1_int: {
    label: "Blocage démarrage — cause interne inconnue",
    severity: "high", owner: "SM", palier: 1,
    description: "Le démarrage est bloqué par quelque chose dans le périmètre de l'équipe, mais les causes n'ont pas été tracées. Première action : observer et collecter.",
  },

  // Exécution — externe, dépendance inconnue
  c3_ext: {
    label: "Blocage en exécution — dépendance externe inconnue",
    severity: "high", owner: "SM", palier: 1,
    description: "Le travail ne peut plus avancer à cause d'une dépendance externe mais on n'a pas identifié laquelle. Première action : tracer la source du blocage.",
  },

  // Exécution — externe, dépendance connue
  c4_dep: {
    label: "Dépendance externe découverte en exécution — non quantifiée",
    severity: "high", owner: "SM", palier: 2,
    description: "Une dépendance externe a bloqué le travail en cours d'exécution. Elle n'était pas anticipée et son impact n'est pas encore chiffré. Prochaine étape : quantifier.",
  },
  c4q_dep: {
    label: "Dépendance externe découverte en exécution — quantifiée, décision dans le périmètre",
    severity: "medium", owner: "SM", palier: 2,
    description: "Dépendance externe non anticipée, impact chiffré. La décision pour résoudre est dans le périmètre du SM ou de l'équipe.",
  },

  // Exécution — interne, raisons inconnues
  c3_int: {
    label: "Blocage en exécution — cause interne inconnue",
    severity: "high", owner: "SM", palier: 1,
    description: "Le travail ne peut plus avancer pour des raisons internes non tracées (process, outil, compétence). Première action : observer et collecter.",
  },

  // Exécution — qui traîne
  c_oversize: {
    label: "Item trop gros — ne peut pas finir dans le cycle",
    severity: "high", owner: "Équipe + PO", palier: 1,
    description: "L'item ne finit pas dans le cycle parce qu'il est structurellement trop gros : complexité sous-estimée, testing à rallonge, bugs liés à la complexité, scope plus large qu'estimé initialement. Ce n'est pas un bloqueur externe — c'est un problème de découpage. Levier : couper en tranches livrables plus petites, DoD plus stricte au démarrage.",
  },
  c_scope_creep: {
    label: "Scope créep en cours d'exécution",
    severity: "medium", owner: "PO + SM", palier: 1,
    description: "Le scope de l'item s'est élargi en cours de route : requis pas clairs qui se clarifient en faisant, ou stakeholder qui rajoute des exigences une fois le travail démarré. L'item ne finit pas parce qu'il grandit plus vite qu'il n'avance. Levier : freeze de scope en sprint, critères d'acceptation verrouillés avant démarrage.",
  },

  // Skill / expert
  c_skill_unavailable: {
    label: "Expert ou skill indisponible — goulot de dépendance interne",
    severity: "high", owner: "SM", palier: 1,
    description: "Une personne spécifique est nécessaire pour débloquer le travail (expert technique, lead, reviewer désigné) et elle n'est pas disponible : surchargée, absente, ou en silo de connaissance. L'item s'accumule dans la colonne en attente de cette personne. Leviers : swarming, pair programming, réduction du WIP sur l'expert, transfer de connaissance.",
  },

  // Dépendance anticipable
  c_anticipation: {
    label: "Dépendance prévisible mal anticipée",
    severity: "medium", owner: "SM + PO", palier: 1,
    description: "La dépendance n'est pas une surprise : elle était identifiable au refinement ou au Sprint Planning mais n'a pas été adressée à temps. Cause-racine : pratiques d'anticipation manquantes (refinement insuffisant, dependency mapping absent, contact tardif avec l'équipe amont). Distinct d'une vraie découverte en cours — le timing est raté, pas l'identification.",
  },

  // Infrastructure / process
  c_tech: {
    label: "Blocage technique — système, environnement ou outil indisponible",
    severity: "high", owner: "Équipe + Ops/Infra", palier: 1,
    description: "Le travail est bloqué par un système, pas par une décision humaine : environnement de dev cassé, accès manquants, outil indisponible, infra fragile, droits non provisionnés. Souvent traité comme du bruit ambiant alors que c'est mesurable et adressable.",
  },
  c_gate: {
    label: "Process interne créant un goulot",
    severity: "medium", owner: "SM + Process owner", palier: 1,
    description: "Un process interne ralentit ou bloque l'avancement : code review concentrée sur une seule personne, validation sécurité, change advisory board, signature obligatoire d'un manager. L'item est prêt, c'est le process qui freine. Cause souvent invisible car perçue comme 'la façon de travailler ici'.",
  },

  // DoR
  c_dor: {
    label: "Items non prêts au démarrage — DoR failure",
    severity: "medium", owner: "PO + SM", palier: 1,
    description: "Le mécanisme de tirage fonctionne, la priorité est claire, mais quand on tente de démarrer l'item prioritaire on découvre des prérequis manquants : clarification absente, dépendance non résolue, critères flous. L'item retourne au backlog.",
  },

  // WIP / capacité
  c_wip: {
    label: "WIP excessif — capacité fragmentée par multitâche",
    severity: "high", owner: "Équipe + SM", palier: 1,
    description: "La capacité existe mais elle est fragmentée par 4–6 items en parallèle par personne. Le context-switching consomme 20–40% de la capacité productive. Inclut le shadow work (support, escalades, side-quests non visibles sur le board). Décision interne à l'équipe.",
  },
  c_cap: {
    label: "Capacité réelle insuffisante",
    severity: "high", owner: "Leadership", palier: 1,
    description: "La concentration existe, les items finissent dans leurs estimations unitaires, mais le scope dépasse structurellement les heures disponibles. Décision de scope (PO) ou de capacité (leadership).",
  },

  // Prioritisation
  c_urgency_misalign: {
    label: "Désaccord sur l'urgence — stratégie claire, arbitrages locaux divergents",
    severity: "medium", owner: "PO + Leadership", palier: 1,
    description: "La stratégie organisationnelle est claire, mais les équipes et parties prenantes l'interprètent différemment quand il faut arbitrer. Du NEW work prend la priorité non parce qu'il est plus stratégique, mais parce qu'il est porté par une voix plus forte.",
  },
  c_strategy_vague: {
    label: "Stratégie trop vague — pas d'arbitrage local possible",
    severity: "high", owner: "Leadership", palier: 1,
    description: "La stratégie elle-même n'est pas suffisamment claire pour arbitrer localement entre deux demandes concurrentes. L'urgence est déléguée par défaut à 'qui crie le plus fort'. Construction d'une échelle d'urgence partagée requise au niveau organisationnel.",
  },

  // Palier 3
  c_org: {
    label: "Blocage organisationnel — données complètes, décision manquante",
    severity: "high", owner: "Leadership", palier: 3,
    description: "Les données existent. La cause est identifiée, l'impact chiffré. Le blocage n'est plus technique ou informationnel — il est décisionnel. Une décision appartenant à une strate au-dessus de l'équipe n'est pas prise.",
  },

  // Sorties spéciales
  exit_observe: {
    label: "Observation requise avant diagnostic",
    severity: "low", owner: "SM", palier: 0,
    description: "Tu n'as pas assez d'observation directe pour répondre. Retourne sur le terrain, observe le board, parle à 2–3 membres de l'équipe sur des items concrets. Reviens ensuite.",
  },

  // Qualité — dans le scope Flow
  c_defects: {
    label: "Défauts récurrents — la qualité interne freine le flux",
    severity: "high", owner: "Équipe + Tech lead", palier: 1,
    description: "Des défauts récurrents ou du rework ralentissent ou bloquent l'avancement. Ce n'est pas une dépendance externe, ni un process — c'est la qualité interne du travail produit qui crée le frein. Les items reviennent en arrière, s'accumulent en correction, ou bloquent la finition par cycles. Action immédiate : tracer les items qui reviennent, le nombre de cycles de correction, et la durée moyenne de rework sur les 2 prochains sprints.",
  },
};

// --- DATA: SYMPTOMS (4) ---------------------------------------------------

const SYMPTOMS = [
  { id: "s1", label: "Le sprint commitment n'est pas tenu", tree: "predictability", entry: "p_observe" },
  { id: "s2", label: "Les dates de livraison sont imprévisibles", tree: "predictability", entry: "p_observe" },
  { id: "s3", label: "Beaucoup de travail attend en file (rien ne démarre)", tree: "time_to_market", entry: "ttm_urgent_slow" },
  { id: "s4", label: "Beaucoup de travail démarre mais ne sort pas", tree: "time_to_market", entry: "finish_state" },
];

// --- SHARED NODES (réutilisables par les deux arbres) ---------------------

const SHARED_NODES = {
  // === Branche FINISH ===

  finish_state: {
    question: "Ce travail est-il bloqué (on ne peut plus avancer) ou qui traîne (on fait autre chose à la place) ?",
    hint: "Bloqué = hard stop, personne ne peut y toucher, l'item est figé. Qui traîne = l'item existe en 'In Progress' mais personne ne s'en occupe activement.",
    answers: [
      { label: "Bloqué — hard stop, on ne peut plus avancer dessus", next: "finish_blocked_nature" },
      { label: "Qui traîne — pas de bloqueur dur, mais l'équipe fait autre chose", next: "finish_drags" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  finish_blocked_nature: {
    question: "Ce blocage vient-il de l'extérieur ou de l'intérieur de l'équipe ?",
    hint: "Extérieur = autre équipe, dépendance, expert inatteignable. Intérieur = outil cassé, process, qualité, inconnu.",
    answers: [
      { label: "Extérieur — autre équipe, dépendance ou expert inaccessible", next: "finish_ext_type" },
      { label: "Intérieur — quelque chose dans notre périmètre", next: "p_internal_nature_finish" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  finish_ext_type: {
    question: "Quelle est la nature de ce blocage externe ?",
    answers: [
      { label: "Une dépendance équipe ou un input externe manquant", next: "finish_dep_anticipable" },
      { label: "Un expert ou skill indisponible (surcharge, absence, silo de connaissance)", next: "c_skill_unavailable" },
      { label: "Je ne sais pas quelle dépendance bloque exactement", next: "c3_ext" },
    ],
  },

  finish_dep_anticipable: {
    question: "Cette dépendance a-t-elle été anticipée ?",
    hint: "Anticipée = identifiée et tracée explicitement au refinement ou Sprint Planning.",
    answers: [
      { label: "Oui — elle était connue mais mal planifiée, priorisée ou coordonnée", next: "c_anticipation" },
      { label: "Non — découverte en cours d'exécution", next: "finish_dep_quantify" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  finish_dep_quantify: {
    question: "L'impact de cette dépendance est-il chiffré (jours perdus, items bloqués) ?",
    answers: [
      { label: "Non, l'impact n'est pas encore chiffré", next: "c4_dep" },
      { label: "Oui, l'impact est chiffré", next: "finish_dep_decision" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  finish_dep_decision: {
    question: "Ce blocage est identifié et son impact est chiffré. Pourquoi n'est-il pas encore résolu ?",
    hint: "C'est la question clé : 'Why isn't this fixed yet?' Elle distingue un problème qu'on peut traiter directement d'un problème qui nécessite une décision organisationnelle.",
    answers: [
      { label: "L'équipe ou moi peut agir — on n'a pas encore priorisé la résolution", next: "c4q_dep" },
      { label: "La décision appartient à une strate au-dessus et elle n'est pas prise", next: "c_org" },
    ],
  },

  p_internal_nature_finish: {
    question: "Quelle est la nature précise de ce blocage interne en cours d'exécution ?",
    answers: [
      { label: "Un système / outil / environnement ne fonctionne pas", next: "c_tech" },
      { label: "Un process interne crée un goulot (review, validation, signature)", next: "c_gate" },
      { label: "Des défauts récurrents font traîner (rework, bugs qui reviennent)", next: "c_defects" },
      { label: "Raisons inconnues — on n'a pas tracé", next: "c3_int" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  finish_drags: {
    question: "Pas de bloqueur dur — pourquoi cet item n'avance plus ?",
    hint: "On cherche la raison principale pour laquelle personne ne le prend ou le finit.",
    answers: [
      { label: "L'item est trop gros (complexité sous-estimée, testing à rallonge, bugs de complexité)", next: "c_oversize" },
      { label: "Le scope s'est rajouté en cours (requis qui évoluent, stakeholder qui rajoute)", next: "c_scope_creep" },
      { label: "L'équipe a pris d'autres items à la place (multitâche)", next: "c_wip" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  // === Carryover : surengagement ou blocage réel ? ===
  carryover_nature: {
    question: "Ce vieux travail qui traîne — est-il bloqué par une contrainte réelle, ou l'équipe l'a mis de côté faute de capacité ?",
    hint: "Surengagement = l'équipe est occupée sur d'autres choses, ces items pourraient avancer si on libérait de la capacité. Blocage réel = une contrainte concrète empêche ces items spécifiques d'avancer même si on s'y consacrait.",
    answers: [
      { label: "Surengagement — on a planifié plus qu'on ne peut livrer, ces items sont passés en second", next: "p_capacity_split" },
      { label: "Blocage réel — il y a une contrainte concrète sur ces items spécifiques", next: "finish_state" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  // === Blocage interne au DÉMARRAGE ===
  p_internal_nature_start: {
    question: "Quelle est la nature précise de ce blocage interne au démarrage ?",
    hint: "Plusieurs causes possibles : système qui ne marche pas, process qui freine, items pas prêts, raisons floues.",
    answers: [
      { label: "Un système / outil / environnement ne fonctionne pas (accès, infra, env de dev)", next: "c_tech" },
      { label: "Un process interne crée un goulot (review obligatoire, validation, signature)", next: "c_gate" },
      { label: "Les items ne sont pas prêts (clarification absente, critères flous, dépendance non résolue)", next: "c_dor" },
      { label: "Des défauts récurrents empêchent le démarrage (rework en entrée)", next: "c_defects" },
      { label: "Raisons inconnues — on n'a pas tracé pourquoi", next: "c1_int" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },
};

// --- DATA: PREDICTABILITY TREE -------------------------------------------

const PREDICTABILITY_NODES = {
  p_observe: {
    question: "Observe ton board sur le sprint qui ne tient pas. Qu'est-ce qui s'est réellement passé pendant le sprint ?",
    hint: "Regarde concrètement : les items planifiés au Sprint Planning ont-ils avancé, ou autre chose s'est-il invité ?",
    answers: [
      { label: "Le travail planifié n'a pas avancé (rien d'autre n'a pris sa place)", next: "p_blocked_nature" },
      { label: "D'autre travail s'est invité ou a été fait à la place du planifié", next: "p_other_type" },
      { label: "Je ne sais pas — je n'ai pas observé directement", next: "exit_observe" },
    ],
  },

  p_blocked_nature: {
    question: "Ce blocage du travail planifié vient-il de l'extérieur ou de l'intérieur de l'équipe ?",
    hint: "Extérieur = autre équipe, dépendance, input externe, skill manquant. Intérieur = process, outil, items pas prêts, raisons internes.",
    answers: [
      { label: "Extérieur — autre équipe ou dépendance externe", next: "p_could_start" },
      { label: "Intérieur — quelque chose dans notre périmètre", next: "p_internal_nature_start" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_could_start: {
    question: "Pourriez-vous démarrer le travail planifié si vous aviez la capacité ?",
    hint: "On distingue si la dépendance bloque le démarrage ou l'exécution une fois démarré.",
    answers: [
      { label: "Non — le démarrage lui-même est bloqué", next: "p_know_capacity" },
      { label: "Oui, on pourrait démarrer mais on bloque pendant l'exécution", next: "finish_state" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_know_capacity: {
    question: "La source de ce blocage externe est-elle identifiée et tracée ?",
    hint: "Identifiée et tracée = on peut nommer la dépendance, l'équipe ou le skill manquant, et on l'a écrit quelque part.",
    answers: [
      { label: "Non, la source n'est pas encore identifiée", next: "c1_ext" },
      { label: "Oui, la source est identifiée et tracée", next: "p_anticipable" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_anticipable: {
    question: "Cette dépendance a-t-elle été anticipée ?",
    hint: "Anticipée = identifiée et tracée explicitement au refinement ou Sprint Planning.",
    answers: [
      { label: "Oui — elle était connue mais mal planifiée, priorisée ou coordonnée", next: "c_anticipation" },
      { label: "Non — découverte en cours, imprévisible", next: "p_quantify_dep" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_quantify_dep: {
    question: "L'impact de cette dépendance est-il chiffré (jours perdus, items bloqués) ?",
    answers: [
      { label: "Non, l'impact n'est pas encore chiffré", next: "c2" },
      { label: "Oui, l'impact est chiffré", next: "p_decision_owner_start" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_decision_owner_start: {
    question: "Ce blocage est identifié et son impact est chiffré. Pourquoi n'est-il pas encore résolu ?",
    hint: "C'est la question clé : 'Why isn't this fixed yet?' Elle distingue un problème qu'on peut traiter directement d'un problème qui nécessite une décision organisationnelle.",
    answers: [
      { label: "L'équipe ou moi peut agir — on n'a pas encore priorisé la résolution", next: "c2q" },
      { label: "La décision appartient à une strate au-dessus et elle n'est pas prise", next: "c_org" },
    ],
  },

  p_other_type: {
    question: "Cet autre travail qui a pris la place du planifié — c'est du carryover ou du NEW work ?",
    hint: "Carryover = vieux travail qui traîne depuis des sprints. NEW work = nouvelle demande entrée en cours de sprint.",
    answers: [
      { label: "Du carryover (vieux travail qui n'arrive pas à finir)", next: "carryover_nature" },
      { label: "Du NEW work qui s'est invité en cours de sprint", next: "p_new_urgent" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_new_urgent: {
    question: "Ce NEW work qui s'est invité — était-il vraiment plus urgent que le travail planifié, ou pris par défaut ?",
    hint: "Test : si tu avais arbitré explicitement, aurais-tu confirmé que ce NEW work passe avant ?",
    answers: [
      { label: "Non, pris sans vrai arbitrage (faute de capacity limit)", next: "p_capacity_split" },
      { label: "Oui, objectivement plus urgent", next: "p_strategy_check" },
      { label: "Je ne sais pas — l'arbitrage n'a pas été conscient", next: "exit_observe" },
    ],
  },

  p_capacity_split: {
    question: "Quand l'équipe accepte ce NEW work, travaille-t-elle simultanément sur plusieurs items en parallèle (4–6 par personne) ?",
    hint: "Observable directement sur le board. Inclut le shadow work (support, escalades non visibles).",
    answers: [
      { label: "Oui — multitâche permanent, chacun jongle entre plusieurs items", next: "c_wip" },
      { label: "Non — concentration bonne par item, mais le volume total dépasse les heures dispo", next: "c_cap" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  p_strategy_check: {
    question: "La stratégie est-elle suffisamment claire pour permettre à l'équipe d'arbitrer entre deux demandes concurrentes ?",
    hint: "Test : si le PO et un sponsor demandent deux choses différentes en même temps, l'équipe peut-elle s'appuyer sur un référentiel partagé pour trancher ?",
    answers: [
      { label: "Oui, la stratégie est claire — mais les parties prenantes ne s'accordent pas sur l'urgence", next: "c_urgency_misalign" },
      { label: "Non, la stratégie elle-même est trop vague pour arbitrer", next: "c_strategy_vague" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },
};

// --- DATA: TIME TO MARKET TREE -------------------------------------------

const TTM_NODES = {
  // entry s3 — waiting
  ttm_urgent_slow: {
    question: "Le travail urgent (top priorité) est-il aussi trop lent à démarrer, ou seulement le reste ?",
    hint: "Pour tester si le système peut tirer rapidement quand c'est nécessaire.",
    answers: [
      { label: "Oui — même les urgences traînent en attente", next: "ttm_urgency_check" },
      { label: "Non — les urgences démarrent vite, c'est seulement le reste qui traîne", next: "ttm_backlog_check" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_urgency_check: {
    question: "L'urgence est-elle clairement définie et respectée par toutes les parties prenantes ?",
    hint: "Test : si tu demandes à 3 stakeholders 'quel est l'item le plus urgent ?', obtiens-tu la même réponse ?",
    answers: [
      { label: "Pas vraiment — il y a désaccord sur ce qui est urgent", next: "c_urgency_misalign" },
      { label: "Oui, l'urgence est claire — mais on ne peut pas démarrer pour autant", next: "ttm_blocked_nature" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_blocked_nature: {
    question: "Ce blocage du démarrage vient-il de l'extérieur ou de l'intérieur de l'équipe ?",
    hint: "Extérieur = autre équipe, dépendance. Intérieur = système, process, items pas prêts.",
    answers: [
      { label: "Extérieur — dépendance externe", next: "ttm_q1" },
      { label: "Intérieur — quelque chose dans notre périmètre", next: "p_internal_nature_start" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_q1: {
    question: "La source de ce blocage est-elle identifiée et tracée ?",
    hint: "Identifiée et tracée = on peut nommer la dépendance, l'équipe ou le skill manquant, et on l'a écrit quelque part.",
    answers: [
      { label: "Non, la source n'est pas encore identifiée", next: "c1_ext" },
      { label: "Oui, la source est identifiée et tracée", next: "ttm_anticipable" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_anticipable: {
    question: "Cette dépendance a-t-elle été anticipée ?",
    hint: "Anticipée = identifiée et tracée explicitement au refinement ou Sprint Planning.",
    answers: [
      { label: "Oui — elle était connue mais mal planifiée, priorisée ou coordonnée", next: "c_anticipation" },
      { label: "Non — découverte en cours, imprévisible", next: "ttm_q3" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_q3: {
    question: "L'impact de ce blocage est-il chiffré (jours perdus, items bloqués) ?",
    answers: [
      { label: "Non, l'impact n'est pas encore chiffré", next: "c2" },
      { label: "Oui, l'impact est chiffré", next: "ttm_q3b" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },

  ttm_q3b: {
    question: "Ce blocage est identifié et son impact est chiffré. Pourquoi n'est-il pas encore résolu ?",
    hint: "C'est la question clé : 'Why isn't this fixed yet?' Elle distingue un problème qu'on peut traiter directement d'un problème qui nécessite une décision organisationnelle.",
    answers: [
      { label: "L'équipe ou moi peut agir — on n'a pas encore priorisé la résolution", next: "c2q" },
      { label: "La décision appartient à une strate au-dessus et elle n'est pas prise", next: "c_org" },
    ],
  },

  ttm_backlog_check: {
    question: "Quand tu tentes de démarrer l'item prioritaire (non-urgent), découvres-tu régulièrement des prérequis manquants ?",
    hint: "Critères d'acceptation flous, dépendance non résolue, clarification absente.",
    answers: [
      { label: "Oui — quand on tire l'item, il n'est pas pull-ready", next: "c_dor" },
      { label: "Non, les items sont prêts mais on n'arrive pas à les démarrer pour d'autres raisons", next: "ttm_blocked_nature" },
      { label: "Je ne sais pas", next: "exit_observe" },
    ],
  },
  // entry s4 → finish_state (SHARED)
};

const TREES = {
  predictability: { label: "Prévisibilité", nodes: PREDICTABILITY_NODES },
  time_to_market: { label: "Time to Market", nodes: TTM_NODES },
};

// --- RUNTIME VALIDATION ---------------------------------------------------

function validateTrees() {
  const allIds = new Set([
    ...Object.keys(CAUSES),
    ...Object.keys(SHARED_NODES),
    ...Object.keys(PREDICTABILITY_NODES),
    ...Object.keys(TTM_NODES),
  ]);

  const allNodes = { ...SHARED_NODES, ...PREDICTABILITY_NODES, ...TTM_NODES };
  let errors = 0;

  for (const s of SYMPTOMS) {
    if (!allIds.has(s.entry)) {
      console.error(`[VALIDATION] Symptôme "${s.id}" → entry "${s.entry}" introuvable`);
      errors++;
    }
  }

  for (const [nodeId, node] of Object.entries(allNodes)) {
    if (!node.answers) {
      console.error(`[VALIDATION] Nœud "${nodeId}" n'a pas de champ answers`);
      errors++;
      continue;
    }
    for (const ans of node.answers) {
      if (!ans.next) {
        console.error(`[VALIDATION] Nœud "${nodeId}" → une réponse sans champ next`);
        errors++;
      } else if (!allIds.has(ans.next)) {
        console.error(`[VALIDATION] Nœud "${nodeId}" → next "${ans.next}" introuvable`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log(`[VALIDATION] ✓ ${allIds.size} IDs valides · ${Object.keys(allNodes).length} nœuds vérifiés · 0 erreur`);
  } else {
    console.error(`[VALIDATION] ${errors} erreur(s) détectée(s) — voir détails ci-dessus`);
  }
}

validateTrees();

// --------------------------------------------------------------------------

function lookupNode(treeId, nodeId) {
  if (CAUSES[nodeId]) return null;
  if (SHARED_NODES[nodeId]) return SHARED_NODES[nodeId];
  const tree = TREES[treeId];
  if (tree && tree.nodes[nodeId]) return tree.nodes[nodeId];
  for (const id of Object.keys(TREES)) {
    if (TREES[id].nodes[nodeId]) return TREES[id].nodes[nodeId];
  }
  return null;
}

// --- HELPERS --------------------------------------------------------------

const FONT = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const C = {
  bg: "#fafaf9", surface: "#ffffff", text: "#171717", muted: "#737373",
  border: "#e5e5e5", borderStrong: "#404040", ink: "#0a0a0a",
  high: "#b91c1c", med: "#b45309", low: "#737373",
  palier1: "#0369a1", palier2: "#7c3aed", palier3: "#b91c1c", palierObs: "#737373",
  hintBg: "#fef9c3", hintBorder: "#fde047", hintText: "#713f12",
};

function severityLabel(s) { return s === "high" ? "Critique" : s === "medium" ? "Modéré" : "Faible"; }
function severityColor(s) { return s === "high" ? C.high : s === "medium" ? C.med : C.low; }
function palierMeta(p) {
  if (p === 1) return { label: "Palier 1 — Données à collecter", color: C.palier1 };
  if (p === 2) return { label: "Palier 2 — Impact à quantifier", color: C.palier2 };
  if (p === 3) return { label: "Palier 3 — Décision à déclencher", color: C.palier3 };
  return { label: "Hors palier — Observation requise", color: C.palierObs };
}

// --- COMPONENTS -----------------------------------------------------------

export default function App() {
  const [step, setStep] = useState("symptom");
  const [symptom, setSymptom] = useState(null);
  const [path, setPath] = useState([]);
  const [terminalId, setTerminalId] = useState(null);
  const [treeFocus, setTreeFocus] = useState(null);

  const currentNodeId = path.length > 0 ? path[path.length - 1].next : symptom ? symptom.entry : null;
  const currentNode = currentNodeId && symptom && !CAUSES[currentNodeId]
    ? lookupNode(symptom.tree, currentNodeId)
    : null;

  function pickSymptom(s) {
    setSymptom(s);
    setTreeFocus(s.tree);
    setPath([]);
    setTerminalId(null);
    setStep("diagnosis");
  }

  function answer(ans) {
    const newPath = [...path, { nodeId: currentNodeId, question: currentNode.question, answer: ans.label, next: ans.next }];
    if (CAUSES[ans.next]) { setPath(newPath); setTerminalId(ans.next); setStep("result"); }
    else setPath(newPath);
  }

  function backOne() {
    if (path.length === 0) { setStep("symptom"); setSymptom(null); setTreeFocus(null); return; }
    setPath(path.slice(0, -1));
    setTerminalId(null);
    if (step === "result") setStep("diagnosis");
  }

  function restart() { setStep("symptom"); setSymptom(null); setPath([]); setTerminalId(null); setTreeFocus(null); }

  const tree = symptom ? TREES[symptom.tree] : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, fontSize: 15, lineHeight: 1.5, padding: "32px 16px 64px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Header />
        {step === "symptom" && <SymptomScreen onPick={pickSymptom} />}
        {step === "diagnosis" && symptom && currentNode && (
          <DiagnosisScreen symptom={symptom} tree={tree} currentNodeId={currentNodeId} currentNode={currentNode} path={path} onAnswer={answer} onBack={backOne} onRestart={restart} />
        )}
        {step === "result" && terminalId && (
          <ResultScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} path={path} onBack={backOne} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Collaboration Solved · V2.5 · rev. 7</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: C.ink }}>Team Dysfunction Diagnostic</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Flow & Livraison — Plan d'action à venir.</div>
    </div>
  );
}

function SymptomScreen({ onPick }) {
  return (
    <div>
      <SectionTitle n="01" label="Symptôme observé" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SYMPTOMS.map((s) => (
          <button key={s.id} onClick={() => onPick(s)}
            style={{ ...btnReset, textAlign: "left", padding: "14px 16px", border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.borderStrong)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}>
            <span style={{ fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, flexShrink: 0 }}>→ {TREES[s.tree].label.toLowerCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiagnosisScreen({ symptom, tree, currentNodeId, currentNode, path, onAnswer, onBack, onRestart }) {
  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel={path.length === 0 ? "← Symptôme" : "← Précédent"} />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label={`Question ${path.length + 1}`} nodeId={currentNodeId} />
      <div style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: 10, lineHeight: 1.4 }}>{currentNode.question}</div>
      {currentNode.hint && (
        <div style={{ background: C.hintBg, border: `1px solid ${C.hintBorder}`, color: C.hintText, fontSize: 13, padding: "8px 12px", borderRadius: 4, marginBottom: 16, lineHeight: 1.45 }}>
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 6 }}>Indice</span>
          {currentNode.hint}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {currentNode.answers.map((a, i) => (
          <button key={i} onClick={() => onAnswer(a)}
            style={{ ...btnReset, textAlign: "left", padding: "12px 16px", border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.background = "#f5f5f4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
            <span>{a.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, flexShrink: 0 }}>{a.next}</span>
          </button>
        ))}
      </div>
      {path.length > 0 && <PathTrail path={path} />}
    </div>
  );
}

function ResultScreen({ symptom, tree, treeFocus, terminalId, path, onBack, onRestart }) {
  const cause = CAUSES[terminalId];
  const sev = severityColor(cause.severity);
  const palier = palierMeta(cause.palier);
  const focusLabel = treeFocus ? TREES[treeFocus].label : tree.label;
  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Modifier dernière réponse" />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label="Cause identifiée" nodeId={terminalId} />
      <div style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${sev}`, background: C.surface, padding: "18px 20px", borderRadius: 6, marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{cause.label}</div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>{cause.description}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Badge color={sev}>Sévérité : {severityLabel(cause.severity)}</Badge>
          <Badge color={palier.color}>{palier.label}</Badge>
          <Badge color={C.borderStrong}>Propriétaire : {cause.owner}</Badge>
          <Badge color={C.muted}>Focus arbre : {focusLabel}</Badge>
        </div>
      </div>
      <PathTrail path={path} />
      <div style={{ marginTop: 24, fontSize: 12, color: C.muted, fontStyle: "italic" }}>Plan d'action — à implémenter.</div>
    </div>
  );
}

function ContextStrip({ symptom, tree, onBack, onRestart, backLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: C.muted }}>
        <span style={{ fontFamily: MONO }}>{tree.label}</span>
        <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
        <span>{symptom.label}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onBack} style={linkBtn}>{backLabel}</button>
        <button onClick={onRestart} style={linkBtn}>↻ Recommencer</button>
      </div>
    </div>
  );
}

function SectionTitle({ n, label, nodeId }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{n}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      {nodeId && <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginLeft: "auto" }}>[{nodeId}]</span>}
    </div>
  );
}

function PathTrail({ path }) {
  return (
    <div style={{ border: `1px dashed ${C.border}`, borderRadius: 6, padding: "12px 14px", background: "#fafafa" }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Chemin de diagnostic</div>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
        {path.map((p, i) => (
          <li key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>
            <div style={{ color: C.muted, fontSize: 12 }}><span style={{ fontFamily: MONO, fontSize: 10 }}>[{p.nodeId}]</span> {p.question}</div>
            <div style={{ color: C.text }}>→ {p.answer}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}`, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.2, background: "#fff" }}>
      {children}
    </span>
  );
}

const btnReset = { font: "inherit", color: "inherit", outline: "none" };
const linkBtn = { ...btnReset, border: "none", background: "transparent", fontSize: 12, color: C.muted, cursor: "pointer", padding: "4px 6px", textDecoration: "underline", textUnderlineOffset: 3 };
