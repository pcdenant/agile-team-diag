import React from "react";
import { CAUSES } from "../data/causes.js";
import { ACTION_PLANS } from "../data/actionPlans.js";
import { TREES } from "../data/trees.js";
import { C, primaryBtn } from "../theme.js";
import { severityLabel, severityColor, palierMeta, Badge, SectionTitle } from "../utils/ui.jsx";
import ContextStrip from "../components/ContextStrip.jsx";
import PathTrail from "../components/PathTrail.jsx";

export default function ResultScreen({ symptom, tree, treeFocus, terminalId, path, onBack, onRestart, onPlan }) {
  const cause = CAUSES[terminalId];
  const sev = severityColor(cause.severity);
  const palier = palierMeta(cause.palier);
  const focusLabel = treeFocus ? TREES[treeFocus].label : tree.label;
  const hasPlan = Boolean(ACTION_PLANS[terminalId]);
  return (
    <div className="screen-enter">
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Modifier dernière réponse" />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label="Cause identifiée" />
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
