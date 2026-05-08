export const SHARED_NODES = {
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

export const PREDICTABILITY_NODES = {
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

export const TTM_NODES = {
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

export const TREES = {
  predictability: { label: "Prévisibilité", nodes: PREDICTABILITY_NODES },
  time_to_market: { label: "Time to Market", nodes: TTM_NODES },
};
