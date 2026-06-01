import React from "react";
import { C, MONO, linkBtn } from "../theme.js";

const GROUP_COLORS = { predictability: "#2E5FA3", time_to_market: "#C07818" };

export default function ContextStrip({ symptom, tree, onBack, onRestart, backLabel, showButtons = true }) {
  const groupColor = GROUP_COLORS[symptom.tree] || C.muted;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: C.muted }}>
        <span style={{ color: groupColor, marginRight: 5, fontSize: 9 }}>●</span>
        <span style={{ fontFamily: MONO }}>{tree.label}</span>
        <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
        <span>{symptom.label}</span>
      </div>
      {showButtons && (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onBack} style={linkBtn}>{backLabel}</button>
          <button onClick={onRestart} style={linkBtn} aria-label="Recommencer depuis le début">↻ Recommencer</button>
        </div>
      )}
    </div>
  );
}
