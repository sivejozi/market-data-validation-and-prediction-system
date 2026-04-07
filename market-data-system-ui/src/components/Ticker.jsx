import { C, tickers } from "../theme";

export default function Ticker() {
  const items = [...tickers, ...tickers];
  return (
    <div style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      overflow: "hidden",
      height: 36,
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        display: "flex",
        gap: 48,
        animation: "scroll 28s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {items.map((t, i) => (
          <span key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ color:C.muted, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{t.label}</span>
            <span style={{ color:C.text,  fontSize:12, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{t.val}</span>
            <span style={{ color:t.up ? C.green : C.red, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{t.chg}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  );
}
