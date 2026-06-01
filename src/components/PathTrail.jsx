import React from "react";
import { C, MONO } from "../theme.js";

/** @param {"card"|"flat"} variant - "card" renders PathTrail's own bordered box; "flat" strips it (use when parent is already a bento-card) */
export default function PathTrail({ path, variant = "card" }) {
  return (
    <div style={variant === "card" ? { border: `1px dashed ${C.border}`, borderRadius: 6, padding: "12px 14px", background: "#fafafa" } : {}}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Chemin de diagnostic</div>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
        {path.map((p, i) => (
          <li key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>
            <div style={{ color: C.muted, fontSize: 12 }}><span style={{ fontFamily: MONO, fontSize: 10 }}>[{p.nodeId}]</span> {p.question}</div>
            <div style={{ color: C.text }}>→ {p.answer}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
