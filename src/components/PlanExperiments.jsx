import React from "react";
import PropTypes from "prop-types";
import { C, sectionHeaderStyle, Badge } from "../utils/ui.jsx";

export default function PlanExperiments({ experiments }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface, marginBottom: 24 }}>
      <div style={{ ...sectionHeaderStyle, marginBottom: 16 }}>Adapter · Expérimenter</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {experiments.map((exp, i) => (
          <div key={exp.label}>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{exp.label}</span>
                <Badge color={C.muted}>{exp.timing}</Badge>
              </div>
              {exp.context && (
                <div style={{ background: C.contextWarmBg, border: `1px solid ${C.contextWarmBorder}`, color: C.contextWarmColor, fontSize: 12, padding: "7px 10px", borderRadius: 4, marginBottom: 8, lineHeight: 1.45 }}>
                  {exp.context}
                </div>
              )}
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>{exp.description}</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "8px 10px" }}>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{exp.criterion}</span>
              </div>
            </div>
            {exp.gate && i < experiments.length - 1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 11, color: C.muted }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ whiteSpace: "nowrap" }}>Lancer l'étape suivante uniquement quand celle-ci est conclue</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

PlanExperiments.propTypes = {
  experiments: PropTypes.arrayOf(PropTypes.object).isRequired,
};
