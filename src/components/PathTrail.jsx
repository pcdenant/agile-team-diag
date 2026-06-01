import React from "react";
import { C } from "../theme.js";

/**
 * @param {boolean} collapsible - true → <details> fermé par défaut (DiagnosisScreen).
 * @param {boolean} flat - true → pas de card propre (usage dans une bento-card parente).
 */
export default function PathTrail({ path, collapsible = false, flat = false }) {
  const items = (
    <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
      {path.map((p, i) => (
        <li key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>
          <div style={{ color: C.muted, fontSize: 12 }}>{p.question}</div>
          <div style={{ color: C.text }}>→ {p.answer}</div>
        </li>
      ))}
    </ol>
  );

  if (collapsible) {
    return (
      <details style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <summary style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", marginBottom: 10 }}>
          Chemin de diagnostic ({path.length} étape{path.length > 1 ? "s" : ""})
        </summary>
        {items}
      </details>
    );
  }

  return (
    <div style={flat ? {} : { border: `1px dashed ${C.border}`, borderRadius: 6, padding: "12px 14px", background: "#fafafa" }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Chemin de diagnostic</div>
      {items}
    </div>
  );
}
