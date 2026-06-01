import React from "react";
import { C, btnReset } from "../theme.js";
import { SectionTitle } from "../utils/ui.jsx";
import ContextStrip from "../components/ContextStrip.jsx";
import PathTrail from "../components/PathTrail.jsx";

export default function DiagnosisScreen({ symptom, tree, currentNodeId, currentNode, path, onAnswer, onBack, onRestart }) {
  return (
    <div className="screen-enter">
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel={path.length === 0 ? "← Symptôme" : "← Précédent"} />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label={`Question ${path.length + 1}`} />
      <div style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: 10, lineHeight: 1.4 }}>{currentNode.question}</div>
      {currentNode.hint && (
        <div style={{ background: C.hintInfoBg, border: `1px solid ${C.hintInfoBorder}`, color: C.hintInfoColor, fontSize: 13, padding: "8px 12px", borderRadius: 4, marginBottom: 16, lineHeight: 1.45 }}>
          <span style={{ marginRight: 6 }}>💡</span>
          {currentNode.hint}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {currentNode.answers.map((a) => (
          <button key={a.next} onClick={() => onAnswer(a)}
            className="btn-choice"
            style={{ ...btnReset, textAlign: "left", padding: "12px 16px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
      {path.length > 0 && <PathTrail path={path} />}
    </div>
  );
}
