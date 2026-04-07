import { C } from "../theme";

export default function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      borderLeft: `3px solid ${accent}`,
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ color:C.muted, fontSize:11, margin:0, marginBottom:8, letterSpacing:"0.06em", fontWeight:600 }}>
            {label.toUpperCase()}
          </p>
          <p style={{ color:C.text, fontSize:26, fontWeight:700, margin:0, fontFamily:"'JetBrains Mono',monospace" }}>
            {value}
          </p>
          {sub && <p style={{ color:accent, fontSize:11, margin:0, marginTop:4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize:22, opacity:0.7 }}>{icon}</span>
      </div>
    </div>
  );
}
