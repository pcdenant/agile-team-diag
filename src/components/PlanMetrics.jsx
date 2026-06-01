import React from "react";
import PropTypes from "prop-types";
import { C, MONO, sectionHeaderStyle, Badge, severityLabel } from "../utils/ui.jsx";

export default function PlanMetrics({ plan, cause, sev }) {
  return (
    <div className="plan-grid" style={{ marginBottom: 20, alignItems: "start" }}>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface }}>
        <div style={sectionHeaderStyle}>Impact · Objectif</div>
        <div style={{ background: C.costAlertBg, border: `1.5px solid ${C.costAlertBorder}`, borderRadius: 4, padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.costAlertColor, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>⚠ Ce que ça coûte</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{plan.cost}</div>
        </div>
        {plan.costHint ? <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>{plan.costHint}</div> : null}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Mesures de succès</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}`, paddingRight: 8 }}>Métrique</th>
              <th style={{ textAlign: "right", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}`, paddingRight: 8 }}>Cible</th>
              <th style={{ textAlign: "right", color: C.muted, fontWeight: 600, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>Fréquence</th>
            </tr>
          </thead>
          <tbody>
            {plan.indicators.map((ind, i) => (
              <tr key={ind.metric}>
                <td style={{ padding: "6px 8px 6px 0", color: C.text, lineHeight: 1.4, borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none" }}>{ind.metric}</td>
                <td style={{ padding: "6px 8px", color: C.ink, fontWeight: 500, textAlign: "right", borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>{ind.target}</td>
                <td style={{ padding: "6px 0 6px 8px", color: C.muted, textAlign: "right", borderBottom: i < plan.indicators.length - 1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>{ind.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 11, color: C.muted, fontStyle: "italic" }}>{plan.ownerNote}</div>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px", background: C.surface }}>
        <div style={sectionHeaderStyle}>Inspecter · Mesurer</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>
          Collecter les données dès maintenant — sans reconstituer après coup.
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
          <strong style={{ color: C.ink }}>Quoi :</strong> Pour chaque item bloqué, noter la cause, la date de début, et le responsable de résolution.
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
          <strong style={{ color: C.ink }}>Comment :</strong> Voir Étape 1 ci-dessous — le tag sur le board est la seule action requise cette semaine.
        </div>
        <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          <Badge color={sev}>Sévérité : {severityLabel(cause.severity)}</Badge>
          {" "}
          <Badge color={C.borderStrong}>Propriétaire : {cause.owner}</Badge>
        </div>
      </div>
    </div>
  );
}

PlanMetrics.propTypes = {
  plan: PropTypes.object.isRequired,
  cause: PropTypes.object.isRequired,
  sev: PropTypes.string.isRequired,
};
