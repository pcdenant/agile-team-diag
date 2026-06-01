import React, { useState } from "react";
import { SYMPTOMS } from "../data/symptoms.js";
import { C, FONT, btnReset } from "../theme.js";
import { SectionTitle } from "../utils/ui.jsx";

const SYMPTOM_GROUPS = [
  {
    key: "predictability",
    label: "Engagements & dates",
    hint: "Ce que l'équipe a promis ne se réalise pas.",
    color: "#2E5FA3",
    bg: "#EBF1FA",
    cssClass: "btn-symptom-pred",
  },
  {
    key: "time_to_market",
    label: "Flux & avancement",
    hint: "Le travail ne circule pas — il attend ou il s'accumule.",
    color: "#C07818",
    bg: "#FEF3DC",
    cssClass: "btn-symptom-ttm",
  },
];

export default function SymptomScreen({ onPick }) {
  const [name, setName] = useState("");
  return (
    <div className="bento-grid screen-enter">
      <div className="bento-card bento-span-full">
        <SectionTitle n="01" label="Symptôme observé" />
        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.5, margin: "12px 0 16px" }}>
          En 5 questions, tu identifies la cause réelle et tu sors avec un plan à présenter à ton manager.
        </p>
        <label
          htmlFor="team-name"
          style={{ display: "block", fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}
        >
          Nom de l'équipe <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
        </label>
        <input
          id="team-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Team Phoenix"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT, fontSize: 14, color: C.ink, background: C.surface }}
        />
      </div>
      {SYMPTOM_GROUPS.map((group) => {
        const groupSymptoms = SYMPTOMS.filter((s) => s.tree === group.key);
        return (
          <div
            key={group.key}
            className="bento-card bento-span-2"
            style={{ borderLeft: `3px solid ${group.color}` }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700, color: group.color,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4,
            }}>
              {group.label}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.45 }}>
              {group.hint}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {groupSymptoms.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onPick(s, name.trim())}
                  className={`btn-choice ${group.cssClass}`}
                  style={{ ...btnReset, textAlign: "left", padding: "14px 16px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%" }}
                >
                  <span style={{ fontWeight: 500 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
