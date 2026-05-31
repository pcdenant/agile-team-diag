import { SEVERITY } from "../constants.js";

export const CAUSES = {
  // Démarrage — externe
  c1_ext: {
    label: "Blocage démarrage — dépendance externe inconnue",
    severity: SEVERITY.HIGH, owner: "SM", palier: 1,
    description: "Le démarrage est bloqué par une contrainte externe (autre équipe, input, accès) mais on ne sait pas laquelle. Première action : identifier et tracer la source du blocage.",
  },
  c2: {
    label: "Dépendance externe au démarrage — identifiée mais non quantifiée",
    severity: SEVERITY.HIGH, owner: "SM", palier: 2,
    description: "La dépendance est identifiée (équipe, skill, input) mais son impact n'est pas chiffré. Prochaine étape : quantifier en jours perdus et items bloqués.",
  },
  c2q: {
    label: "Dépendance externe au démarrage — quantifiée, décision dans le périmètre",
    severity: SEVERITY.MEDIUM, owner: "SM", palier: 2,
    description: "Cause connue et impact chiffré. La décision pour résoudre est accessible directement par le SM ou l'équipe.",
  },

  // Démarrage — interne
  c1_int: {
    label: "Blocage démarrage — cause interne inconnue",
    severity: SEVERITY.HIGH, owner: "SM", palier: 1,
    description: "Le démarrage est bloqué par quelque chose dans le périmètre de l'équipe, mais les causes n'ont pas été tracées. Première action : observer et collecter.",
  },

  // Exécution — externe, dépendance inconnue
  c3_ext: {
    label: "Blocage en exécution — dépendance externe inconnue",
    severity: SEVERITY.HIGH, owner: "SM", palier: 1,
    description: "Le travail ne peut plus avancer à cause d'une dépendance externe mais on n'a pas identifié laquelle. Première action : tracer la source du blocage.",
  },

  // Exécution — externe, dépendance connue
  c4_dep: {
    label: "Dépendance externe découverte en exécution — non quantifiée",
    severity: SEVERITY.HIGH, owner: "SM", palier: 2,
    description: "Une dépendance externe a bloqué le travail en cours d'exécution. Elle n'était pas anticipée et son impact n'est pas encore chiffré. Prochaine étape : quantifier.",
  },
  c4q_dep: {
    label: "Dépendance externe découverte en exécution — quantifiée, décision dans le périmètre",
    severity: SEVERITY.MEDIUM, owner: "SM", palier: 2,
    description: "Dépendance externe non anticipée, impact chiffré. La décision pour résoudre est dans le périmètre du SM ou de l'équipe.",
  },

  // Exécution — interne, raisons inconnues
  c3_int: {
    label: "Blocage en exécution — cause interne inconnue",
    severity: SEVERITY.HIGH, owner: "SM", palier: 1,
    description: "Le travail ne peut plus avancer pour des raisons internes non tracées (process, outil, compétence). Première action : observer et collecter.",
  },

  // Exécution — qui traîne
  c_oversize: {
    label: "Item trop gros — ne peut pas finir dans le cycle",
    severity: SEVERITY.HIGH, owner: "Équipe + PO", palier: 1,
    description: "L'item ne finit pas dans le cycle parce qu'il est structurellement trop gros : complexité sous-estimée, testing à rallonge, bugs liés à la complexité, scope plus large qu'estimé initialement. Ce n'est pas un bloqueur externe — c'est un problème de découpage. Levier : couper en tranches livrables plus petites, DoD plus stricte au démarrage.",
  },
  c_scope_creep: {
    label: "Scope créep en cours d'exécution",
    severity: SEVERITY.MEDIUM, owner: "PO + SM", palier: 1,
    description: "Le scope de l'item s'est élargi en cours de route : requis pas clairs qui se clarifient en faisant, ou stakeholder qui rajoute des exigences une fois le travail démarré. L'item ne finit pas parce qu'il grandit plus vite qu'il n'avance. Levier : freeze de scope en sprint, critères d'acceptation verrouillés avant démarrage.",
  },

  // Skill / expert
  c_skill_unavailable: {
    label: "Expert ou skill indisponible — goulot de dépendance interne",
    severity: SEVERITY.HIGH, owner: "SM", palier: 1,
    description: "Une personne spécifique est nécessaire pour débloquer le travail (expert technique, lead, reviewer désigné) et elle n'est pas disponible : surchargée, absente, ou en silo de connaissance. L'item s'accumule dans la colonne en attente de cette personne. Leviers : swarming, pair programming, réduction du WIP sur l'expert, transfer de connaissance.",
  },

  // Dépendance anticipable
  c_anticipation: {
    label: "Dépendance prévisible mal anticipée",
    severity: SEVERITY.MEDIUM, owner: "SM + PO", palier: 1,
    description: "La dépendance n'est pas une surprise : elle était identifiable au refinement ou au Sprint Planning mais n'a pas été adressée à temps. Cause-racine : pratiques d'anticipation manquantes (refinement insuffisant, dependency mapping absent, contact tardif avec l'équipe amont). Distinct d'une vraie découverte en cours — le timing est raté, pas l'identification.",
  },

  // Infrastructure / process
  c_tech: {
    label: "Blocage technique — système, environnement ou outil indisponible",
    severity: SEVERITY.HIGH, owner: "Équipe + Ops/Infra", palier: 1,
    description: "Le travail est bloqué par un système, pas par une décision humaine : environnement de dev cassé, accès manquants, outil indisponible, infra fragile, droits non provisionnés. Souvent traité comme du bruit ambiant alors que c'est mesurable et adressable.",
  },
  c_gate: {
    label: "Process interne créant un goulot",
    severity: SEVERITY.MEDIUM, owner: "SM + Process owner", palier: 1,
    description: "Un process interne ralentit ou bloque l'avancement : code review concentrée sur une seule personne, validation sécurité, change advisory board, signature obligatoire d'un manager. L'item est prêt, c'est le process qui freine. Cause souvent invisible car perçue comme 'la façon de travailler ici'.",
  },

  // DoR
  c_dor: {
    label: "Items non prêts au démarrage — DoR failure",
    severity: SEVERITY.MEDIUM, owner: "PO + SM", palier: 1,
    description: "Le mécanisme de tirage fonctionne, la priorité est claire, mais quand on tente de démarrer l'item prioritaire on découvre des prérequis manquants : clarification absente, dépendance non résolue, critères flous. L'item retourne au backlog.",
  },

  // WIP / capacité
  c_wip: {
    label: "WIP excessif — capacité fragmentée par multitâche",
    severity: SEVERITY.HIGH, owner: "Équipe + SM", palier: 1,
    description: "La capacité existe mais elle est fragmentée par 4–6 items en parallèle par personne. Le context-switching consomme 20–40% de la capacité productive. Inclut le shadow work (support, escalades, side-quests non visibles sur le board). Décision interne à l'équipe.",
  },
  c_cap: {
    label: "Capacité réelle insuffisante",
    severity: SEVERITY.HIGH, owner: "Leadership", palier: 1,
    description: "La concentration existe, les items finissent dans leurs estimations unitaires, mais le scope dépasse structurellement les heures disponibles. Décision de scope (PO) ou de capacité (leadership).",
  },

  // Prioritisation
  c_urgency_misalign: {
    label: "Désaccord sur l'urgence — stratégie claire, arbitrages locaux divergents",
    severity: SEVERITY.MEDIUM, owner: "PO + Leadership", palier: 1,
    description: "La stratégie organisationnelle est claire, mais les équipes et parties prenantes l'interprètent différemment quand il faut arbitrer. Du NEW work prend la priorité non parce qu'il est plus stratégique, mais parce qu'il est porté par une voix plus forte.",
  },
  c_strategy_vague: {
    label: "Stratégie trop vague — pas d'arbitrage local possible",
    severity: SEVERITY.HIGH, owner: "Leadership", palier: 1,
    description: "La stratégie elle-même n'est pas suffisamment claire pour arbitrer localement entre deux demandes concurrentes. L'urgence est déléguée par défaut à 'qui crie le plus fort'. Construction d'une échelle d'urgence partagée requise au niveau organisationnel.",
  },

  // Palier 3
  c_org: {
    label: "Blocage organisationnel — données complètes, décision manquante",
    severity: SEVERITY.HIGH, owner: "Leadership", palier: 3,
    description: "Les données existent. La cause est identifiée, l'impact chiffré. Le blocage n'est plus technique ou informationnel — il est décisionnel. Une décision appartenant à une strate au-dessus de l'équipe n'est pas prise.",
  },

  // Sorties spéciales
  exit_observe: {
    label: "Observation requise avant diagnostic",
    severity: SEVERITY.LOW, owner: "SM", palier: 0,
    description: "Tu n'as pas assez d'observation directe pour répondre. Retourne sur le terrain, observe le board, parle à 2–3 membres de l'équipe sur des items concrets. Reviens ensuite.",
  },

  // Qualité — dans le scope Flow
  c_defects: {
    label: "Défauts récurrents — la qualité interne freine le flux",
    severity: SEVERITY.HIGH, owner: "Équipe + Tech lead", palier: 1,
    description: "Des défauts récurrents ou du rework ralentissent ou bloquent l'avancement. Ce n'est pas une dépendance externe, ni un process — c'est la qualité interne du travail produit qui crée le frein. Les items reviennent en arrière, s'accumulent en correction, ou bloquent la finition par cycles. Action immédiate : tracer les items qui reviennent, le nombre de cycles de correction, et la durée moyenne de rework sur les 2 prochains sprints.",
  },
};
