import React, { useState } from "react";
import { CAUSES } from "./data/causes.js";
import { ACTION_PLANS } from "./data/actionPlans.js";
import { SYMPTOMS } from "./data/symptoms.js";
import { SHARED_NODES, PREDICTABILITY_NODES, TTM_NODES, TREES } from "./data/trees.js";
import { STEPS } from "./constants.js";
import PlanHeader from "./components/PlanHeader.jsx";
import PlanMetrics from "./components/PlanMetrics.jsx";
import PlanBusinessPitch from "./components/PlanBusinessPitch.jsx";
import PlanExperiments from "./components/PlanExperiments.jsx";

// --- RUNTIME VALIDATION ---------------------------------------------------

function validateTrees() {
  const allIds = new Set([
    ...Object.keys(CAUSES),
    ...Object.keys(SHARED_NODES),
    ...Object.keys(PREDICTABILITY_NODES),
    ...Object.keys(TTM_NODES),
  ]);

  const allNodes = { ...SHARED_NODES, ...PREDICTABILITY_NODES, ...TTM_NODES };
  let errors = 0;

  for (const s of SYMPTOMS) {
    if (!allIds.has(s.entry)) {
      console.error(`[VALIDATION] Symptôme "${s.id}" → entry "${s.entry}" introuvable`);
      errors++;
    }
  }

  for (const [nodeId, node] of Object.entries(allNodes)) {
    if (!node.answers) {
      console.error(`[VALIDATION] Nœud "${nodeId}" n'a pas de champ answers`);
      errors++;
      continue;
    }
    for (const ans of node.answers) {
      if (!ans.next) {
        console.error(`[VALIDATION] Nœud "${nodeId}" → une réponse sans champ next`);
        errors++;
      } else if (!allIds.has(ans.next)) {
        console.error(`[VALIDATION] Nœud "${nodeId}" → next "${ans.next}" introuvable`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log(`[VALIDATION] ✓ ${allIds.size} IDs valides · ${Object.keys(allNodes).length} nœuds vérifiés · 0 erreur`);
  } else {
    console.error(`[VALIDATION] ${errors} erreur(s) détectée(s) — voir détails ci-dessus`);
  }
}

validateTrees();

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

// --- HELPERS --------------------------------------------------------------

const FONT = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const C = {
  bg: "#fafaf9", surface: "#ffffff", text: "#171717", muted: "#737373",
  border: "#e5e5e5", borderStrong: "#404040", ink: "#0a0a0a",
  high: "#b91c1c", med: "#b45309", low: "#737373",
  palier1: "#0369a1", palier2: "#7c3aed", palier3: "#b91c1c", palierObs: "#737373",
  hintBg: "#fef9c3", hintBorder: "#fde047", hintText: "#713f12",
  infoBg: "#f0f9ff", infoBorder: "#bae6fd", infoText: "#0369a1", infoTextDark: "#0c4a6e",
};

const sectionHeaderStyle = {
  fontSize: 11, fontWeight: 700, color: C.muted,
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
};

function severityLabel(s) { return s === "high" ? "Critique" : s === "medium" ? "Modéré" : "Faible"; }
function severityColor(s) { return s === "high" ? C.high : s === "medium" ? C.med : C.low; }
function palierMeta(p) {
  if (p === 1) return { label: "Palier 1 — Données à collecter", color: C.palier1 };
  if (p === 2) return { label: "Palier 2 — Impact à quantifier", color: C.palier2 };
  if (p === 3) return { label: "Palier 3 — Décision à déclencher", color: C.palier3 };
  return { label: "Hors palier — Observation requise", color: C.palierObs };
}

// --- COMPONENTS -----------------------------------------------------------

export default function App() {
  const [step, setStep] = useState(STEPS.SYMPTOM);
  const [teamName, setTeamName] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [path, setPath] = useState([]);
  const [terminalId, setTerminalId] = useState(null);
  const [treeFocus, setTreeFocus] = useState(null);

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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, fontSize: 15, lineHeight: 1.5, padding: "32px 16px 64px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Header />
        {step === STEPS.SYMPTOM && <SymptomScreen onPick={pickSymptom} />}
        {step === STEPS.DIAGNOSIS && symptom && currentNode && (
          <DiagnosisScreen symptom={symptom} tree={tree} currentNodeId={currentNodeId} currentNode={currentNode} path={path} onAnswer={answer} onBack={backOne} onRestart={restart} />
        )}
        {step === STEPS.RESULT && terminalId && (
          <ResultScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} path={path} onBack={backOne} onRestart={restart} onPlan={showPlan} />
        )}
        {step === STEPS.PLAN && terminalId && ACTION_PLANS[terminalId] && (
          <PlanScreen symptom={symptom} tree={tree} treeFocus={treeFocus} terminalId={terminalId} teamName={teamName} path={path} onBack={backOne} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Collaboration Solved · V2.5 · rev. 8</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: C.ink }}>Team Dysfunction Diagnostic</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Flow & Livraison — Plans d'action : 5/21 implémentés</div>
    </div>
  );
}

function SymptomScreen({ onPick }) {
  const [name, setName] = useState("");
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          Nom de l'équipe <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Team Phoenix"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: FONT, fontSize: 14, color: C.ink, background: C.surface, outline: "none" }}
        />
      </div>
      <SectionTitle n="01" label="Symptôme observé" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SYMPTOMS.map((s) => (
          <button key={s.id} onClick={() => onPick(s, name.trim())}
            style={{ ...btnReset, textAlign: "left", padding: "14px 16px", border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.borderStrong)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}>
            <span style={{ fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, flexShrink: 0 }}>→ {TREES[s.tree].label.toLowerCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiagnosisScreen({ symptom, tree, currentNodeId, currentNode, path, onAnswer, onBack, onRestart }) {
  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel={path.length === 0 ? "← Symptôme" : "← Précédent"} />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label={`Question ${path.length + 1}`} nodeId={currentNodeId} />
      <div style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: 10, lineHeight: 1.4 }}>{currentNode.question}</div>
      {currentNode.hint && (
        <div style={{ background: C.hintBg, border: `1px solid ${C.hintBorder}`, color: C.hintText, fontSize: 13, padding: "8px 12px", borderRadius: 4, marginBottom: 16, lineHeight: 1.45 }}>
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 6 }}>Indice</span>
          {currentNode.hint}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {currentNode.answers.map((a, i) => (
          <button key={i} onClick={() => onAnswer(a)}
            style={{ ...btnReset, textAlign: "left", padding: "12px 16px", border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.background = "#f5f5f4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
            <span>{a.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, flexShrink: 0 }}>{a.next}</span>
          </button>
        ))}
      </div>
      {path.length > 0 && <PathTrail path={path} />}
    </div>
  );
}

function ResultScreen({ symptom, tree, treeFocus, terminalId, path, onBack, onRestart, onPlan }) {
  const cause = CAUSES[terminalId];
  const sev = severityColor(cause.severity);
  const palier = palierMeta(cause.palier);
  const focusLabel = treeFocus ? TREES[treeFocus].label : tree.label;
  const hasPlan = Boolean(ACTION_PLANS[terminalId]);
  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Modifier dernière réponse" />
      <SectionTitle n={String(path.length + 2).padStart(2, "0")} label="Cause identifiée" nodeId={terminalId} />
      <div style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${sev}`, background: C.surface, padding: "18px 20px", borderRadius: 6, marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{cause.label}</div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>{cause.description}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Badge color={sev}>Sévérité : {severityLabel(cause.severity)}</Badge>
          <Badge color={palier.color}>{palier.label}</Badge>
          <Badge color={C.borderStrong}>Propriétaire : {cause.owner}</Badge>
          <Badge color={C.muted}>Focus arbre : {focusLabel}</Badge>
        </div>
      </div>
      <PathTrail path={path} />
      <div style={{ marginTop: 24 }}>
        {hasPlan ? (
          <button onClick={onPlan} style={primaryBtn}>Voir le plan d'action →</button>
        ) : (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Plan d'action — à implémenter.</div>
        )}
      </div>
    </div>
  );
}

function PlanScreen({ symptom, tree, treeFocus, terminalId, teamName, path, onBack, onRestart }) {
  const cause = CAUSES[terminalId];
  const plan = ACTION_PLANS[terminalId];
  const sev = severityColor(cause.severity);
  const pitch = plan.businessPitch;
  const variant = treeFocus && pitch.focusVariant ? pitch.focusVariant[treeFocus] : null;

  return (
    <div>
      <ContextStrip symptom={symptom} tree={tree} onBack={onBack} onRestart={onRestart} backLabel="← Retour au résultat" />
      <PlanHeader cause={cause} teamName={teamName} path={path} terminalId={terminalId} />
      <PlanMetrics plan={plan} cause={cause} sev={sev} />
      <PlanBusinessPitch pitch={pitch} variant={variant} />
      <PlanExperiments experiments={plan.experiments} />
    </div>
  );
}

function ContextStrip({ symptom, tree, onBack, onRestart, backLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: C.muted }}>
        <span style={{ fontFamily: MONO }}>{tree.label}</span>
        <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
        <span>{symptom.label}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onBack} style={linkBtn}>{backLabel}</button>
        <button onClick={onRestart} style={linkBtn}>↻ Recommencer</button>
      </div>
    </div>
  );
}

function SectionTitle({ n, label, nodeId }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{n}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      {nodeId && <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginLeft: "auto" }}>[{nodeId}]</span>}
    </div>
  );
}

function PathTrail({ path }) {
  return (
    <div style={{ border: `1px dashed ${C.border}`, borderRadius: 6, padding: "12px 14px", background: "#fafafa" }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Chemin de diagnostic</div>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
        {path.map((p, i) => (
          <li key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>
            <div style={{ color: C.muted, fontSize: 12 }}><span style={{ fontFamily: MONO, fontSize: 10 }}>[{p.nodeId}]</span> {p.question}</div>
            <div style={{ color: C.text }}>→ {p.answer}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}`, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.2, background: "#fff" }}>
      {children}
    </span>
  );
}

const btnReset = { font: "inherit", color: "inherit", outline: "none" };
const linkBtn = { ...btnReset, border: "none", background: "transparent", fontSize: 12, color: C.muted, cursor: "pointer", padding: "4px 6px", textDecoration: "underline", textUnderlineOffset: 3 };
const primaryBtn = { ...btnReset, border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px 20px", borderRadius: 6, letterSpacing: 0.2 };

export { CAUSES, ACTION_PLANS, SYMPTOMS, TREES, SHARED_NODES, lookupNode, severityLabel, severityColor, palierMeta, validateTrees, C, MONO, sectionHeaderStyle, Badge, SectionTitle };
