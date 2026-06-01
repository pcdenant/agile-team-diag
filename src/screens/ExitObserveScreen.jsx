import React from "react";
import { C, MONO, btnReset, primaryBtn } from "../theme.js";
import { PillBadge } from "../utils/ui.jsx";

const RETRO_QUESTIONS = [
  "Est-ce qu'on a livré tout ce qu'on avait planifié ?",
  "Pour les items non livrés : est-ce qu'ils étaient bloqués ou juste pas commencés ?",
  "Si bloqués : qui ou quoi bloquait ? L'équipe aurait pu débloquer seule ?",
  "Combien d'items en cours en ce moment sur le board ?",
  "Est-ce qu'on a travaillé sur des choses non planifiées en sprint ?",
];

export default function ExitObserveScreen({ symptom, tree, path, onBack, onRestart }) {
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bento-card">
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
          <span style={{ fontFamily: MONO }}>{tree.label}</span>
          <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
          <span>{symptom.label}</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 8, lineHeight: 1.3 }}>
          Données insuffisantes pour conclure
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 12 }}>
          Le board ne montre pas encore de signal clair. Pose ces questions en rétro cette semaine.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PillBadge bg="#F1F5F9" color="#475569">○ Palier 0</PillBadge>
          <PillBadge bg="#F1F5F9" color="#475569">Observation requise</PillBadge>
        </div>
      </div>

      <div className="eo-questions-grid">
        {RETRO_QUESTIONS.map((q, i) => (
          <div key={i} className="bento-card">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "#F1F5F9", color: "#475569",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: MONO,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{q}</span>
            </div>
          </div>
        ))}
        <div className="bento-card" style={{ background: C.hintInfoBg, border: `1px solid ${C.hintInfoBorder}`, color: C.hintInfoColor }}>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ marginRight: 6 }}>💡</span>
            Ces questions prennent 10 minutes en rétro. Reviens avec les réponses pour compléter le diagnostic.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ ...btnReset, fontSize: 13, color: C.muted, cursor: "pointer" }}>
          ← Retour au diagnostic
        </button>
        <button onClick={onRestart} style={primaryBtn}>
          Recommencer avec les données →
        </button>
      </div>
    </div>
  );
}
