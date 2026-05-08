import React from "react";
import { C, sectionHeaderStyle } from "../App.jsx";

export default function PlanBusinessPitch({ pitch, variant }) {
  if (!variant && !pitch.leadershipQuestion) return null;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface, marginBottom: 20 }}>
      <div style={sectionHeaderStyle}>Parler business</div>
      {variant ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Statu quo</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.statusQuoCost}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Résultat attendu</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.expectedResult}</div>
          </div>
        </div>
      ) : null}
      {pitch.leadershipQuestion ? (
        <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 4, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.infoText, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Question à poser au management</div>
          <div style={{ fontSize: 13, color: C.infoTextDark, lineHeight: 1.5, fontStyle: "italic" }}>{pitch.leadershipQuestion}</div>
        </div>
      ) : null}
    </div>
  );
}
