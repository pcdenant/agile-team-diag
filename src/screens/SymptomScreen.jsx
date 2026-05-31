import React, { useState } from "react";
import { SYMPTOMS } from "../data/symptoms.js";
import { TREES } from "../data/trees.js";
import { C, FONT, MONO, btnReset } from "../theme.js";
import { SectionTitle } from "../utils/ui.jsx";

export default function SymptomScreen({ onPick }) {
  const [name, setName] = useState("");
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="team-name" style={{ display: "block", fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          Nom de l'équipe <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
        </label>
        <input
          id="team-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Team Phoenix"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: FONT, fontSize: 14, color: C.ink, background: C.surface }}
        />
      </div>
      <SectionTitle n="01" label="Symptôme observé" />
      <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SYMPTOMS.map((s) => (
          <button key={s.id} onClick={() => onPick(s, name.trim())}
            className="btn-choice"
            style={{ ...btnReset, textAlign: "left", padding: "14px 16px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, flexShrink: 0 }}>→ {TREES[s.tree].label.toLowerCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
