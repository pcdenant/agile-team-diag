import React from "react";
import PropTypes from "prop-types";
import { C, SectionTitle } from "../utils/ui.jsx";

export default function PlanHeader({ cause, teamName, path, terminalId }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionTitle n={String(path.length + 3).padStart(2, "0")} label="Plan d'action" nodeId={terminalId} />
      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{cause.label}</div>
      {teamName ? <div style={{ fontSize: 13, color: C.muted }}>Équipe : {teamName}</div> : null}
    </div>
  );
}

PlanHeader.propTypes = {
  cause: PropTypes.object.isRequired,
  teamName: PropTypes.string,
  path: PropTypes.array.isRequired,
  terminalId: PropTypes.string.isRequired,
};
