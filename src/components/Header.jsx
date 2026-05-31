import React from "react";
import { C } from "../theme.js";

export default function Header() {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Collaboration Solved · V2.5 · rev. 8</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: C.ink }}>Team Dysfunction Diagnostic</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Diagnostic de dysfonctionnement · Flow & Livraison</div>
    </div>
  );
}
