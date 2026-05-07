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

// --- DATA: ACTION_PLANS (plans d'action par cause) ------------------------

const ACTION_PLANS = {
  c_tech: {
    cost: "[items bloqués pour raison technique] × [jours d'attente moyens] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter les items tagués \"bloqué\" à la fin des 3 derniers sprints et demander, pour chacun, si la raison était technique.",
    experiments: [
      {
        label: "Étape 1 — Rendre le blocage traçable",
        timing: "cette semaine",
        description: "Ajouter un tag \"bloqué — tech\" sur le board. Dès qu'un item entre en attente pour cause technique, noter : ce qui est bloqué, depuis quand, qui résout côté Ops ou Infra. Pas de reconstitution après coup.",
        criterion: "À la fin du sprint en cours, au moins un blocage tech est tracé avec les trois champs remplis.",
        gate: true,
      },
      {
        label: "Étape 2 — Slot de résolution fixe",
        timing: "sprint suivant",
        description: "15 minutes par semaine, heure fixe, avec le responsable Ops ou Infra. Tous les items tagués \"tech\" passent dans ce slot. L'item attend le slot suivant, pas la prochaine fois que quelqu'un est disponible.",
        criterion: "La durée moyenne d'un blocage technique baisse sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items bloqués pour raison technique en fin de sprint", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Durée moyenne d'un blocage technique", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM + responsable Ops/Infra — 10 min en rétro, intégré à la revue de sprint.",
    businessPitch: {
      leadershipQuestion: "\"Combien de jours-équipe perdons-nous par sprint sur des blocages techniques — et qui est officiellement responsable de les résoudre ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque blocage technique non adressé consomme [X] jours de capacité planifiée par sprint. Le sprint ne rattrape pas ces jours une fois perdus.",
          expectedResult: "Tracer et adresser ces blocages dès qu'ils arrivent réduit le nombre de sprints non tenus, sans changer ce que l'équipe peut livrer en conditions normales.",
        },
        time_to_market: {
          statusQuoCost: "Un item bloqué par un problème technique attend en moyenne [X] jours avant que quelqu'un prenne la main. Ce délai s'accumule sur chaque livraison.",
          expectedResult: "Un slot de résolution fixe avec Ops/Infra réduit ce délai directement sur le cycle time des items concernés.",
        },
      },
    },
  },
  c_gate: {
    cost: "[items en attente au gate] × [jours d'attente moyens] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien d'items terminés attendaient encore une validation à la fin des 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Nommer le gate",
        timing: "cette semaine",
        description: "20 minutes en rétro. Une question : \"À quelle étape est-ce qu'on attend quelqu'un d'autre ?\" Un post-it par gate identifié. Pour chaque gate : qui intervient, combien d'items passent, temps d'attente moyen.",
        criterion: "Au moins un gate avec un temps d'attente moyen supérieur à un jour est identifié et nommé.",
        gate: true,
      },
      {
        label: "Étape 2 — Slot fixe sur le gate principal",
        timing: "sprint suivant",
        description: "15 minutes par jour, heure fixe, avec le responsable du gate. Tous les items en attente passent à ce moment. L'attente ad hoc disparaît.",
        criterion: "Temps d'attente moyen sous 1 jour sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items en attente au gate en fin de sprint", target: "≤ 2", frequency: "Chaque sprint" },
      { metric: "Temps d'attente moyen au gate", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 10 min en fin de sprint, intégré à la rétro ou la Sprint Review.",
    businessPitch: {
      leadershipQuestion: "\"Est-ce que ce niveau de contrôle vaut ce qu'il coûte — [coût estimé] par sprint ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Notre gate de [nom du gate] immobilise en moyenne [X] jours de capacité par sprint. Du travail terminé qui attend. Régler ce gate libère cette capacité sans budget supplémentaire.",
          expectedResult: "Réduire l'attente au gate libère de la capacité planifiée sans budget supplémentaire.",
        },
        time_to_market: {
          statusQuoCost: "Chaque validation interne qui traîne allonge le cycle time sans rien ajouter.",
          expectedResult: "Réduire l'attente au gate réduit le délai moyen de livraison sur les items concernés.",
        },
      },
    },
  },
  c_oversize: {
    cost: "[items non terminés par sprint] × [jours de travail déjà consommés] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter les items présents dans le sprint depuis plus de deux cycles consécutifs. Chaque item en carryover a déjà consommé une partie de la capacité du sprint précédent sans retour.",
    experiments: [
      {
        label: "Étape 1 — Fixer une règle de taille",
        timing: "cette semaine",
        description: "En rétro, l'équipe pose un seuil : tout item qui dépasse [X] jours ou [Y] points doit être découpé avant d'entrer en sprint. PO et développeurs ensemble. La règle s'applique dès le prochain sprint planning, pas dans deux semaines.",
        criterion: "Au moins un item découpé selon la règle avant la fin du sprint en cours.",
        gate: true,
      },
      {
        label: "Étape 2 — Intégrer le check taille dans la DoR",
        timing: "sprint suivant",
        description: "Ajouter un critère d'entrée au sprint : \"taille validée par l'équipe en refinement\". Aucun item ne rentre en sprint sans que le PO et l'équipe aient confirmé qu'il est faisable dans le cycle.",
        criterion: "Zéro item en carryover pour raison de taille sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items en carryover en fin de sprint", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Items validés en taille avant d'entrer en sprint", target: "100%", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 5 min en Sprint Review, comparaison sprint sur sprint.",
    businessPitch: {
      leadershipQuestion: "\"Si on livrait en deux fois au lieu d'une, est-ce que le client obtient de la valeur plus tôt — et est-ce que ça compte pour lui ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Des items trop gros débordent sur le sprint suivant. La vélocité baisse sans que l'équipe soit moins productive — elle travaille sur des sujets qui ne terminent pas.",
          expectedResult: "Découper avant le sprint libère une capacité qui travaillait déjà mais ne livrait jamais. Le sprint se ferme avec ce qu'il a commencé.",
        },
        time_to_market: {
          statusQuoCost: "Un item qui s'étale sur plusieurs sprints n'apporte rien pendant tout ce temps. Chaque sprint supplémentaire est un délai de livraison.",
          expectedResult: "Découper permet de livrer une première partie dès le sprint suivant, et de réduire le délai entre le démarrage et la première valeur reçue par le client.",
        },
      },
    },
  },
  c_scope_creep: {
    cost: "[ajouts de scope par sprint] × [jours de travail non planifiés absorbés] × [coût journalier équipe]",
    costHint: "Si les données manquent : en fin de sprint, comparer la description initiale de chaque item livré avec ce qui a été fait. Les items dont le contenu a changé pendant l'exécution sont le signal.",
    experiments: [
      {
        label: "Étape 1 — Photographier le scope au démarrage",
        timing: "ce sprint",
        description: "Quand un développeur prend un item : deux lignes dans le ticket, ce qui est inclus, ce qui est exclu. Le PO valide si la description ne lui correspond pas. Pas de formalisme, un commentaire suffit.",
        criterion: "Au moins un item du sprint a une description de scope figée au démarrage.",
        gate: true,
      },
      {
        label: "Étape 2 — Tout ajout devient un ticket",
        timing: "sprint suivant",
        description: "Tout ajout de scope pendant le sprint : nouveau ticket, ajouté au backlog, discuté au prochain planning. Pas d'ajout silencieux. Le SM facilite le refus quand le PO est sous pression. Les ajouts ne disparaissent pas. Ils attendent.",
        criterion: "Zéro ajout de scope non tracé sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items dont le scope a changé pendant le sprint", target: "≤ 1", frequency: "Chaque sprint" },
      { metric: "Tickets créés pour scope non planifié", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "PO + SM — 10 min en rétro, revue des items livrés vs description initiale.",
    businessPitch: {
      leadershipQuestion: "\"Est-ce que les [X] jours perdus par sprint sur des ajouts non planifiés valent plus que les [Y] items qu'on n'a pas pu livrer à cause d'eux ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque ajout de scope pendant le sprint mange de la capacité sans avoir été planifié. Le sprint devient imprévisible sans que l'équipe soit désorganisée — la définition du travail change en cours d'exécution.",
          expectedResult: "Figer le scope au démarrage rend la vélocité lisible et le sprint engageable.",
        },
        time_to_market: {
          statusQuoCost: "Un item qui grandit pendant l'exécution prend plus de temps à chaque cycle. Le cycle time s'allonge par accumulation d'ajouts invisibles.",
          expectedResult: "Tracer et bloquer les ajouts réduit le temps moyen entre démarrage et livraison effective.",
        },
      },
    },
  },
  c_wip: {
    cost: "[personnes en multitâche] × [perte estimée par changement de contexte] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter les items en statut \"in progress\" sur le board à n'importe quel moment de la journée. Si ce nombre dépasse le nombre de personnes dans l'équipe, du multitâche est en cours.",
    experiments: [
      {
        label: "Étape 1 — Poser une limite WIP visible",
        timing: "cette semaine",
        description: "En rétro ou en daily : une personne, un item actif à la fois. Si le travail se fait en binôme, deux personnes pour un item actif. Écrire la règle sur le board. L'équipe l'a posée elle-même, elle la tient elle-même.",
        criterion: "Le nombre d'items \"in progress\" ne dépasse pas [X] à aucun moment du sprint suivant.",
        gate: true,
      },
      {
        label: "Étape 2 — Finir avant de commencer",
        timing: "sprint suivant",
        description: "Quand la limite WIP est atteinte et qu'une main se libère : avant de prendre un nouveau sujet, elle aide à débloquer ce qui est déjà en cours. Le SM facilite le swarming. On ne commence pas, on finit.",
        criterion: "Le throughput — items terminés par sprint — est en hausse sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "WIP moyen (items actifs simultanément)", target: "≤ [limite fixée]", frequency: "Chaque sprint" },
      { metric: "Throughput (items terminés par sprint)", target: "Tendance hausse", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 5 min au Daily, revue du board en temps réel.",
    businessPitch: {
      leadershipQuestion: "\"Si l'équipe terminait [X] items par sprint au lieu de [Y], est-ce que ça change notre capacité à tenir nos engagements envers le business ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Quand tout le monde travaille sur plusieurs sujets en même temps, peu d'items sortent à temps. Le sprint se ferme avec beaucoup de travail commencé et peu de travail livré.",
          expectedResult: "Poser une limite WIP augmente le nombre d'items terminés par sprint, sans personne supplémentaire.",
        },
        time_to_market: {
          statusQuoCost: "Le cycle time s'allonge quand chaque item attend pendant qu'on travaille sur un autre. Le délai entre démarrage et livraison s'accumule item par item.",
          expectedResult: "Réduire le WIP réduit directement le délai entre démarrage et livraison, item par item.",
        },
      },
    },
  },
  c1_ext: {
    cost: "[items bloqués au démarrage] × [jours avant identification de la source] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter, sur les 3 derniers sprints, combien d'items planifiés n'ont pas démarré le premier jour et pour quelle raison.",
    experiments: [
      {
        label: "Étape 1 — Tagger chaque blocage au démarrage",
        timing: "cette semaine",
        description: "Au prochain standup, introduire une règle simple : tout item qui ne peut pas démarrer reçoit un tag \"bloqué\" sur le board, avec deux infos : qui ou quoi bloque, depuis quand. Le SM collecte en temps réel. Pas de reconstitution après coup.",
        criterion: "Au moins 3 items taggés avec une source identifiée, même partielle, d'ici la fin de la semaine.",
        gate: true,
      },
      {
        label: "Étape 2 — Top 5 des sources de blocage au démarrage",
        timing: "ce sprint",
        description: "Avec les données collectées, classer les blocages par fréquence et durée. Présenter en rétro : source, nombre d'items affectés, jours d'attente. Identifier une source externe sur laquelle une action est possible — escalade, accord de service, ou re-planification.",
        criterion: "Au moins une source externe nommée avec un responsable identifié et une action définie.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items planifiés bloqués au démarrage", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Délai entre blocage et identification de la source", target: "< 1 jour", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 5 min en Daily + revue en rétro.",
    businessPitch: {
      leadershipQuestion: "\"Combien de jours de capacité avons-nous perdus ce sprint sur des items qui n'ont pas pu démarrer — et pour quelle raison ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Des items planifiés ne démarrent pas, bloqués par des dépendances externes que personne n'a identifiées. Cette capacité disparaît sans trace dans chaque sprint.",
          expectedResult: "Rendre les sources de blocage visibles permet au SM d'escalader ou de re-planifier. Le sprint ne perd plus de capacité sur des causes inconnues.",
        },
        time_to_market: {
          statusQuoCost: "Chaque dépendance externe non identifiée au démarrage allonge le cycle time sans que personne ne prenne de décision. Le délai s'accumule en silence.",
          expectedResult: "Identifier la source du blocage dès J+1 réduit le temps d'attente et permet de traiter la dépendance avant qu'elle retarde la livraison.",
        },
      },
    },
  },
  c1_int: {
    cost: "[items non démarrés à J+2 du sprint] × [jours avant démarrage effectif] × [coût journalier équipe]",
    costHint: "Si les données manquent : noter à la fin du Sprint Planning quels items n'ont pas de propriétaire ou n'ont pas démarré 48h après le début du sprint.",
    experiments: [
      {
        label: "Étape 1 — Nommer le blocage au moment où il se produit",
        timing: "cette semaine",
        description: "En Daily, ajouter une question fixe : \"Y a-t-il un item qu'on aurait dû commencer mais qu'on n'a pas encore démarré ?\" Pour chaque item concerné, noter la raison en une phrase — technique, clarification manquante, personne pas disponible, autre. Le SM centralise et ne filtre pas.",
        criterion: "Au moins 2 items avec une raison documentée d'ici la fin de la semaine.",
        gate: true,
      },
      {
        label: "Étape 2 — Rétro courte sur les non-démarrages",
        timing: "ce sprint",
        description: "15 minutes en fin de sprint. Question unique : \"Quels items n'ont pas démarré comme prévu, et qu'est-ce qui les a retenus ?\" Regrouper les raisons par catégorie. Le SM propose une correction sur la catégorie la plus fréquente.",
        criterion: "Une catégorie de cause interne identifiée, avec une action corrective applicable sans escalade.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items à J+2 sans démarrage et sans raison documentée", target: "0", frequency: "Chaque sprint" },
      { metric: "Catégories de causes internes identifiées", target: "Au moins 1 nommée par sprint", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — Daily + 15 min en rétro.",
    businessPitch: {
      leadershipQuestion: "\"Combien d'items planifiés n'ont pas démarré dans les 48 premières heures du sprint — et en connaît-on la raison ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Des items planifiés ne démarrent pas pour des raisons internes que personne n'a encore nommées. Tant qu'elles restent sans nom, elles reviennent au sprint suivant et la planification reste non tenue.",
          expectedResult: "L'équipe peut corriger une cause interne sans escalade — mais il faut d'abord savoir laquelle. Nommer le blocage est la première étape pour tenir les engagements de sprint.",
        },
        time_to_market: {
          statusQuoCost: "Des items ne démarrent pas à J+2, mais personne ne sait pourquoi. Cette friction interne silencieuse ajoute des jours de latence à chaque livraison sans décision consciente.",
          expectedResult: "Identifier et catégoriser les causes de non-démarrage permet de supprimer la friction récurrente qui allonge le cycle time item par item.",
        },
      },
    },
  },
  c_dor: {
    cost: "[items générant une question au PO après démarrage] × [jours perdus en clarification] × [coût journalier développeur]",
    costHint: "Si les données manquent : compter, sur les 2 derniers sprints, combien d'items ont généré une question au PO après avoir été démarrés.",
    experiments: [
      {
        label: "Étape 1 — Ready check au Sprint Planning",
        timing: "ce sprint",
        description: "Avant d'accepter un item dans le sprint, l'équipe pose deux questions : \"Sait-on comment le faire ?\" et \"Sait-on quand on aura terminé ?\" Si l'une est \"non\", l'item reste au backlog. Le SM anime, le PO décide. Pas de négociation sur ces deux critères.",
        criterion: "Au moins 1 item renvoyé au backlog parce qu'il n'était pas prêt, sans friction avec le PO.",
        gate: true,
      },
      {
        label: "Étape 2 — Fixer 3 critères minimaux de \"prêt\"",
        timing: "sprint suivant",
        description: "En refinement, l'équipe et le PO s'accordent sur 3 conditions avant qu'un item entre dans un sprint. Pas une checklist de 15 points. Trois critères, validés en 10 minutes. Le SM documente. On teste un sprint.",
        criterion: "Moins d'items générant une question PO après démarrage qu'au sprint précédent.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items générant une question PO après démarrage", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Items renvoyés au backlog au Sprint Planning", target: "Stable ou croissant (filtre actif)", frequency: "Chaque sprint" },
    ],
    ownerNote: "PO + SM — 5 min en fin de Sprint Planning + revue en rétro.",
    businessPitch: {
      leadershipQuestion: "\"Combien de fois par sprint un développeur a dû s'arrêter parce qu'un item n'était pas suffisamment clair — et combien de jours ça a coûté ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque item qui entre en sprint sans être prêt crée une interruption en cours de route. Le développeur s'arrête, attend, relance. Ces jours perdus ne s'affichent dans aucun rapport mais rompent l'engagement de sprint.",
          expectedResult: "20 minutes de plus au refinement évitent des jours de friction par sprint. Un filtre DoR actif réduit les interruptions et stabilise la vélocité.",
        },
        time_to_market: {
          statusQuoCost: "Un item mal défini redémarre plusieurs fois : clarification, attente de réponse, reprise. Ce overhead invisible allonge le cycle time de chaque livraison.",
          expectedResult: "Des critères de \"prêt\" clairs éliminent les allers-retours post-démarrage et réduisent directement le cycle time des items concernés.",
        },
      },
    },
  },
  c2: {
    cost: "[items bloqués au démarrage] × [jours d'attente avant résolution] × [coût journalier de l'équipe]",
    costHint: "Si les données manquent : compter combien d'items du sprint en cours n'ont pas pu démarrer dans les 2 premiers jours après le lancement du sprint.",
    experiments: [
      {
        label: "Étape 1 — Tracer les dépendances",
        timing: "cette semaine",
        description: "Au prochain standup, poser une seule question : \"Qu'est-ce qu'on attend exactement, et de qui ?\" Créer un tableau simple : item bloqué, source externe, date de début du blocage. Cinq minutes, une ligne par dépendance active.",
        criterion: "Au moins deux dépendances sont tracées avec une source et une durée de blocage lisibles.",
        gate: true,
      },
      {
        label: "Étape 2 — Chiffrer l'impact",
        timing: "ce sprint",
        description: "Pour chaque dépendance tracée : multiplier les jours bloqués par le coût journalier de l'équipe. Une estimation suffit. L'objectif est d'avoir un chiffre à montrer, pas une comptabilité parfaite.",
        criterion: "Chaque dépendance active a un impact estimé en jours ou en $, prêt à présenter en réunion.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Dépendances au démarrage tracées", target: "100% des items bloqués", frequency: "Chaque sprint" },
      { metric: "Impact estimé disponible", target: "Avant la fin du sprint", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 10 min en fin de sprint, intégré au bilan ou à la rétro.",
    businessPitch: {
      leadershipQuestion: "\"On a [X] jours de capacité bloqués à chaque sprint à cause de cette dépendance. On peut en parler dans le prochain comité ?\"",
    },
  },
  c2q: {
    cost: "[items bloqués au démarrage] × [jours d'attente] × [coût journalier de l'équipe]",
    costHint: "Les données sont déjà disponibles. Utiliser les chiffres collectés au palier précédent (c2).",
    experiments: [
      {
        label: "Étape 1 — Utiliser les données en planification",
        timing: "ce sprint",
        description: "Apporter les chiffres au prochain Sprint Planning. Identifier les items à risque de dépendance externe avant qu'ils entrent dans le sprint. Définir un signal de déclenchement explicite pour chaque item dépendant : ce qui doit être vrai pour que l'item démarre. Pas de démarrage sans signal.",
        criterion: "Au moins un item à dépendance connue a un signal de déclenchement défini. L'équipe ne démarre pas cet item par défaut.",
        gate: true,
      },
      {
        label: "Étape 2 — Poser un accord de service minimal",
        timing: "sprint suivant",
        description: "Contacter l'équipe ou la personne source. Proposer trois choses : un délai de réponse maximum, un canal de contact unique, une fréquence de synchronisation. Pas un contrat formel. Juste une entente claire sur ce qu'on peut attendre et quand.",
        criterion: "L'accord existe. Le délai moyen sur les dépendances concernées baisse sur les deux sprints suivants.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Délai moyen de résolution des dépendances au démarrage", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Items démarrés sans attente non planifiée", target: "Tendance hausse", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 10 min en Sprint Planning + suivi en rétro.",
    businessPitch: {
      leadershipQuestion: "\"Cette dépendance coûte [X jours] par sprint depuis [N sprints]. On peut régler ça avec un accord entre les deux équipes. Est-ce qu'on se donne deux semaines pour tester ?\"",
    },
  },
  c_cap: {
    cost: "([travail planifié] − [travail livré]) × [coût journalier de l'équipe] × [nombre de sprints]",
    costHint: "Calculer le ratio livré/planifié sur les 5 derniers sprints. Sous 80%, sans dépendance externe ni urgence identifiée comme cause, c'est un signal de capacité insuffisante.",
    experiments: [
      {
        label: "Étape 1 — Établir la capacité réelle",
        timing: "cette semaine",
        description: "Calculer la capacité réelle de l'équipe pour le dernier sprint : jours disponibles moins congés, réunions fixes, et temps de support récurrent. Comparer au volume planifié. Si l'écart dépasse 20%, le problème n'est pas l'exécution.",
        criterion: "Un ratio capacité réelle / volume planifié existe, lisible par quelqu'un qui ne connaît pas le contexte technique.",
        gate: true,
      },
      {
        label: "Étape 2 — Présenter le cas au management",
        timing: "sprint suivant",
        description: "Apporter le ratio et le coût estimé de l'écart en réunion de planification ou en one-on-one avec le manager. Proposer deux options concrètes : réduire le volume entrant de [X%], ou définir quels sujets l'équipe arrête de traiter pour libérer de la capacité. Chiffres en main, pas une demande floue.",
        criterion: "La conversation a eu lieu. Une décision, même provisoire, est documentée.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Ratio livré/planifié", target: "≥ 80% sur 3 sprints consécutifs", frequency: "Chaque sprint" },
      { metric: "Nombre de sujets actifs simultanés par personne", target: "≤ [seuil défini avec l'équipe]", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM (collecte) + Manager direct (décision) — 15 min en revue de sprint ou one-on-one mensuel.",
    businessPitch: {
      leadershipQuestion: "\"On paie pour [X] jours de capacité par sprint et on en récupère [Y]. Est-ce qu'on ajuste ce qu'on leur donne, ou est-ce qu'on accepte que le reste ne soit pas livré ?\"",
    },
  },
  c3_ext: {
    cost: "[items bloqués en exécution] × [jours de blocage moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien d'items affichaient un bloqueur sans source nommée lors des 3 dernières Sprint Reviews.",
    experiments: [
      {
        label: "Étape 1 — Nommer le bloqueur",
        timing: "cette semaine",
        description: "15 minutes en standup étendu ou en flash rétro. Une seule question par item bloqué : \"Qu'est-ce qui empêche concrètement de fermer cet item ?\" Pour chaque item : qui est impliqué à l'extérieur de l'équipe, depuis combien de jours, et pourquoi ça n'a pas bougé.",
        criterion: "Chaque item bloqué a une source externe nommée — une équipe, un système, un rôle — et une durée documentée.",
        gate: true,
      },
      {
        label: "Étape 2 — Signaler et escalader",
        timing: "ce sprint",
        description: "Ajouter chaque dépendance externe identifiée dans le Top 5 Blockers. Pour chaque entrée : source, durée, items affectés. Partager avec le responsable de la dépendance dans les 48h.",
        criterion: "Au moins une dépendance externe a été escaladée et a reçu une réponse dans les 48h.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items bloqués sans source nommée", target: "0", frequency: "Chaque standup" },
      { metric: "Durée moyenne de blocage externe en exécution", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 5 min en standup via walk du board.",
    businessPitch: {
      leadershipQuestion: "\"Est-ce qu'on a une liste des dépendances externes qui bloquent l'équipe en ce moment — et est-ce que chacune a un responsable côté [équipe ou département concerné] ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Un item bloqué par une dépendance externe non nommée ne peut pas être résolu. Personne ne sait à qui parler. Chaque jour sans identification est un jour de sprint perdu sur un item qui semblait en cours.",
          expectedResult: "Nommer la source permet l'escalade. La capacité gelée sur cet item redevient actionnable dès que quelqu'un sait à qui s'adresser.",
        },
        time_to_market: {
          statusQuoCost: "Une dépendance externe inconnue en exécution allonge le cycle time sans que l'équipe puisse agir.",
          expectedResult: "Identifier la source ne résout pas le problème — c'est juste la seule condition pour qu'il le soit.",
        },
      },
    },
  },
  c3_int: {
    cost: "[items en cours sans mouvement] × [jours sans avancement] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter les items restés \"In Progress\" plus de [durée d'un sprint] sans mouvement lors des 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Rendre le blocage visible",
        timing: "cette semaine",
        description: "En standup : pour chaque item \"In Progress\" sans mouvement depuis [X] jours, une question — \"Qu'est-ce qui manque pour avancer ?\" Si personne ne peut répondre, l'item passe en état \"Bloqué\" sur le board avec une note de contexte.",
        criterion: "Tous les items en cours depuis plus de [X] jours ont soit une raison de blocage documentée, soit une action de déblocage assignée.",
        gate: true,
      },
      {
        label: "Étape 2 — Identifier le pattern",
        timing: "ce sprint",
        description: "En rétro ou en session dédiée de 30 minutes : regrouper les blocages internes par type — technique, connaissance manquante, clarification fonctionnelle, coordination interne. Identifier le type le plus fréquent.",
        criterion: "Au moins une catégorie de blocage interne récurrent est nommée et documentée.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items \"In Progress\" sans mouvement depuis [X] jours", target: "0", frequency: "Chaque standup" },
      { metric: "Items bloqués sans raison documentée", target: "0", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 5 min en standup via walk du board, 10 min en rétro pour le pattern.",
    businessPitch: {
      leadershipQuestion: "\"Est-ce qu'on sait combien d'items sont en cours depuis plus de [X] jours en ce moment — et est-ce qu'on connaît la raison pour chacun ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Un item \"In Progress\" sans raison de blocage identifiée est invisible pour tout le monde, y compris l'équipe. On ne peut pas débloquer ce qu'on ne voit pas. Ces items gonflent le WIP sans produire de valeur et disparaissent dans les métriques de vélocité.",
          expectedResult: "Rendre le blocage visible est la première condition pour débloquer la capacité cachée dans le WIP et tenir les engagements de sprint.",
        },
        time_to_market: {
          statusQuoCost: "Chaque jour passé \"en cours\" sans avancement allonge le cycle time sans qu'il soit possible d'intervenir.",
          expectedResult: "Rendre le blocage interne visible ne le résout pas — mais sans ça, le cycle time continue de croître sans que personne comprenne pourquoi.",
        },
      },
    },
  },
  c_anticipation: {
    cost: "[dépendances découvertes en exécution] × [jours de blocage moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien de bloqueurs soulevés pendant le sprint auraient pu être identifiés en refinement ou en Sprint Planning si la question avait été posée.",
    experiments: [
      {
        label: "Étape 1 — Poser la question en refinement",
        timing: "ce sprint",
        description: "Ajouter une question systématique pour chaque item au refinement : \"Est-ce que cet item dépend d'une autre équipe, d'un système, ou d'un expert externe ?\" Si oui, documenter la dépendance avant que l'item entre en sprint. Pas de ticket sans réponse à cette question.",
        criterion: "0 dépendance externe découverte pour la première fois en exécution lors du prochain sprint.",
        gate: true,
      },
      {
        label: "Étape 2 — Tenir un tableau de dépendances anticipées",
        timing: "sprint suivant",
        description: "Créer et maintenir un tableau simple des dépendances connues à venir : source, item concerné, date limite. Réviser en Sprint Planning et en standup hebdomadaire. Un responsable de suivi côté équipe par dépendance.",
        criterion: "Toutes les dépendances connues ont un responsable de suivi identifié avant le démarrage du sprint.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Dépendances découvertes pour la première fois en exécution", target: "0", frequency: "Chaque sprint" },
      { metric: "Dépendances anticipées et documentées avant le sprint", target: "Tendance haussière", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM + PO — 5 min en refinement, intégré comme critère dans la checklist \"prêt à démarrer\".",
    businessPitch: {
      leadershipQuestion: "\"Sur les [X] derniers sprints, combien de blocages auraient pu être identifiés avant de démarrer le sprint — et qu'est-ce qui nous a empêchés de les voir ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Une dépendance externe découverte en milieu de sprint ne peut pas être résolue dans le sprint. Elle génère du carryover prévisible. Ce n'est pas de la complexité — c'est une question oubliée au mauvais moment.",
          expectedResult: "Poser la question de la dépendance en refinement supprime ce carryover sans effort supplémentaire pendant le sprint.",
        },
        time_to_market: {
          statusQuoCost: "La découvrir en exécution coûte [X] jours de cycle time par occurrence. Poser la question de la dépendance en refinement prend 2 minutes.",
          expectedResult: "Le delta est entièrement évitable avec une checklist de 3 questions.",
        },
      },
    },
  },
  c_skill_unavailable: {
    cost: "[items bloqués sur ce skill] × [jours d'attente moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : identifier combien d'items ont attendu la disponibilité d'une même personne ou d'un même rôle lors des 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Nommer le goulot",
        timing: "cette semaine",
        description: "20 minutes avec l'équipe, board visible. Trois questions : quel skill manque, qui est la seule personne capable de le couvrir, depuis combien de sprints ce pattern se répète. Documenter les items affectés et la durée de blocage par item.",
        criterion: "Le skill manquant est nommé, la durée du blocage est tracée, les items affectés sont listés.",
        gate: true,
      },
      {
        label: "Étape 2 — Élargir le goulot",
        timing: "ce sprint",
        description: "Choisir une option selon le contexte : swarming (un membre de l'équipe travaille en binôme avec l'expert pour co-faire et apprendre), pair programming si le skill est technique, ou documentation des cas les plus fréquents si le skill est procédural. L'objectif est qu'une deuxième personne puisse couvrir les cas simples.",
        criterion: "Au moins un autre membre de l'équipe peut traiter les cas simples liés à ce skill d'ici [X] sprints.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items bloqués sur une dépendance de skill unique", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Nombre de personnes capables d'intervenir sur ce skill", target: "+1 d'ici [X] sprints", frequency: "Par sprint" },
    ],
    ownerNote: "SM — suivi via item age des items concernés en standup, bilan en rétro.",
    businessPitch: {
      leadershipQuestion: "\"Est-ce qu'on a des items qui ne peuvent avancer que si [nom ou rôle] est disponible — et si cette personne n'est pas là, qu'est-ce qui se passe ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Quand un seul expert détient un skill critique, toute indisponibilité crée un blocage prévisible. On ne peut pas tenir le sprint commitment si la seule personne capable est occupée ailleurs ou absente.",
          expectedResult: "Ce n'est pas un manque de capacité globale — c'est une dépendance concentrée sur une personne. Élargir ce skill à une deuxième personne suffit à supprimer le goulot.",
        },
        time_to_market: {
          statusQuoCost: "Un goulot de skill ralentit tout le flux en aval. L'item attend. Le cycle time augmente. Ajouter des personnes à l'équipe ne change rien si le goulot reste concentré sur un seul point de compétence.",
          expectedResult: "Transférer le skill à une deuxième personne est la seule action efficace pour réduire ce cycle time.",
        },
      },
    },
  },

  c4_dep: {
    cost: "[items bloqués en exécution par dépendance] × [jours de blocage moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter les items en \"In Progress\" avec une note \"en attente de [équipe / rôle externe]\" sur les 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Tracer les dépendances actives",
        timing: "cette semaine",
        description: "Pour chaque item bloqué en exécution : noter la source (quelle équipe, quel rôle, quel système), la date de blocage, le nombre d'items affectés. Un tableau partagé suffit. 30 minutes avec l'équipe en Daily ou en fin de sprint.",
        criterion: "Chaque dépendance active a un responsable identifié et une date de blocage connue.",
        gate: true,
      },
      {
        label: "Étape 2 — Chiffrer et poser la question",
        timing: "ce sprint",
        description: "Calculer les jours perdus par dépendance. Préparer un mini-rapport : source, items affectés, jours bloqués, coût estimé. Présenter au PO et à la strate concernée. Question à poser : \"On sait que ça coûte [X] jours par sprint. Pourquoi ce n'est pas encore résolu ?\"",
        criterion: "L'impact est chiffré pour les 3 dépendances les plus coûteuses. Au moins une a une décision ou un engagement de résolution dans les 2 semaines.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Dépendances découvertes en exécution (non anticipées)", target: "Tendance baissière sur 3 sprints", frequency: "Chaque sprint" },
      { metric: "Durée moyenne de blocage par dépendance", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Dépendances tracées avec responsable identifié", target: "100% des dépendances actives", frequency: "Chaque sprint" },
    ],
    ownerNote: "SM — 10 min intégré à la rétro ou la Sprint Review.",
    businessPitch: {
      leadershipQuestion: "\"Ces [X] jours de blocage par sprint nous coûtent [$Y]. Qu'est-ce qui empêche de résoudre ça maintenant ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque dépendance découverte en exécution consomme de la capacité de sprint sans produire de valeur. Sur [X] sprints, ça représente [Y] jours perdus — soit [Z]% de la capacité planifiée qui ne livre rien.",
          expectedResult: "Tracer et chiffrer ces dépendances, c'est la condition pour récupérer cette capacité.",
        },
        time_to_market: {
          statusQuoCost: "Une dépendance non tracée allonge le cycle time sans que personne ne prenne de décision. Chaque jour de blocage non documenté est un jour de délai que le leadership ne voit pas.",
          expectedResult: "Tracer et chiffrer chaque blocage transforme un délai invisible en coût visible — condition pour qu'une décision de résolution soit prise.",
        },
      },
    },
  },

  c4q_dep: {
    cost: "[items bloqués en exécution] × [jours de blocage moyen] × [coût journalier équipe]",
    costHint: "La donnée existe déjà : [X] items bloqués, [Y] jours perdus par sprint. Si ce calcul n'est pas formalisé : compter les items qui ont attendu une réponse externe plus de 2 jours sur les 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Accord de service avec la source",
        timing: "cette semaine",
        description: "Contacter directement l'équipe, le rôle ou le système responsable. Objectif : un accord minimal sur un canal de réponse et un délai maximum. Pas une réunion de plus : un Slack, un email, une fréquence. Documenter l'accord par écrit.",
        criterion: "Un accord de service est en place : canal de contact + délai de réponse attendu pour chaque source récurrente.",
        gate: true,
      },
      {
        label: "Étape 2 — Suivi actif jusqu'à résolution",
        timing: "sprint suivant",
        description: "Suivre chaque dépendance active jusqu'à sa résolution. Si le délai convenu n'est pas respecté : escalade immédiate au PO. Le rapport de dépendances est un outil de conversation, pas un document d'audit.",
        criterion: "Le délai moyen de résolution des dépendances actives passe sous [X] jours sur 2 sprints consécutifs.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Délai moyen de résolution des dépendances actives", target: "< [X] jours", frequency: "Chaque sprint" },
      { metric: "% d'items terminés sans blocage externe", target: "Tendance haussière sur 3 sprints", frequency: "Chaque sprint" },
      { metric: "Sources récurrentes avec accord de service", target: "100%", frequency: "Après sprint 2" },
    ],
    ownerNote: "SM — 10 min intégré à la rétro.",
    businessPitch: {
      leadershipQuestion: "\"On a chiffré le coût à [$X] par sprint. La décision est dans notre périmètre. Qu'est-ce qu'on attend ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Le coût est chiffré : [X] jours perdus par sprint, [$Y] par cycle. Ce n'est pas un problème de données. C'est un problème de décision.",
          expectedResult: "Mettre un accord de service en place avec la source ne nécessite pas de budget. C'est une conversation à avoir.",
        },
        time_to_market: {
          statusQuoCost: "Chaque dépendance non résolue ajoute directement du délai au cycle time. Les chiffres sont là. La question n'est plus \"est-ce que ça coûte quelque chose\" : c'est \"qui décide de le résoudre, et quand ?\"",
          expectedResult: "Un accord de service avec délai maximum garanti transforme chaque dépendance active en engagement daté. Le cycle time des items concernés se réduit sprint après sprint.",
        },
      },
    },
  },

  c_defects: {
    cost: "[items retournés en rework] × [jours de rework moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien d'items ont retraversé une colonne \"In Progress\" ou \"In Review\" sur les 3 derniers sprints.",
    experiments: [
      {
        label: "Étape 1 — Mesurer le rework",
        timing: "cette semaine",
        description: "Reprendre rétrospectivement les 3 derniers sprints. Identifier les items qui ont été retournés en \"In Progress\" depuis \"Done\", \"Review\" ou \"Testing\". Pour chaque item : noter la raison du retour (bug, test raté, critère d'acceptance manqué). 30 minutes avec l'équipe.",
        criterion: "Le taux de rework des 3 derniers sprints est calculé. Les 3 raisons de retour les plus fréquentes sont identifiées.",
        gate: true,
      },
      {
        label: "Étape 2 — Identifier les patterns",
        timing: "ce sprint",
        description: "Regrouper les raisons de retour par catégorie. Si la même raison revient sur 3 items ou plus : ce n'est pas un incident, c'est un signal systémique. Présenter les patterns au Tech lead. Désigner un owner pour chaque pattern prioritaire avant la prochaine rétro.",
        criterion: "Au moins un pattern récurrent a un owner désigné et une hypothèse de solution formulée.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Taux de rework (% items retournés après \"Done\")", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Délai additionnel moyen par item avec rework", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "Tech lead + SM — 10 min intégré à la rétro.",
    businessPitch: {
      leadershipQuestion: "\"Notre rework consomme [X] jours de capacité par sprint. Si on réduit ça de moitié, qu'est-ce qu'on pourrait livrer de plus ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque item qui revient en rework consomme de la capacité prévue pour du nouveau travail. Sur [X] sprints, [Y]% de la capacité a été reconsommée en corrections. C'est de la prévisibilité perdue directement, sprint après sprint.",
          expectedResult: "Identifier les patterns de rework et désigner un owner par cause réduit la reconsommation de capacité. Ce qui était perdu en correction devient disponible pour du nouveau travail.",
        },
        time_to_market: {
          statusQuoCost: "Un item avec rework prend [X] fois plus de temps qu'un item propre. Ce délai n'est pas dans les plannings. Il ne se voit pas dans la roadmap. Il s'accumule en silence.",
          expectedResult: "Réduire les causes de rework réduit directement le cycle time des items concernés, sans changer la vélocité planifiée.",
        },
      },
    },
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
  const [teamName, setTeamName] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [path, setPath] = useState([]);
  const [terminalId, setTerminalId] = useState(null);
  const [treeFocus, setTreeFocus] = useState(null);

  const currentNodeId = path.length > 0 ? path[path.length - 1].next : symptom ? symptom.entry : null;
  const currentNode = currentNodeId && symptom && !CAUSES[currentNodeId]
    ? lookupNode(symptom.tree, currentNodeId)
    : null;

  function pickSymptom(s, name) {
    setSymptom(s);
    setTreeFocus(s.tree);
    setTeamName(name || null);
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
    if (step === "plan") { setStep("result"); return; }
    if (path.length === 0) { setStep("symptom"); setSymptom(null); setTreeFocus(null); return; }
    setPath(path.slice(0, -1));
    setTerminalId(null);
    if (step === "result") setStep("diagnosis");
  }

  function showPlan() { setStep("plan"); }

  function restart() { setStep("symptom"); setTeamName(null); setSymptom(null); setPath([]); setTerminalId(null); setTreeFocus(null); }

  const tree = symptom ? TREES[symptom.tree] : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, fontSize: 15, lineHeight: 1.5, padding: "32px 16px 64px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Header />
        {step === "symptom" && <SymptomScreen onPick={pickSymptom} />}
        {step === "diagnosis" && symptom && currentNode && (
          <DiagnosisScreen symptom={symptom} tree={tree} currentNodeId={currentNodeId} currentNode={currentNode} path={path} onAnswer={answer} onBack={backOne} onRestart={restart} />
        )}
        {step === "result" && terminalId && (
          <ResultScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} path={path} onBack={backOne} onRestart={restart} onPlan={showPlan} />
        )}
        {step === "plan" && terminalId && ACTION_PLANS[terminalId] && (
          <PlanScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} teamName={teamName} path={path} onBack={backOne} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Collaboration Solved · V2.5 · rev. 8</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: C.ink }}>Team Dysfunction Diagnostic</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Flow & Livraison — Plans d'action : 5/21 implémentés</div>
    </div>
  );
}

function SymptomScreen({ onPick }) {
  const [name, setName] = useState("");
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          Nom de l'équipe <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Team Phoenix"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: FONT, fontSize: 14, color: C.ink, background: C.surface, outline: "none" }}
        />
      </div>
      <SectionTitle n="01" label="Symptôme observé" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SYMPTOMS.map((s) => (
          <button key={s.id} onClick={() => onPick(s, name.trim())}
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

function ResultScreen({ symptom, tree, treeFocus, terminalId, path, onBack, onRestart, onPlan }) {
  const cause = CAUSES[terminalId];
  const sev = severityColor(cause.severity);
  const palier = palierMeta(cause.palier);
  const focusLabel = treeFocus ? TREES[treeFocus].label : tree.label;
  const hasPlan = Boolean(ACTION_PLANS[terminalId]);
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
      <div style={{ marginTop: 24 }}>
        {hasPlan ? (
          <button onClick={onPlan} style={primaryBtn}>Voir le plan d'action →</button>
        ) : (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Plan d'action — à implémenter.</div>
        )}
      </div>
    </div>
  );
}

function PlanScreen({ symptom, tree, treeFocus, terminalId, teamName, path, onBack, onRestart }) {
  const cause = CAUSES[terminalId];
  const plan = ACTION_PLANS[terminalId];
  const sev = severityColor(cause.severity);
  const pitch = plan.businessPitch;
  const variant = treeFocus && pitch.focusVariant ? pitch.focusVariant[treeFocus] : null;

  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Retour au résultat" />

      {/* En-tête plan */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle n={String(path.length + 3).padStart(2, "0")} label="Plan d'action" nodeId={terminalId} />
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{cause.label}</div>
        {teamName && <div style={{ fontSize: 13, color: C.muted }}>Équipe : {teamName}</div>}
      </div>

      {/* Zone 1 — 2 colonnes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, alignItems: "start" }}>
        {/* Col gauche — Impact · Objectif */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>Impact · Objectif</div>

          {/* Formule coût */}
          <div style={{ background: C.hintBg, border: `1px solid ${C.hintBorder}`, borderRadius: 4, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.hintText, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Ce que ça coûte</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{plan.cost}</div>
          </div>
          {plan.costHint && (
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>{plan.costHint}</div>
          )}

          {/* Indicateurs */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Mesures de succès</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}`, paddingRight: 8 }}>Métrique</th>
                <th style={{ textAlign: "right", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}`, paddingRight: 8 }}>Cible</th>
                <th style={{ textAlign: "right", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>Fréquence</th>
              </tr>
            </thead>
            <tbody>
              {plan.indicators.map((ind, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 8px 6px 0", color: C.text, lineHeight: 1.4, borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none" }}>{ind.metric}</td>
                  <td style={{ padding: "6px 8px", color: C.ink, fontWeight: 500, textAlign: "right", borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>{ind.target}</td>
                  <td style={{ padding: "6px 0 6px 8px", color: C.muted, textAlign: "right", borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>{ind.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, fontSize: 11, color: C.muted, fontStyle: "italic" }}>{plan.ownerNote}</div>
        </div>

        {/* Col droite — Inspecter · Mesurer */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>Inspecter · Mesurer</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>
            Collecter les données dès maintenant — sans reconstituer après coup.
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
            <strong style={{ color: C.ink }}>Quoi :</strong> Pour chaque item bloqué, noter la cause, la date de début, et le responsable de résolution.
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
            <strong style={{ color: C.ink }}>Comment :</strong> Voir Étape 1 ci-dessous — le tag sur le board est la seule action requise cette semaine.
          </div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <Badge color={sev}>Sévérité : {severityLabel(cause.severity)}</Badge>
            {" "}
            <Badge color={C.borderStrong}>Propriétaire : {cause.owner}</Badge>
          </div>
        </div>
      </div>

      {/* Zone 2 — Parler business (pleine largeur) */}
      {(variant || pitch.leadershipQuestion) && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>Parler business</div>
          {variant && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Statu quo</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.statusQuoCost}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Résultat attendu</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.expectedResult}</div>
              </div>
            </div>
          )}
          {pitch.leadershipQuestion && (
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0369a1", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Question à poser au management</div>
              <div style={{ fontSize: 13, color: "#0c4a6e", lineHeight: 1.5, fontStyle: "italic" }}>{pitch.leadershipQuestion}</div>
            </div>
          )}
        </div>
      )}

      {/* Zone 3 — Adapter · Expérimenter (pleine largeur) */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>Adapter · Expérimenter</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {plan.experiments.map((exp, i) => (
            <div key={i}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{exp.label}</span>
                  <Badge color={C.muted}>{exp.timing}</Badge>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>{exp.description}</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "8px 10px" }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{exp.criterion}</span>
                </div>
              </div>
              {exp.gate && i < plan.experiments.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 11, color: C.muted }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ whiteSpace: "nowrap" }}>Lancer l'étape suivante uniquement quand celle-ci est conclue</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
const primaryBtn = { ...btnReset, border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px 20px", borderRadius: 6, letterSpacing: 0.2 };

export { CAUSES, ACTION_PLANS, SYMPTOMS, TREES, SHARED_NODES, lookupNode, severityLabel, severityColor, palierMeta, validateTrees };
