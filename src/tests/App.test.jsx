import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "../App.jsx";

// Chemins de réponses pour atteindre c_tech et c_gate via s4 (TTM, finish_state)
// s4 → finish_state → finish_blocked_nature → p_internal_nature_finish → c_tech|c_gate
async function navigateTo_s4_finish_blocked_internal(user) {
  await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
  await user.click(screen.getByRole("button", { name: /Bloqué — hard stop/ }));
  await user.click(screen.getByRole("button", { name: /Intérieur — quelque chose dans notre périmètre/ }));
}

// Chemin s1 (Predictability) → p_internal_nature_start → c_tech
// s1 → p_observe → p_blocked_nature → p_internal_nature_start → c_tech
async function navigateTo_s1_internal(user) {
  await user.click(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ }));
  await user.click(screen.getByRole("button", { name: /Le travail planifié n'a pas avancé/ }));
  await user.click(screen.getByRole("button", { name: /Intérieur — quelque chose dans notre périmètre/ }));
}

// --- SymptomScreen -----------------------------------------------------------

describe("SymptomScreen (étape initiale)", () => {
  it("affiche les 4 symptômes au chargement", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Les dates de livraison sont imprévisibles/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Beaucoup de travail attend en file/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ })).toBeInTheDocument();
  });

  it("affiche le champ nom d'équipe optionnel", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Team Phoenix/i)).toBeInTheDocument();
  });
});

// --- DiagnosisScreen ---------------------------------------------------------

describe("DiagnosisScreen (navigation)", () => {
  it("s4 → affiche la première question de finish_state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
    expect(screen.getByText(/Ce travail est-il bloqué/)).toBeInTheDocument();
  });

  it("s1 → affiche la question d'observation du board", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ }));
    expect(screen.getByText(/Observe ton board/)).toBeInTheDocument();
  });

  it("le bouton ← retourne à SymptomScreen depuis la première question", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
    await user.click(screen.getByRole("button", { name: /← Symptôme/ }));
    expect(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ })).toBeInTheDocument();
  });

  it("← Précédent annule la dernière réponse", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
    await user.click(screen.getByRole("button", { name: /Bloqué — hard stop/ }));
    // On est maintenant sur finish_blocked_nature
    expect(screen.getByText(/Ce blocage vient-il de l'extérieur/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /← Précédent/ }));
    // On revient sur finish_state
    expect(screen.getByText(/Ce travail est-il bloqué/)).toBeInTheDocument();
  });
});

// --- ResultScreen + bouton CTA ----------------------------------------------

describe("ResultScreen — c_tech via s4 (TTM)", () => {
  it("affiche la cause c_tech et le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));

    expect(screen.getByText(/Blocage technique — système, environnement ou outil indisponible/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });

  it("affiche les badges sévérité, palier, propriétaire et focus arbre", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));

    expect(screen.getByText(/Sévérité : Critique/)).toBeInTheDocument();
    expect(screen.getByText(/Palier 1/)).toBeInTheDocument();
    expect(screen.getByText(/Équipe \+ Ops\/Infra/)).toBeInTheDocument();
  });
});

describe("ResultScreen — cause sans plan (exit_observe)", () => {
  it("n'affiche PAS le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
    await user.click(screen.getByRole("button", { name: /Je ne sais pas/ }));

    expect(screen.queryByRole("button", { name: /Voir le plan d'action/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Plan d'action — à implémenter\./)).toBeInTheDocument();
  });
});

// --- PlanScreen — c_tech via s4 (TTM / time_to_market) ----------------------

describe("PlanScreen — c_tech (focus time_to_market)", () => {
  async function goToPlanScreen_c_tech_ttm(user) {
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les 3 zones du plan", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText("Impact · Objectif")).toBeInTheDocument();
    expect(screen.getByText("Inspecter · Mesurer")).toBeInTheDocument();
    expect(screen.getByText("Adapter · Expérimenter")).toBeInTheDocument();
    expect(screen.getByText("Parler business")).toBeInTheDocument();
  });

  it("affiche la formule coût c_tech", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText(/items bloqués pour raison technique/)).toBeInTheDocument();
  });

  it("affiche les 2 étapes séquentielles avec le gate", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText(/Étape 1 — Rendre le blocage traçable/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Slot de résolution fixe/)).toBeInTheDocument();
    expect(screen.getByText(/Lancer l'étape suivante uniquement/)).toBeInTheDocument();
  });

  it("affiche les critères de succès (✓) des étapes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText(/au moins un blocage tech est tracé/)).toBeInTheDocument();
    expect(screen.getByText(/durée moyenne d'un blocage technique baisse/)).toBeInTheDocument();
  });

  it("affiche les indicateurs avec leurs cibles", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText(/Items bloqués pour raison technique en fin de sprint/)).toBeInTheDocument();
    expect(screen.getByText(/Durée moyenne d'un blocage technique/)).toBeInTheDocument();
  });

  it("affiche la variante time_to_market dans le businessPitch", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    // Contenu spécifique TTM
    expect(screen.getByText(/attend en moyenne \[X\] jours avant que quelqu'un prenne la main/)).toBeInTheDocument();
    expect(screen.getByText(/réduit ce délai directement sur le cycle time/)).toBeInTheDocument();
  });

  it("affiche la leadershipQuestion de c_tech", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_tech_ttm(user);

    expect(screen.getByText(/Combien de jours-équipe perdons-nous par sprint/)).toBeInTheDocument();
  });
});

// --- PlanScreen — c_tech via s1 (Predictability) ----------------------------

describe("PlanScreen — c_tech (focus predictability)", () => {
  it("affiche la variante predictability dans le businessPitch", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_s1_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas \(accès/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));

    // Contenu spécifique Predictability
    expect(screen.getByText(/capacité planifiée par sprint/)).toBeInTheDocument();
    expect(screen.getByText(/réduit le nombre de sprints non tenus/)).toBeInTheDocument();
  });
});

// --- PlanScreen — c_gate -----------------------------------------------------

describe("PlanScreen — c_gate via s4 (TTM)", () => {
  it("affiche le plan c_gate avec ses étapes et indicateurs spécifiques", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un process interne crée un goulot/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));

    expect(screen.getByText(/Étape 1 — Nommer le gate/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Slot fixe sur le gate principal/)).toBeInTheDocument();
    expect(screen.getByText(/Items en attente au gate en fin de sprint/)).toBeInTheDocument();
    expect(screen.getByText(/≤ 2/)).toBeInTheDocument();
    expect(screen.getByText(/niveau de contrôle vaut ce qu'il coûte/)).toBeInTheDocument();
  });
});

// --- Navigation depuis PlanScreen --------------------------------------------

describe("Navigation depuis PlanScreen", () => {
  async function goToPlanScreen(user) {
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("← Retour au résultat ramène sur ResultScreen", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen(user);

    await user.click(screen.getByRole("button", { name: /← Retour au résultat/ }));

    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
    expect(screen.queryByText("Impact · Objectif")).not.toBeInTheDocument();
  });

  it("↻ Recommencer depuis PlanScreen retourne à SymptomScreen", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen(user);

    await user.click(screen.getByRole("button", { name: /↻ Recommencer/ }));

    expect(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ })).toBeInTheDocument();
    expect(screen.queryByText("Impact · Objectif")).not.toBeInTheDocument();
  });
});

// --- ResultScreen + PlanScreen — c2, c2q, c_cap (Predictability) -----------
//
// Chemin c2:
//   s1 → p_observe(planifié n'a pas avancé) → p_blocked_nature(Extérieur) →
//   p_could_start(Non, démarrage bloqué) → p_know_capacity(Oui, identifiée) →
//   p_anticipable(Non, imprévisible) → p_quantify_dep(Non, pas chiffré) → c2
//
// Chemin c2q:
//   …même chemin jusqu'à p_quantify_dep → (Oui, chiffré) →
//   p_decision_owner_start(L'équipe peut agir) → c2q
//
// Chemin c_cap:
//   s1 → p_observe(autre travail s'est invité) → p_other_type(NEW work) →
//   p_new_urgent(Non, pris sans arbitrage) → p_capacity_split(Non, volume dépasse) → c_cap

async function navigateTo_p_quantify_dep(user) {
  await user.click(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ }));
  await user.click(screen.getByRole("button", { name: /Le travail planifié n'a pas avancé/ }));
  await user.click(screen.getByRole("button", { name: /Extérieur — autre équipe ou dépendance externe/ }));
  await user.click(screen.getByRole("button", { name: /Non — le démarrage lui-même est bloqué/ }));
  await user.click(screen.getByRole("button", { name: /Oui, la source est identifiée et tracée/ }));
  await user.click(screen.getByRole("button", { name: /Non — découverte en cours, imprévisible/ }));
}

async function navigateTo_c_cap(user) {
  await user.click(screen.getByRole("button", { name: /Le sprint commitment n'est pas tenu/ }));
  await user.click(screen.getByRole("button", { name: /D'autre travail s'est invité/ }));
  await user.click(screen.getByRole("button", { name: /Du NEW work qui s'est invité/ }));
  await user.click(screen.getByRole("button", { name: /Non, pris sans vrai arbitrage/ }));
  await user.click(screen.getByRole("button", { name: /Non — concentration bonne par item/ }));
}

describe("ResultScreen — c2 (Predictability)", () => {
  it("affiche la cause c2 avec le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_p_quantify_dep(user);
    await user.click(screen.getByRole("button", { name: /Non, l'impact n'est pas encore chiffré/ }));

    expect(screen.getByText(/Dépendance externe au démarrage — identifiée mais non quantifiée/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });
});

describe("ResultScreen — c2q (Predictability)", () => {
  it("affiche la cause c2q avec le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_p_quantify_dep(user);
    await user.click(screen.getByRole("button", { name: /Oui, l'impact est chiffré/ }));
    await user.click(screen.getByRole("button", { name: /L'équipe ou moi peut agir/ }));

    expect(screen.getByText(/Dépendance externe au démarrage — quantifiée, décision dans le périmètre/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });
});

describe("ResultScreen — c_cap (Predictability)", () => {
  it("affiche la cause c_cap avec le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c_cap(user);

    expect(screen.getByText(/Capacité réelle insuffisante/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });
});

describe("PlanScreen — c2 (sans focusVariant)", () => {
  async function goToPlanScreen_c2(user) {
    await navigateTo_p_quantify_dep(user);
    await user.click(screen.getByRole("button", { name: /Non, l'impact n'est pas encore chiffré/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les 4 zones du plan", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c2(user);

    expect(screen.getByText("Impact · Objectif")).toBeInTheDocument();
    expect(screen.getByText("Inspecter · Mesurer")).toBeInTheDocument();
    expect(screen.getByText("Adapter · Expérimenter")).toBeInTheDocument();
    expect(screen.getByText("Parler business")).toBeInTheDocument();
  });

  it("affiche la formule coût c2", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c2(user);

    expect(screen.getByText(/items bloqués au démarrage/)).toBeInTheDocument();
  });

  it("affiche les 2 étapes avec le gate", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c2(user);

    expect(screen.getByText(/Étape 1 — Tracer les dépendances/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Chiffrer l'impact/)).toBeInTheDocument();
    expect(screen.getByText(/Lancer l'étape suivante uniquement/)).toBeInTheDocument();
  });

  it("affiche la leadershipQuestion et pas de section Statu quo", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c2(user);

    expect(screen.getByText(/jours de capacité bloqués à chaque sprint/)).toBeInTheDocument();
    expect(screen.queryByText(/Statu quo/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Résultat attendu/)).not.toBeInTheDocument();
  });
});

describe("PlanScreen — c2q (sans focusVariant)", () => {
  async function goToPlanScreen_c2q(user) {
    await navigateTo_p_quantify_dep(user);
    await user.click(screen.getByRole("button", { name: /Oui, l'impact est chiffré/ }));
    await user.click(screen.getByRole("button", { name: /L'équipe ou moi peut agir/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les étapes c2q et la leadershipQuestion sans focusVariant", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c2q(user);

    expect(screen.getByText(/Étape 1 — Utiliser les données en planification/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Poser un accord de service minimal/)).toBeInTheDocument();
    expect(screen.getByText(/accord entre les deux équipes/)).toBeInTheDocument();
    expect(screen.queryByText(/Statu quo/)).not.toBeInTheDocument();
  });
});

describe("PlanScreen — c_cap (sans focusVariant)", () => {
  async function goToPlanScreen_c_cap(user) {
    await navigateTo_c_cap(user);
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les étapes c_cap et la leadershipQuestion sans focusVariant", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_cap(user);

    expect(screen.getByText(/Étape 1 — Établir la capacité réelle/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Présenter le cas au management/)).toBeInTheDocument();
    expect(screen.getByText(/on en récupère \[Y\]/)).toBeInTheDocument();
    expect(screen.queryByText(/Statu quo/)).not.toBeInTheDocument();
  });

  it("affiche le badge palier 1 pour c_cap", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c_cap(user);

    expect(screen.getByText(/Palier 1/)).toBeInTheDocument();
  });
});

// --- ResultScreen + PlanScreen — c4_dep · c4q_dep · c_defects (Cluster 6) ---
//
// Chemin c4_dep :
//   s4 → finish_state(Bloqué) → finish_blocked_nature(Extérieur) →
//   finish_ext_type(dépendance équipe) → finish_dep_anticipable(Non, découverte) →
//   finish_dep_quantify(Non, pas chiffré) → c4_dep
//
// Chemin c4q_dep :
//   …même chemin jusqu'à finish_dep_quantify → (Oui, chiffré) →
//   finish_dep_decision(L'équipe peut agir) → c4q_dep
//
// Chemin c_defects :
//   s4 → finish_state(Bloqué) → finish_blocked_nature(Intérieur) →
//   p_internal_nature_finish(Défauts récurrents font traîner) → c_defects

async function navigateTo_finish_dep_anticipable(user) {
  await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
  await user.click(screen.getByRole("button", { name: /Bloqué — hard stop/ }));
  await user.click(screen.getByRole("button", { name: /Extérieur — autre équipe, dépendance ou expert inaccessible/ }));
  await user.click(screen.getByRole("button", { name: /Une dépendance équipe ou un input externe manquant/ }));
}

async function navigateTo_c4_dep(user) {
  await navigateTo_finish_dep_anticipable(user);
  await user.click(screen.getByRole("button", { name: /Non — découverte en cours d'exécution/ }));
}

async function navigateTo_c4q_dep(user) {
  await navigateTo_c4_dep(user);
  await user.click(screen.getByRole("button", { name: /Oui, l'impact est chiffré/ }));
}

async function navigateTo_c_defects(user) {
  await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
  await user.click(screen.getByRole("button", { name: /Bloqué — hard stop/ }));
  await user.click(screen.getByRole("button", { name: /Intérieur — quelque chose dans notre périmètre/ }));
}

describe("ResultScreen — c4_dep (TTM)", () => {
  it("affiche la cause c4_dep et le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c4_dep(user);
    await user.click(screen.getByRole("button", { name: /Non, l'impact n'est pas encore chiffré/ }));

    expect(screen.getByText(/Dépendance externe découverte en exécution — non quantifiée/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });

  it("affiche le badge Palier 2", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c4_dep(user);
    await user.click(screen.getByRole("button", { name: /Non, l'impact n'est pas encore chiffré/ }));

    expect(screen.getByText(/Palier 2/)).toBeInTheDocument();
  });
});

describe("ResultScreen — c4q_dep (TTM)", () => {
  it("affiche la cause c4q_dep et le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c4q_dep(user);
    await user.click(screen.getByRole("button", { name: /L'équipe ou moi peut agir — on n'a pas encore priorisé/ }));

    expect(screen.getByText(/Dépendance externe découverte en exécution — quantifiée, décision dans le périmètre/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });
});

describe("ResultScreen — c_defects (TTM)", () => {
  it("affiche la cause c_defects et le bouton plan d'action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c_defects(user);
    await user.click(screen.getByRole("button", { name: /Des défauts récurrents font traîner/ }));

    expect(screen.getByText(/Défauts récurrents — la qualité interne freine le flux/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voir le plan d'action →/ })).toBeInTheDocument();
  });

  it("affiche le badge Palier 1", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo_c_defects(user);
    await user.click(screen.getByRole("button", { name: /Des défauts récurrents font traîner/ }));

    expect(screen.getByText(/Palier 1/)).toBeInTheDocument();
  });
});

describe("PlanScreen — c4_dep (focus time_to_market)", () => {
  async function goToPlanScreen_c4_dep(user) {
    await navigateTo_c4_dep(user);
    await user.click(screen.getByRole("button", { name: /Non, l'impact n'est pas encore chiffré/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les 4 zones du plan", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText("Impact · Objectif")).toBeInTheDocument();
    expect(screen.getByText("Inspecter · Mesurer")).toBeInTheDocument();
    expect(screen.getByText("Adapter · Expérimenter")).toBeInTheDocument();
    expect(screen.getByText("Parler business")).toBeInTheDocument();
  });

  it("affiche la formule coût c4_dep", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText(/items bloqués en exécution par dépendance/)).toBeInTheDocument();
  });

  it("affiche les 2 étapes séquentielles avec le gate", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText(/Étape 1 — Tracer les dépendances actives/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Chiffrer et poser la question/)).toBeInTheDocument();
    expect(screen.getByText(/Lancer l'étape suivante uniquement/)).toBeInTheDocument();
  });

  it("affiche les indicateurs", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText(/Dépendances tracées avec responsable identifié/)).toBeInTheDocument();
  });

  it("affiche la variante time_to_market dans le businessPitch", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText(/délai invisible en coût visible/)).toBeInTheDocument();
  });

  it("affiche la leadershipQuestion de c4_dep", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4_dep(user);

    expect(screen.getByText(/Ces \[X\] jours de blocage par sprint nous coûtent/)).toBeInTheDocument();
  });
});

describe("PlanScreen — c4q_dep (focus time_to_market)", () => {
  async function goToPlanScreen_c4q_dep(user) {
    await navigateTo_c4q_dep(user);
    await user.click(screen.getByRole("button", { name: /L'équipe ou moi peut agir — on n'a pas encore priorisé/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les 2 étapes avec le gate", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4q_dep(user);

    expect(screen.getByText(/Étape 1 — Accord de service avec la source/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Suivi actif jusqu'à résolution/)).toBeInTheDocument();
    expect(screen.getByText(/Lancer l'étape suivante uniquement/)).toBeInTheDocument();
  });

  it("affiche l'indicateur délai moyen de résolution", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4q_dep(user);

    expect(screen.getByText(/Délai moyen de résolution des dépendances actives/)).toBeInTheDocument();
  });

  it("affiche la variante time_to_market dans le businessPitch", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4q_dep(user);

    expect(screen.getByText(/engagement daté/)).toBeInTheDocument();
  });

  it("affiche la leadershipQuestion de c4q_dep", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c4q_dep(user);

    expect(screen.getByText(/La décision est dans notre périmètre/)).toBeInTheDocument();
  });
});

describe("PlanScreen — c_defects (focus time_to_market)", () => {
  async function goToPlanScreen_c_defects(user) {
    await navigateTo_c_defects(user);
    await user.click(screen.getByRole("button", { name: /Des défauts récurrents font traîner/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));
  }

  it("affiche les 2 étapes séquentielles avec le gate", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_defects(user);

    expect(screen.getByText(/Étape 1 — Mesurer le rework/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2 — Identifier les patterns/)).toBeInTheDocument();
    expect(screen.getByText(/Lancer l'étape suivante uniquement/)).toBeInTheDocument();
  });

  it("affiche l'indicateur taux de rework", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_defects(user);

    expect(screen.getByText(/Taux de rework/)).toBeInTheDocument();
  });

  it("affiche la variante time_to_market dans le businessPitch", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_defects(user);

    expect(screen.getByText(/cycle time des items concernés/)).toBeInTheDocument();
  });

  it("affiche la leadershipQuestion de c_defects", async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToPlanScreen_c_defects(user);

    expect(screen.getByText(/rework consomme \[X\] jours de capacité par sprint/)).toBeInTheDocument();
  });
});

// --- teamName ----------------------------------------------------------------

describe("teamName", () => {
  it("le nom d'équipe saisi apparaît dans PlanScreen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText(/Team Phoenix/i), "Team Alpha");
    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));

    expect(screen.getByText("Équipe : Team Alpha")).toBeInTheDocument();
  });

  it("sans nom d'équipe, la ligne Équipe n'apparaît pas dans PlanScreen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await navigateTo_s4_finish_blocked_internal(user);
    await user.click(screen.getByRole("button", { name: /Un système \/ outil \/ environnement ne fonctionne pas/ }));
    await user.click(screen.getByRole("button", { name: /Voir le plan d'action →/ }));

    expect(screen.queryByText(/Équipe :/)).not.toBeInTheDocument();
  });

  it("après Recommencer, le champ nom est vide", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText(/Team Phoenix/i), "Team Alpha");
    await user.click(screen.getByRole("button", { name: /Beaucoup de travail démarre mais ne sort pas/ }));
    await user.click(screen.getByRole("button", { name: /↻ Recommencer/ }));

    // Le champ réapparaît vide (SymptomScreen re-monte avec state local frais)
    expect(screen.getByPlaceholderText(/Team Phoenix/i)).toHaveValue("");
  });
});
