import { C } from "../theme";

export default function Footer() {
  return (
    <div style={{
      borderTop: `1px solid ${C.border}`,
      padding: "12px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: C.surface,
    }}>
      <span style={{ color:C.muted, fontSize:11 }}>
        MarketGuard ML Validation Framework · Phase 1: FRED Data · Phase 2: Bloomberg Terminal
      </span>
      <span style={{ color:C.muted, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
        v1.0.0 · All systems operational
      </span>
    </div>
  );
}
