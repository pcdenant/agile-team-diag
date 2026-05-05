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
