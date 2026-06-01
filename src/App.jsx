import React, { useState, useEffect } from "react";
import { CAUSES } from "./data/causes.js";
import { ACTION_PLANS } from "./data/actionPlans.js";
import { SYMPTOMS } from "./data/symptoms.js";
import { SHARED_NODES, PREDICTABILITY_NODES, TTM_NODES, TREES } from "./data/trees.js";
import { STEPS } from "./constants.js";
import { C, FONT, sectionHeaderStyle, btnReset, linkBtn, primaryBtn } from "./theme.js";
import { severityLabel, severityColor, palierMeta, Badge, SectionTitle, MONO } from "./utils/ui.jsx";
import Header from "./components/Header.jsx";
import ContextStrip from "./components/ContextStrip.jsx";
import PathTrail from "./components/PathTrail.jsx";
import SymptomScreen from "./screens/SymptomScreen.jsx";
import DiagnosisScreen from "./screens/DiagnosisScreen.jsx";
import ExitObserveScreen from "./screens/ExitObserveScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";
import PlanScreen from "./screens/PlanScreen.jsx";

// --- RUNTIME VALIDATION ---------------------------------------------------

function validateTrees() {
  const allIds = new Set([
    ...Object.keys(CAUSES),
    ...Object.keys(SHARED_NODES),
    ...Object.keys(PREDICTABILITY_NODES),
    ...Object.keys(TTM_NODES),
  ]);

  const allNodes = { ...SHARED_NODES, ...PREDICTABILITY_NODES, ...TTM_NODES };
  const errors = [];

  for (const s of SYMPTOMS) {
    if (!allIds.has(s.entry)) {
      const msg = `[VALIDATION] Symptôme "${s.id}" → entry "${s.entry}" introuvable`;
      console.error(msg);
      errors.push(msg);
    }
  }

  for (const [nodeId, node] of Object.entries(allNodes)) {
    if (!node.answers) {
      const msg = `[VALIDATION] Nœud "${nodeId}" n'a pas de champ answers`;
      console.error(msg);
      errors.push(msg);
      continue;
    }
    for (const ans of node.answers) {
      if (!ans.next) {
        const msg = `[VALIDATION] Nœud "${nodeId}" → une réponse sans champ next`;
        console.error(msg);
        errors.push(msg);
      } else if (!allIds.has(ans.next)) {
        const msg = `[VALIDATION] Nœud "${nodeId}" → next "${ans.next}" introuvable`;
        console.error(msg);
        errors.push(msg);
      }
    }
  }

  if (errors.length === 0) {
    console.log(`[VALIDATION] ✓ ${allIds.size} IDs valides · ${Object.keys(allNodes).length} nœuds vérifiés · 0 erreur`);
  } else {
    console.error(`[VALIDATION] ${errors.length} erreur(s) détectée(s) — voir détails ci-dessus`);
  }

  return errors;
}

// --------------------------------------------------------------------------

function lookupNode(treeId, nodeId) {
  if (CAUSES[nodeId]) return null;
  if (SHARED_NODES[nodeId]) return SHARED_NODES[nodeId];
  const tree = TREES[treeId];
  if (tree && tree.nodes[nodeId]) return tree.nodes[nodeId];
  for (const id of Object.keys(TREES)) {
    if (TREES[id].nodes[nodeId]) return TREES[id].nodes[nodeId];
  }
  return null;
}

// --- APP ------------------------------------------------------------------

export default function App() {
  const [step, setStep] = useState(STEPS.SYMPTOM);
  const [teamName, setTeamName] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [path, setPath] = useState([]);
  const [terminalId, setTerminalId] = useState(null);
  const [treeFocus, setTreeFocus] = useState(null);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    const errors = validateTrees();
    if (errors.length > 0) setDataError(errors);
  }, []);

  const currentNodeId = path.length > 0 ? path[path.length - 1].next : symptom ? symptom.entry : null;
  const currentNode = currentNodeId && symptom && !CAUSES[currentNodeId]
    ? lookupNode(symptom.tree, currentNodeId)
    : null;

  function pickSymptom(s, name) {
    setSymptom(s);
    setTreeFocus(s.tree);
    setTeamName(name || null);
    setPath([]);
    setTerminalId(null);
    setStep(STEPS.DIAGNOSIS);
  }

  function answer(ans) {
    const newPath = [...path, { nodeId: currentNodeId, question: currentNode.question, answer: ans.label, next: ans.next }];
    if (CAUSES[ans.next]) { setPath(newPath); setTerminalId(ans.next); setStep(STEPS.RESULT); }
    else setPath(newPath);
  }

  function backOne() {
    if (step === STEPS.PLAN) { setStep(STEPS.RESULT); return; }
    if (path.length === 0) { setStep(STEPS.SYMPTOM); setSymptom(null); setTreeFocus(null); return; }
    setPath(path.slice(0, -1));
    setTerminalId(null);
    if (step === STEPS.RESULT) setStep(STEPS.DIAGNOSIS);
  }

  function showPlan() { setStep(STEPS.PLAN); }

  function restart() { setStep(STEPS.SYMPTOM); setTeamName(null); setSymptom(null); setPath([]); setTerminalId(null); setTreeFocus(null); }

  const tree = symptom ? TREES[symptom.tree] : null;

  if (dataError) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff1f2", color: "#881337", fontFamily: FONT, padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚠ Erreur de données — {dataError.length} problème(s) détecté(s)</div>
          <ul style={{ fontSize: 13, lineHeight: 1.6, paddingLeft: 20 }}>
            {dataError.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
          <div style={{ marginTop: 16, fontSize: 12, color: "#9f1239" }}>Vérifier les fichiers dans src/data/ — les IDs next: référencés doivent tous exister.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, fontSize: 15, lineHeight: 1.5, padding: "32px 16px 64px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Header />
        {step === STEPS.SYMPTOM && <SymptomScreen onPick={pickSymptom} />}
        {step === STEPS.DIAGNOSIS && symptom && currentNode && (
          <DiagnosisScreen symptom={symptom} tree={tree} currentNodeId={currentNodeId} currentNode={currentNode} path={path} onAnswer={answer} onBack={backOne} onRestart={restart} />
        )}
        {step === STEPS.RESULT && terminalId === "exit_observe" && (
          <ExitObserveScreen symptom={symptom} tree={tree} path={path} onBack={backOne} onRestart={restart} />
        )}
        {step === STEPS.RESULT && terminalId && terminalId !== "exit_observe" && CAUSES[terminalId] && (
          <ResultScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} path={path} onBack={backOne} onRestart={restart} onPlan={showPlan} />
        )}
        {step === STEPS.PLAN && terminalId && CAUSES[terminalId] && ACTION_PLANS[terminalId] && (
          <PlanScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} teamName={teamName} path={path} onBack={backOne} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

export { CAUSES, ACTION_PLANS, SYMPTOMS, TREES, SHARED_NODES, lookupNode, severityLabel, severityColor, palierMeta, validateTrees, C, MONO, sectionHeaderStyle, Badge, SectionTitle };
