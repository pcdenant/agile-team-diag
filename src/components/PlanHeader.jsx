import React from "react";
import { C, SectionTitle } from "../App.jsx";

export default function PlanHeader({ cause, teamName, path, terminalId }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionTitle n={String(path.length + 3).padStart(2, "0")} label="Plan d'action" nodeId={terminalId} />
      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{cause.label}</div>
      {teamName ? <div style={{ fontSize: 13, color: C.muted }}>Équipe : {teamName}</div> : null}
    </div>
  );
}
