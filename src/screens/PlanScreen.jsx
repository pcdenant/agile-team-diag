import React from "react";
import { CAUSES } from "../data/causes.js";
import { ACTION_PLANS } from "../data/actionPlans.js";
import { severityColor } from "../utils/ui.jsx";
import ContextStrip from "../components/ContextStrip.jsx";
import PlanHeader from "../components/PlanHeader.jsx";
import PlanMetrics from "../components/PlanMetrics.jsx";
import PlanBusinessPitch from "../components/PlanBusinessPitch.jsx";
import PlanExperiments from "../components/PlanExperiments.jsx";

export default function PlanScreen({ symptom, tree, treeFocus, terminalId, teamName, path, onBack, onRestart }) {
  const cause = CAUSES[terminalId];
  const plan = ACTION_PLANS[terminalId];
  const sev = severityColor(cause.severity);
  const pitch = plan.businessPitch;
  const variant = treeFocus && pitch.focusVariant ? pitch.focusVariant[treeFocus] : null;

  return (
    <div className="screen-enter">
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Retour au résultat" />
      <div className="bento-grid" style={{ marginTop: 16 }}>
        <PlanHeader cause={cause} teamName={teamName} path={path} terminalId={terminalId} />
        <PlanMetrics plan={plan} cause={cause} sev={sev} />
        <PlanBusinessPitch pitch={pitch} variant={variant} />
        <PlanExperiments experiments={plan.experiments} />
      </div>
    </div>
  );
}
