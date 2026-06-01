export const FONT = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

export const C = {
  bg: "#fafaf9", surface: "#ffffff", text: "#171717", muted: "#737373",
  textSub: "#525252",
  border: "#e5e5e5", borderStrong: "#404040", ink: "#0a0a0a",
  high: "#b91c1c", med: "#b45309", low: "#737373",
  palier1: "#0369a1", palier2: "#7c3aed", palier3: "#b91c1c", palierObs: "#737373",
  // hint-info — indice diagnostique (lecture optionnelle)
  hintInfoBg: "#EBF3FF", hintInfoBorder: "#90B8E8", hintInfoColor: "#1E4080",
  // cost-alert — encart coût dans le plan d'action (lecture obligatoire)
  costAlertBg: "#FFF0CC", costAlertBorder: "#D4900A", costAlertColor: "#7A4A00",
  // context-warm — contexte actionnable dans les expérimentations
  contextWarmBg: "#FFF8EC", contextWarmBorder: "#E8A020", contextWarmColor: "#C07818",
  infoBg: "#f0f9ff", infoBorder: "#bae6fd", infoText: "#0369a1", infoTextDark: "#0c4a6e",
};

export const sectionHeaderStyle = {
  fontSize: 11, fontWeight: 700, color: C.muted,
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
};

export const btnReset = { font: "inherit", color: "inherit" };
export const linkBtn = { ...btnReset, border: "none", background: "transparent", fontSize: 12, color: C.muted, cursor: "pointer", padding: "0 10px", minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "underline", textUnderlineOffset: 3 };
export const primaryBtn = { ...btnReset, border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px 20px", borderRadius: 6, letterSpacing: 0.2, minHeight: 44 };
