import { useState, useEffect } from "react";
import { C } from "../theme";
import Ticker from "./Ticker";

const navItems = [
  { id:"dashboard",  label:"Dashboard",  icon:"▦" },
  { id:"validate",   label:"Validate",   icon:"⚡" },
  { id:"historical", label:"Historical", icon:"📈" },
  { id:"models",     label:"Models",     icon:"🤖" },
  { id:"alerts",     label:"Alerts",     icon:"🔔" },
  { id:"settings",   label:"Settings",   icon:"⚙️" },
];

export default function NavBar({ activeNav, onNavigate, onLogout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Ticker />
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:56,
        background:`${C.surface}EE`,
        borderBottom:`1px solid ${C.border}`,
        backdropFilter:"blur(12px)",
        position:"sticky", top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:30, height:30, borderRadius:7,
            background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:900, color:"#000",
          }}>M</div>
          <span style={{ fontWeight:700, fontSize:14, letterSpacing:"0.02em", color:C.text }}>
            MarketGuard
          </span>
          <span style={{
            fontSize:9, color:C.accent,
            border:`1px solid ${C.accent}44`, borderRadius:4,
            padding:"2px 6px", letterSpacing:"0.08em",
          }}>ML VALIDATION</span>
        </div>

        {/* Nav items */}
        <div style={{ display:"flex", gap:4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => onNavigate(n.id)} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"6px 14px", borderRadius:7, border:"none",
              background: activeNav===n.id ? `${C.accent}18` : "transparent",
              color: activeNav===n.id ? C.accent : C.muted,
              fontSize:12, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s",
              borderBottom: activeNav===n.id ? `2px solid ${C.accent}` : "2px solid transparent",
            }}>
              <span style={{ fontSize:11 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ color:C.muted, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
            {time.toLocaleTimeString("en-ZA", { hour12:false })} SAST
          </span>
          <div style={{
            width:8, height:8, borderRadius:"50%",
            background:C.green, boxShadow:`0 0 8px ${C.green}`,
          }}/>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:`linear-gradient(135deg,${C.accent}44,${C.accent2}44)`,
            border:`1px solid ${C.accent}44`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, cursor:"pointer", color:C.text,
          }} onClick={onLogout}>SJ</div>
        </div>
      </div>
    </>
  );
}
