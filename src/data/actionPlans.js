export const ACTION_PLANS = {
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
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque sprint démarre avec des items qui ne peuvent pas avancer parce qu'une dépendance externe n'est ni tracée ni chiffrée. La capacité planifiée est consommée en attente invisible : [X] jours perdus par sprint, sans que le coût apparaisse dans aucun rapport.",
          expectedResult: "Tracer et chiffrer ces dépendances au démarrage convertit une perte invisible en coût connu — première condition pour récupérer cette capacité sprint après sprint.",
        },
        time_to_market: {
          statusQuoCost: "Les items prioritaires n'arrivent pas à démarrer à cause d'une dépendance externe non tracée. Chaque jour d'attente sans décision de résolution s'ajoute directement au cycle time — sans que personne dans l'organisation ne voie le coût réel.",
          expectedResult: "Nommer et chiffrer la dépendance transforme un délai subi en coût visible. C'est la condition pour que la résolution devienne une décision prioritaire plutôt qu'un problème ignoré.",
        },
      },
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
      focusVariant: {
        predictability: {
          statusQuoCost: "L'impact est chiffré : [X] jours de capacité perdus par sprint depuis [N] sprints. Le blocage au démarrage se répète à chaque cycle. Le sprint commitment ne peut pas tenir si une dépendance connue et coûteuse reste sans résolution dans le périmètre disponible.",
          expectedResult: "La décision est dans votre périmètre. Intégrer cette dépendance dans le Sprint Planning et poser un accord de service minimal réduit directement le blocage récurrent — et restaure la capacité planifiée.",
        },
        time_to_market: {
          statusQuoCost: "Cette dépendance au démarrage est quantifiée : [X] jours d'attente par cycle, [Y] items affectés. Chaque sprint qui repart sans décision est un sprint de plus à absorber ce délai en entrée de flux.",
          expectedResult: "Un accord de service avec la source réduit le délai d'attente au démarrage. Ce qui était du temps perdu avant chaque item devient du temps récupéré sur le cycle time global.",
        },
      },
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

  c_urgency_misalign: {
    cost: "[items interrompus en sprint] × [jours de replanification] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien de fois dans les 3 derniers sprints un item planifié a été abandonné en cours de sprint au profit d'un autre jugé plus urgent par quelqu'un d'autre.",
    experiments: [
      {
        label: "Étape 1 — Cartographier le désaccord",
        timing: "cette semaine",
        description: "30 minutes en rétro avec le PO et un représentant du leadership. Question unique : \"Sur les [X] derniers sprints, quel travail a sauté la file — et qui a décidé que c'était prioritaire ?\" Un post-it par interruption. Pour chaque cas : qui a décidé, selon quelle information, au nom de quoi.",
        criterion: "Au moins 3 cas documentés avec une décision d'urgence clairement attribuée à une personne ou une instance.",
        gate: true,
      },
      {
        label: "Étape 2 — Créer une échelle d'urgence commune",
        timing: "sprint suivant",
        description: "Avec le PO et un représentant du leadership : définir 3 niveaux d'urgence maximum, avec un exemple concret pour chacun. Chaque niveau répond à \"si ça arrive, l'équipe fait quoi ?\" Afficher l'échelle là où l'équipe travaille. Pendant le sprint suivant, chaque item qui interrompt le plan est tagué avec le niveau correspondant avant d'entrer.",
        criterion: "Chaque interruption du sprint suivant est justifiée par un niveau d'urgence connu de l'équipe avant le début du sprint.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items interrompus en cours de sprint", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Taux de complétion du commitment sprint", target: "Tendance haussière", frequency: "Chaque sprint" },
    ],
    ownerNote: "PO + SM — 10 min en fin de sprint, intégré à la rétro.",
    businessPitch: {
      leadershipQuestion: "\"Sur les [X] derniers sprints, combien d'interruptions ont eu lieu sans décision explicite de votre part — et combien ça a coûté ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque interruption non justifiée coûte à l'équipe au minimum [X] jours de replanification par sprint. Le sprint finit moins rempli que prévu, et personne ne comprend pourquoi le commitment n'est pas tenu.",
          expectedResult: "Une échelle d'urgence commune réduit les interruptions arbitraires et stabilise la prévisibilité.",
        },
        time_to_market: {
          statusQuoCost: "Le travail prioritaire ne sort pas plus vite parce qu'il entre en compétition avec d'autres travaux \"urgents\" décidés localement. Sans critère commun, tout est urgent — donc rien ne passe vraiment avant le reste.",
          expectedResult: "Un niveau d'urgence partagé permet au travail prioritaire d'avancer sans attendre un arbitrage.",
        },
      },
    },
  },

  c_strategy_vague: {
    cost: "[décisions mal alignées] × [jours de rework ou repriorisation] × [coût journalier équipe]",
    costHint: "Si les données manquent : compter combien d'items livrés ce trimestre ont été modifiés ou abandonnés après livraison parce qu'ils ne correspondaient pas à ce que le business attendait vraiment.",
    experiments: [
      {
        label: "Étape 1 — Rendre le désalignement visible",
        timing: "cette semaine",
        description: "En rétro ou en session dédiée de 30 minutes : demander à chaque membre de l'équipe d'écrire en une phrase \"ce que l'équipe est censée prioriser en ce moment\". Comparer les réponses. Si elles divergent, le problème est structurel, pas une question d'écoute.",
        criterion: "Les réponses divergent sur au moins un point stratégique clé. Le résultat est documenté et présenté au leadership comme fait, pas comme opinion.",
        gate: true,
      },
      {
        label: "Étape 2 — Obtenir 3 critères d'arbitrage concrets",
        timing: "sprint suivant",
        description: "Avec le leadership : demander 3 critères qui permettent à l'équipe de trancher localement entre deux options sans escalade. Pas de valeurs génériques — des critères qui répondent à \"si on doit choisir entre X et Y, qu'est-ce qui prime ?\" Afficher ces critères là où l'équipe travaille.",
        criterion: "Sur le sprint suivant, au moins une décision de priorisation est prise par l'équipe sans escalade, en référençant ces critères.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Escalades de décision de priorisation", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Items modifiés ou abandonnés après livraison", target: "Tendance baissière", frequency: "Chaque sprint" },
    ],
    ownerNote: "PO + SM — 10 min en fin de sprint, intégré à la Sprint Review ou la rétro.",
    businessPitch: {
      leadershipQuestion: "\"Si l'équipe doit choisir entre livrer [fonctionnalité A] ou [fonctionnalité B] cette semaine — quelle est la bonne réponse, et est-ce qu'ils peuvent prendre cette décision sans vous appeler ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Sans critères d'arbitrage clairs, chaque décision de priorisation remonte. L'équipe attend. Le sprint perd du rythme. Et le commitment tenu dépend de la disponibilité du management, pas de la capacité de l'équipe.",
          expectedResult: "Trois critères concrets réduisent les escalades et stabilisent la vitesse de décision.",
        },
        time_to_market: {
          statusQuoCost: "Une stratégie trop vague rallonge le cycle time sans que personne ne s'en rende compte : le travail attend des arbitrages qui n'arrivent pas. Chaque jour d'attente décisionnelle est un jour de plus dans le lead time.",
          expectedResult: "Des critères explicites permettent à l'équipe d'avancer sans suspendre le flux.",
        },
      },
    },
  },

  c_org: {
    cost: "[items bloqués en attente de décision] × [jours de blocage moyen] × [coût journalier équipe]",
    costHint: "Si les données manquent : comptabiliser les items en statut \"bloqué\" depuis plus de 5 jours dans les 3 derniers sprints. Chaque item en attente d'une décision hors du périmètre de l'équipe compte.",
    experiments: [
      {
        label: "Étape 1 — Poser le coût sur la table",
        timing: "cette semaine",
        description: "Préparer un résumé d'une page : [X] items bloqués en attente d'une décision, [Y] jours d'attente cumulés, [Z] jours d'équipe mobilisés sans livraison. Formulé comme un problème business, pas comme une plainte d'équipe. Présenter au PO. Demander l'accès au bon décideur.",
        criterion: "Un rendez-vous avec le décideur est posé dans les 5 jours ouvrés suivants.",
        gate: true,
      },
      {
        label: "Étape 2 — Présenter le choix, pas le problème",
        timing: "dans la semaine suivant l'étape 1",
        description: "En réunion avec le décideur : présenter les données, puis deux ou trois options avec leur coût respectif, y compris le coût de ne rien décider. Ne pas demander une solution. Demander un choix. Attendre la réponse sans combler le silence.",
        criterion: "Le décideur exprime une position explicite : \"on fait X\", \"on ne fait pas Y\", ou \"j'ai besoin de [information précise] avant de décider\".",
        gate: true,
      },
      {
        label: "Étape 3 — Fixer une date de décision",
        timing: "sprint suivant",
        description: "Si la décision est encore suspendue : proposer une date courte, moins de 7 jours, pour une réponse finale. Au-delà, l'équipe applique l'option par défaut — à définir avec le PO maintenant, avant la réunion. L'objectif est de sortir de l'attente passive.",
        criterion: "La décision est prise avant la date fixée, ou l'option par défaut est activée et documentée.",
        gate: false,
      },
    ],
    indicators: [
      { metric: "Items bloqués en attente de décision hors périmètre", target: "≤ 1 en simultané", frequency: "Chaque sprint" },
      { metric: "Durée moyenne de blocage palier 3", target: "Tendance baissière", frequency: "Chaque sprint" },
      { metric: "Décisions obtenues dans les 7 jours suivant l'escalade", target: "≥ 80%", frequency: "Trimestriel" },
    ],
    ownerNote: "SM + PO — 10 min en Sprint Review, présenté comme indicateur de santé système au leadership.",
    businessPitch: {
      leadershipQuestion: "\"Ces [X] items sont bloqués depuis [Y] jours en attente d'une décision. Chaque semaine qui passe coûte [Z]. Est-ce un coût que vous assumez consciemment ?\"",
      focusVariant: {
        predictability: {
          statusQuoCost: "Chaque décision non prise est un item qui ne sort pas. Le sprint est tenu ou non selon la disponibilité décisionnelle du management, pas la capacité de l'équipe.",
          expectedResult: "Rendre les décisions attendues visibles et les traiter comme des engagements réduit directement le nombre d'items qui ne finissent pas.",
        },
        time_to_market: {
          statusQuoCost: "Un blocage palier 3 est le lead time le plus coûteux : l'item est fait, les données sont là, et le travail attend quand même. Chaque jour ici est du temps client perdu sur de la valeur déjà produite.",
          expectedResult: "Un SLA décisionnel clair réduit ce temps d'attente sans toucher à la capacité de l'équipe.",
        },
      },
    },
  },
};
