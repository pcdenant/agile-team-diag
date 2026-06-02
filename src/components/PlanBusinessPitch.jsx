import React from "react";
import PropTypes from "prop-types";
import { C } from "../utils/ui.jsx";

export default function PlanBusinessPitch({ pitch, variant }) {
  if (!variant && !pitch.leadershipQuestion) return null;
  return (
    <>
      <div className="bento-span-full" style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>
        Parler business
      </div>
      {variant ? (
        <>
          <div className="bento-card bento-span-2">
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Statu quo</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.statusQuoCost}</div>
          </div>
          <div className="bento-card bento-span-2">
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Résultat attendu</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{variant.expectedResult}</div>
          </div>
        </>
      ) : null}
      {pitch.leadershipQuestion ? (
        <div className="bento-card bento-span-full" style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.infoText, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Question à poser au management</div>
          <div style={{ fontSize: 13, color: C.infoTextDark, lineHeight: 1.5, fontStyle: "italic" }}>{pitch.leadershipQuestion}</div>
        </div>
      ) : null}
    </>
  );
}

PlanBusinessPitch.propTypes = {
  pitch: PropTypes.object.isRequired,
  variant: PropTypes.object,
};
