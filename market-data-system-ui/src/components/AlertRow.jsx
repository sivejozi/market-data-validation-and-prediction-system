import { C } from "../theme";

export default function AlertRow({ instrument, rate, models, time, severity }) {
  const col = severity === "HIGH" ? C.red : severity === "MED" ? C.amber : C.green;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "12px 16px",
      background: "#0A1020",
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      marginBottom: 8,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: col, flexShrink: 0,
        boxShadow: `0 0 6px ${col}`,
      }}/>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ color:C.text, fontSize:13, fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>
            {instrument}
          </span>
          <span style={{ color:C.muted, fontSize:12 }}>rate:</span>
          <span style={{ color:C.accent, fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{rate}</span>
        </div>
        <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
          Flagged by: {models.join(", ")}
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{
          fontSize:10, fontWeight:700, color:col,
          border:`1px solid ${col}44`, borderRadius:4,
          padding:"2px 8px", letterSpacing:"0.06em",
        }}>{severity}</div>
        <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>{time}</div>
      </div>
    </div>
  );
}
