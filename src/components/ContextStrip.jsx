import React from "react";
import { C, MONO, linkBtn } from "../theme.js";

export default function ContextStrip({ symptom, tree, onBack, onRestart, backLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: C.muted }}>
        <span style={{ fontFamily: MONO }}>{tree.label}</span>
        <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
        <span>{symptom.label}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onBack} style={linkBtn}>{backLabel}</button>
        <button onClick={onRestart} style={linkBtn} aria-label="Recommencer depuis le début">↻ Recommencer</button>
      </div>
    </div>
  );
}
