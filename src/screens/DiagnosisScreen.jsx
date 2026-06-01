import React from "react";
import { C, btnReset, linkBtn } from "../theme.js";
import { SectionTitle } from "../utils/ui.jsx";
import ContextStrip from "../components/ContextStrip.jsx";
import PathTrail from "../components/PathTrail.jsx";

export default function DiagnosisScreen({ symptom, tree, currentNodeId, currentNode, path, onAnswer, onBack, onRestart }) {
  return (
    <div className="screen-enter">
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel={path.length === 0 ? "← Symptôme" : "← Précédent"} showButtons={false} />
      <div className="bento-card">
        <SectionTitle n={String(path.length + 2).padStart(2, "0")} label={`Question ${path.length + 1}`} />
        <div style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: path.length === 0 ? 6 : 10, lineHeight: 1.4 }}>
          {currentNode.question}
        </div>
        {path.length === 0 && (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 10 }}>
            3 à 6 questions selon ton contexte — environ 3 minutes.
          </div>
        )}
        {currentNode.hint && (
          <div style={{ background: C.hintInfoBg, border: `1px solid ${C.hintInfoBorder}`, color: C.hintInfoColor, fontSize: 13, padding: "8px 12px", borderRadius: 4, marginBottom: 0, lineHeight: 1.45 }}>
            <span style={{ marginRight: 6 }}>💡</span>{currentNode.hint}
          </div>
        )}
        <div className={`dx-answers${currentNode.answers.length >= 4 ? " dx-answers-2col" : ""}`} style={{ marginTop: 16 }}>
          {currentNode.answers.map((a) => (
            <button key={a.next} onClick={() => onAnswer(a)}
              className="btn-choice"
              style={{ ...btnReset, textAlign: "left", padding: "12px 16px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
        {path.length > 0 && <PathTrail path={path} collapsible />}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={linkBtn}>
          {path.length === 0 ? "← Symptôme" : "← Précédent"}
        </button>
        {path.length >= 1 && (
          <button onClick={onRestart} style={{ ...btnReset, fontSize: 13, color: "#C94040", background: "none", border: "none", cursor: "pointer" }}>
            Recommencer le diagnostic
          </button>
        )}
      </div>
    </div>
  );
}
