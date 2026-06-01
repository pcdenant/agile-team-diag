import React from "react";
import { CAUSES } from "../data/causes.js";
import { ACTION_PLANS } from "../data/actionPlans.js";
import { C, primaryBtn } from "../theme.js";
import { severityColor, palierMeta, severityPillMeta, PillBadge, SectionTitle } from "../utils/ui.jsx";
import ContextStrip from "../components/ContextStrip.jsx";
import PathTrail from "../components/PathTrail.jsx";

export default function ResultScreen({ symptom, tree, treeFocus, terminalId, path, onBack, onRestart, onPlan }) {
  const cause = CAUSES[terminalId];
  const sev = severityColor(cause.severity);
  const palier = palierMeta(cause.palier);
  const sevMeta = severityPillMeta(cause.severity);
  const hasPlan = Boolean(ACTION_PLANS[terminalId]);
  return (
    <div className="screen-enter">
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Modifier dernière réponse" />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label="Cause identifiée" />
      <div style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${sev}`, background: C.surface, padding: "18px 20px", borderRadius: 6, marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{cause.label}</div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>{cause.description}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <PillBadge bg={sevMeta.bg} color={sevMeta.color}>
            Sévérité · {sevMeta.label}
          </PillBadge>
          <PillBadge bg="#F1F5F9" color="#475569">
            ○ {palier.pillLabel}
          </PillBadge>
          <PillBadge bg="#F5F3FF" color="#5B21B6">
            → {cause.owner}
          </PillBadge>
        </div>
      </div>
      <PathTrail path={path} />
      <div style={{ marginTop: 24 }}>
        {hasPlan ? (
          <button onClick={onPlan} className="btn-primary" style={primaryBtn}>
            Voir le plan d'action →
          </button>
        ) : (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Plan d'action — à implémenter.</div>
        )}
      </div>
    </div>
  );
}
