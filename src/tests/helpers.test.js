import { describe, it, expect } from "vitest";
import { severityLabel, severityColor, palierMeta, lookupNode } from "../App.jsx";

// --- severityLabel -----------------------------------------------------------

describe("severityLabel", () => {
  it("retourne 'Critique' pour high", () => {
    expect(severityLabel("high")).toBe("Critique");
  });
  it("retourne 'Modéré' pour medium", () => {
    expect(severityLabel("medium")).toBe("Modéré");
  });
  it("retourne 'Faible' pour low", () => {
    expect(severityLabel("low")).toBe("Faible");
  });
});

// --- severityColor -----------------------------------------------------------

describe("severityColor", () => {
  it("retourne une string non vide pour chaque sévérité", () => {
    ["high", "medium", "low"].forEach((s) => {
      const color = severityColor(s);
      expect(typeof color).toBe("string");
      expect(color.length).toBeGreaterThan(0);
    });
  });

  it("retourne des couleurs distinctes pour chaque niveau", () => {
    expect(severityColor("high")).not.toBe(severityColor("medium"));
    expect(severityColor("medium")).not.toBe(severityColor("low"));
    expect(severityColor("high")).not.toBe(severityColor("low"));
  });
});

// --- palierMeta --------------------------------------------------------------

describe("palierMeta", () => {
  it("retourne un objet avec label et color pour chaque palier (0–3)", () => {
    [0, 1, 2, 3].forEach((p) => {
      const meta = palierMeta(p);
      expect(typeof meta.label).toBe("string");
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.color).toBe("string");
    });
  });

  it("palier 1 contient 'Palier 1' dans le label", () => {
    expect(palierMeta(1).label).toContain("Palier 1");
  });

  it("palier 2 contient 'Palier 2' dans le label", () => {
    expect(palierMeta(2).label).toContain("Palier 2");
  });

  it("palier 3 contient 'Palier 3' dans le label", () => {
    expect(palierMeta(3).label).toContain("Palier 3");
  });

  it("palier 0 (exit_observe) contient 'Observation' dans le label", () => {
    expect(palierMeta(0).label).toContain("Observation");
  });

  it("chaque palier a une couleur distincte", () => {
    const colors = [0, 1, 2, 3].map((p) => palierMeta(p).color);
    const unique = new Set(colors);
    expect(unique.size).toBe(4);
  });
});

// --- lookupNode --------------------------------------------------------------

describe("lookupNode", () => {
  it("retourne null pour les IDs de causes terminales", () => {
    expect(lookupNode("predictability", "c_tech")).toBeNull();
    expect(lookupNode("time_to_market", "c_gate")).toBeNull();
    expect(lookupNode("predictability", "c_org")).toBeNull();
    expect(lookupNode("time_to_market", "exit_observe")).toBeNull();
  });

  it("résout les nœuds partagés (SHARED_NODES) quel que soit l'arbre", () => {
    const node = lookupNode("predictability", "finish_state");
    expect(node).not.toBeNull();
    expect(node).toHaveProperty("question");
    expect(node).toHaveProperty("answers");
    expect(Array.isArray(node.answers)).toBe(true);

    // Même nœud accessible depuis time_to_market
    const nodeTTM = lookupNode("time_to_market", "finish_state");
    expect(nodeTTM).not.toBeNull();
    expect(nodeTTM.question).toBe(node.question);
  });

  it("résout p_internal_nature_finish depuis les deux arbres", () => {
    const node = lookupNode("predictability", "p_internal_nature_finish");
    expect(node).not.toBeNull();
    const answers = node.answers.map((a) => a.next);
    expect(answers).toContain("c_tech");
    expect(answers).toContain("c_gate");
  });

  it("résout les nœuds spécifiques à Predictability", () => {
    const node = lookupNode("predictability", "p_observe");
    expect(node).not.toBeNull();
    expect(node.question).toContain("board");
  });

  it("résout les nœuds spécifiques à TTM", () => {
    const node = lookupNode("time_to_market", "ttm_urgent_slow");
    expect(node).not.toBeNull();
    expect(node).toHaveProperty("answers");
  });

  it("retourne null pour un ID inconnu", () => {
    expect(lookupNode("predictability", "noeud_inexistant")).toBeNull();
    expect(lookupNode("time_to_market", "noeud_inexistant")).toBeNull();
  });

  it("chaque answer de chaque nœud partagé a label et next", () => {
    const node = lookupNode("predictability", "finish_blocked_nature");
    node.answers.forEach((a) => {
      expect(a).toHaveProperty("label");
      expect(a).toHaveProperty("next");
    });
  });
});
