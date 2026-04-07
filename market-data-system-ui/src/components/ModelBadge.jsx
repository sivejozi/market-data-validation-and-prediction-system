import { C } from "../theme";

export default function ModelBadge({ name, r2, f1, type }) {
  const col =
    type === "prediction"     ? C.accent :
    type === "unsupervised"   ? C.amber  :
    type === "selfsupervised" ? "#C77DFF": C.green;

  return (
    <div style={{
      background: "#0A1020",
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "14px 16px",
      borderTop: `2px solid ${col}`,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ color:C.text, fontSize:12, fontWeight:600 }}>{name}</span>
        <span style={{
          fontSize:9, color:col,
          border:`1px solid ${col}44`, borderRadius:4,
          padding:"1px 6px", letterSpacing:"0.06em",
        }}>{type.toUpperCase()}</span>
      </div>
      {r2 && (
        <div style={{ color:C.muted, fontSize:11 }}>
          R² <span style={{ color:col, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{r2}</span>
        </div>
      )}
      {f1 && (
        <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
          F1 <span style={{ color:col, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{f1}</span>
        </div>
      )}
    </div>
  );
}
