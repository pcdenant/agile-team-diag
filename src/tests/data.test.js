import { describe, it, expect, vi } from "vitest";
import { CAUSES, ACTION_PLANS, SYMPTOMS, TREES, validateTrees } from "../App.jsx";

// --- CAUSES ------------------------------------------------------------------

const ALL_CAUSE_IDS = [
  "c1_ext", "c1_int", "c2", "c2q",
  "c3_ext", "c3_int", "c4_dep", "c4q_dep",
  "c_org", "c_wip", "c_cap", "c_dor",
  "c_tech", "c_gate", "c_anticipation",
  "c_oversize", "c_scope_creep", "c_skill_unavailable",
  "c_urgency_misalign", "c_strategy_vague", "c_defects",
  "exit_observe",
];

describe("CAUSES", () => {
  it("contains all 22 expected cause IDs", () => {
    ALL_CAUSE_IDS.forEach((id) => {
      expect(CAUSES, `cause "${id}" manquant`).toHaveProperty(id);
    });
  });

  it("every cause has required fields with valid types", () => {
    Object.entries(CAUSES).forEach(([id, cause]) => {
      expect(cause.label, `${id}.label`).toBeTruthy();
      expect(["high", "medium", "low"], `${id}.severity invalide`).toContain(cause.severity);
      expect(cause.owner, `${id}.owner`).toBeTruthy();
      expect([0, 1, 2, 3], `${id}.palier invalide`).toContain(cause.palier);
      expect(cause.description, `${id}.description`).toBeTruthy();
    });
  });

  it("exit_observe has palier 0", () => {
    expect(CAUSES.exit_observe.palier).toBe(0);
  });

  it("c_tech and c_gate are palier 1 with correct owners", () => {
    expect(CAUSES.c_tech.palier).toBe(1);
    expect(CAUSES.c_tech.severity).toBe("high");
    expect(CAUSES.c_tech.owner).toBe("Équipe + Ops/Infra");
    expect(CAUSES.c_gate.palier).toBe(1);
    expect(CAUSES.c_gate.severity).toBe("medium");
    expect(CAUSES.c_gate.owner).toBe("SM + Process owner");
  });

  it("c_org is palier 3 owned by Leadership", () => {
    expect(CAUSES.c_org.palier).toBe(3);
    expect(CAUSES.c_org.owner).toBe("Leadership");
  });
});

// --- ACTION_PLANS ------------------------------------------------------------

const PLAN_IDS = ["c_tech", "c_gate", "c_oversize", "c_scope_creep", "c_wip", "c1_ext", "c1_int", "c_dor", "c2", "c2q", "c_cap", "c3_ext", "c3_int", "c_anticipation", "c_skill_unavailable"];
const PLANS_WITH_VARIANT = ["c_tech", "c_gate", "c_oversize", "c_scope_creep", "c_wip", "c1_ext", "c1_int", "c_dor", "c3_ext", "c3_int", "c_anticipation", "c_skill_unavailable"];
const PLANS_WITHOUT_VARIANT = ["c2", "c2q", "c_cap"];

describe("ACTION_PLANS", () => {
  it("contient exactement 15 plans implémentés", () => {
    expect(Object.keys(ACTION_PLANS)).toHaveLength(15);
    PLAN_IDS.forEach((id) => expect(ACTION_PLANS).toHaveProperty(id));
  });

  it.each(PLAN_IDS)("plan %s has all required top-level fields", (id) => {
    const plan = ACTION_PLANS[id];
    expect(plan.cost).toBeTruthy();
    expect(plan.experiments).toBeDefined();
    expect(plan.indicators).toBeDefined();
    expect(plan.ownerNote).toBeTruthy();
    expect(plan.businessPitch).toBeDefined();
  });

  it.each(PLAN_IDS)("plan %s has exactly 2 experiments with required fields", (id) => {
    const { experiments } = ACTION_PLANS[id];
    expect(experiments).toHaveLength(2);
    experiments.forEach((exp, i) => {
      expect(exp.label, `exp[${i}].label`).toBeTruthy();
      expect(exp.timing, `exp[${i}].timing`).toBeTruthy();
      expect(exp.description, `exp[${i}].description`).toBeTruthy();
      expect(exp.criterion, `exp[${i}].criterion`).toBeTruthy();
      expect(typeof exp.gate, `exp[${i}].gate`).toBe("boolean");
    });
  });

  it.each(PLAN_IDS)("plan %s: étape 1 a un gate, étape 2 n'en a pas", (id) => {
    const { experiments } = ACTION_PLANS[id];
    expect(experiments[0].gate).toBe(true);
    expect(experiments[1].gate).toBe(false);
  });

  it.each(PLAN_IDS)("plan %s a au moins 2 indicateurs avec metric/target/frequency", (id) => {
    const { indicators } = ACTION_PLANS[id];
    expect(indicators.length).toBeGreaterThanOrEqual(2);
    indicators.forEach((ind) => {
      expect(ind.metric).toBeTruthy();
      expect(ind.target).toBeTruthy();
      expect(ind.frequency).toBeTruthy();
    });
  });

  it.each(PLANS_WITH_VARIANT)("plan %s businessPitch a focusVariant pour les 2 arbres", (id) => {
    const { focusVariant } = ACTION_PLANS[id].businessPitch;
    expect(focusVariant).toHaveProperty("predictability");
    expect(focusVariant).toHaveProperty("time_to_market");
    ["predictability", "time_to_market"].forEach((tree) => {
      expect(focusVariant[tree].statusQuoCost, `${id} ${tree} statusQuoCost`).toBeTruthy();
      expect(focusVariant[tree].expectedResult, `${id} ${tree} expectedResult`).toBeTruthy();
    });
  });

  it.each(PLANS_WITHOUT_VARIANT)("plan %s (Predictability-only) n'a pas de focusVariant", (id) => {
    const { focusVariant } = ACTION_PLANS[id].businessPitch;
    expect(focusVariant == null).toBe(true);
  });

  it.each(PLAN_IDS)("plan %s businessPitch a une leadershipQuestion non vide", (id) => {
    const { leadershipQuestion } = ACTION_PLANS[id].businessPitch;
    expect(typeof leadershipQuestion).toBe("string");
    expect(leadershipQuestion.length).toBeGreaterThan(10);
  });

  it("c_tech: predictability et time_to_market ont des contenus distincts", () => {
    const { focusVariant } = ACTION_PLANS.c_tech.businessPitch;
    expect(focusVariant.predictability.statusQuoCost).not.toBe(
      focusVariant.time_to_market.statusQuoCost
    );
  });

  it("c_gate: indicateur items a une cible ≤ 2", () => {
    const gateIndicators = ACTION_PLANS.c_gate.indicators;
    const itemsInd = gateIndicators.find((i) => i.metric.includes("Items en attente"));
    expect(itemsInd).toBeDefined();
    expect(itemsInd.target).toBe("≤ 2");
  });
});

// --- SYMPTOMS ----------------------------------------------------------------

describe("SYMPTOMS", () => {
  it("contient exactement 4 symptômes", () => {
    expect(SYMPTOMS).toHaveLength(4);
  });

  it("chaque symptôme a id, label, tree et entry", () => {
    SYMPTOMS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(["predictability", "time_to_market"]).toContain(s.tree);
      expect(s.entry).toBeTruthy();
    });
  });

  it("s1 et s2 sont dans l'arbre predictability", () => {
    expect(SYMPTOMS.find((s) => s.id === "s1").tree).toBe("predictability");
    expect(SYMPTOMS.find((s) => s.id === "s2").tree).toBe("predictability");
  });

  it("s3 et s4 sont dans l'arbre time_to_market", () => {
    expect(SYMPTOMS.find((s) => s.id === "s3").tree).toBe("time_to_market");
    expect(SYMPTOMS.find((s) => s.id === "s4").tree).toBe("time_to_market");
  });
});

// --- TREES -------------------------------------------------------------------

describe("TREES", () => {
  it("contient predictability et time_to_market", () => {
    expect(TREES).toHaveProperty("predictability");
    expect(TREES).toHaveProperty("time_to_market");
  });

  it("chaque arbre a un label et des nodes", () => {
    Object.entries(TREES).forEach(([id, tree]) => {
      expect(tree.label, `${id}.label`).toBeTruthy();
      expect(tree.nodes, `${id}.nodes`).toBeDefined();
    });
  });
});

// --- validateTrees -----------------------------------------------------------

describe("validateTrees", () => {
  it("log une ligne avec 0 erreur", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    validateTrees();
    const calls = spy.mock.calls.flat().join(" ");
    expect(calls).toMatch(/\[VALIDATION\]/);
    expect(calls).toMatch(/0 erreur/);
    spy.mockRestore();
  });
});
