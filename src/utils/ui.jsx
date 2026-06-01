import React from "react";
import { C, MONO } from "../theme.js";
import { SEVERITY } from "../constants.js";

export { C, MONO, sectionHeaderStyle } from "../theme.js";

export function severityLabel(s) { return s === SEVERITY.HIGH ? "Critique" : s === SEVERITY.MEDIUM ? "Modéré" : "Faible"; }
export function severityColor(s) { return s === SEVERITY.HIGH ? C.high : s === SEVERITY.MEDIUM ? C.med : C.low; }
export function palierMeta(p) {
  if (p === 1) return { label: "Palier 1 — Données à collecter", shortLabel: "Collecter", color: C.palier1 };
  if (p === 2) return { label: "Palier 2 — Impact à quantifier", shortLabel: "Quantifier", color: C.palier2 };
  if (p === 3) return { label: "Palier 3 — Décision à déclencher", shortLabel: "Décider", color: C.palier3 };
  return { label: "Hors palier — Observation requise", shortLabel: "Observation requise", color: C.palierObs };
}

/** Palette pour les pill badges de sévérité (ResultScreen). */
export function severityPillMeta(s) {
  if (s === SEVERITY.HIGH)   return { bg: "#FDEAEA", color: "#C94040", dot: "#C94040", label: "Critique" };
  if (s === SEVERITY.MEDIUM) return { bg: "#FFF8EC", color: "#C07818", dot: "#E8A020", label: "Modéré" };
  return                            { bg: "#E8F5EE", color: "#2E7D50", dot: "#2E7D50", label: "Faible" };
}

/** Badge générique (outline, fond blanc). Utilisé dans PlanMetrics, PlanHeader. */
export function Badge({ color, children }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}`, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.2, background: "#fff" }}>
      {children}
    </span>
  );
}

/** Pill badge (fond coloré, DM Mono, uppercase). Utilisé dans ResultScreen et ObserveScreen. */
export function PillBadge({ bg, color, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: bg, color,
      borderRadius: 20, padding: "4px 12px",
      fontSize: 11, fontWeight: 700, fontFamily: MONO,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {children}
    </span>
  );
}

export function SectionTitle({ n, label }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{n}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}
