import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const ALL_ALERTS = [
  { id:1,  instrument:"ZAR/EUR", rate:"21.71",  models:["K-Means","Autoencoder","RFC"], time:"2025-04-09 09:15:44", severity:"HIGH",  anomalyScore:"2.893", threshold:"2.630" },
  { id:2,  instrument:"ZAR/USD", rate:"19.69",  models:["K-Means","RFC"],              time:"2025-04-09 09:15:44", severity:"HIGH",  anomalyScore:"2.712", threshold:"2.459" },
  { id:3,  instrument:"SOFR",    rate:"3.65%",  models:["K-Means","RFC"],              time:"2026-03-17 14:32:01", severity:"MED",   anomalyScore:"1.038", threshold:"0.889" },
  { id:4,  instrument:"ZAR/EUR", rate:"22.03",  models:["K-Means","Autoencoder","RFC"], time:"2025-04-11 09:15:44", severity:"HIGH",  anomalyScore:"3.218", threshold:"2.630" },
  { id:5,  instrument:"SOFR",    rate:"5.25%",  models:["Autoencoder"],                time:"2019-09-17 00:00:00", severity:"LOW",   anomalyScore:"0.0228", threshold:"0.0011" },
  { id:6,  instrument:"ZAR/USD", rate:"10.71",  models:["K-Means"],                    time:"2008-10-28 00:00:00", severity:"MED",   anomalyScore:"2.591", threshold:"2.459" },
  { id:7,  instrument:"ZAR/EUR", rate:"11.93",  models:["K-Means","RFC"],              time:"2008-10-17 00:00:00", severity:"HIGH",  anomalyScore:"2.891", threshold:"2.630" },
  { id:8,  instrument:"SOFR",    rate:"0.26%",  models:["Autoencoder"],                time:"2020-03-16 00:00:00", severity:"MED",   anomalyScore:"0.0015", threshold:"0.0011" },
  { id:9,  instrument:"ZAR/EUR", rate:"20.87",  models:["Autoencoder"],                time:"2020-04-06 00:00:00", severity:"LOW",   anomalyScore:"0.0000783", threshold:"0.0000350" },
  { id:10, instrument:"ZAR/USD", rate:"10.49",  models:["K-Means","RFC"],              time:"2002-08-28 00:00:00", severity:"MED",   anomalyScore:"2.810", threshold:"2.459" },
];

const SEVERITIES = ["ALL", "HIGH", "MED", "LOW"];
const INSTRUMENTS = ["ALL", "ZAR/EUR", "ZAR/USD", "SOFR"];

function SeverityBadge({ severity }) {
  const col = severity === "HIGH" ? C.red : severity === "MED" ? C.amber : C.green;
  return (
    <span style={{
      fontSize:10, fontWeight:700, color:col,
      border:`1px solid ${col}44`, borderRadius:4,
      padding:"2px 8px", letterSpacing:"0.06em",
    }}>{severity}</span>
  );
}

function ModelTag({ model }) {
  const col =
    model === "K-Means"    ? C.amber  :
    model === "Autoencoder"? "#C77DFF": C.green;
  return (
    <span style={{
      fontSize:10, color:col,
      border:`1px solid ${col}33`, borderRadius:4,
      padding:"2px 6px", marginRight:4,
    }}>{model}</span>
  );
}

export default function Alerts({ activeNav, onNavigate, onLogout }) {
  const [severity, setSeverity]   = useState("ALL");
  const [instrument, setInstrument] = useState("ALL");
  const [search, setSearch]       = useState("");

  const filtered = ALL_ALERTS.filter(a => {
    if (severity   !== "ALL" && a.severity   !== severity)   return false;
    if (instrument !== "ALL" && a.instrument !== instrument) return false;
    if (search && !a.instrument.toLowerCase().includes(search.toLowerCase()) &&
        !a.rate.includes(search)) return false;
    return true;
  });

  const counts = {
    HIGH: ALL_ALERTS.filter(a => a.severity === "HIGH").length,
    MED:  ALL_ALERTS.filter(a => a.severity === "MED").length,
    LOW:  ALL_ALERTS.filter(a => a.severity === "LOW").length,
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans',sans-serif", color:C.text,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');`}</style>
      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

      <div style={{ flex:1, padding:"24px", maxWidth:1400, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Anomaly Alerts</h1>
          <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
            All anomaly alerts published to <span style={{ color:C.accent, fontFamily:"'JetBrains Mono',monospace" }}>market.rates.alert</span>
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ display:"flex", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Alerts", value:ALL_ALERTS.length, col:C.accent },
            { label:"High",         value:counts.HIGH,       col:C.red   },
            { label:"Medium",       value:counts.MED,        col:C.amber },
            { label:"Low",          value:counts.LOW,        col:C.green },
          ].map(({ label, value, col }) => (
            <div key={label} style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"16px 24px",
              borderLeft:`3px solid ${col}`, flex:1,
            }}>
              <p style={{ color:C.muted, fontSize:11, margin:0, marginBottom:4, letterSpacing:"0.06em", fontWeight:600 }}>
                {label.toUpperCase()}
              </p>
              <p style={{ color:C.text, fontSize:24, fontWeight:700, margin:0, fontFamily:"'JetBrains Mono',monospace" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, padding:16, marginBottom:20,
          display:"flex", gap:16, alignItems:"center", flexWrap:"wrap",
        }}>
          {/* Search */}
          <input
            placeholder="Search instrument or rate..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background:"#0A1020", border:`1px solid ${C.border}`,
              borderRadius:8, padding:"8px 14px",
              color:C.text, fontSize:13, outline:"none",
              fontFamily:"'DM Sans',sans-serif", width:220,
            }}
          />

          {/* Severity filter */}
          <div style={{ display:"flex", gap:6 }}>
            {SEVERITIES.map(s => (
              <button key={s} onClick={() => setSeverity(s)} style={{
                padding:"6px 14px", borderRadius:7, border:"none",
                background: severity===s ? `${C.accent}22` : "#0A1020",
                color: severity===s ? C.accent : C.muted,
                fontSize:12, fontWeight:600, cursor:"pointer",
                border: severity===s ? `1px solid ${C.accent}44` : `1px solid ${C.border}`,
              }}>{s}</button>
            ))}
          </div>

          {/* Instrument filter */}
          <select
            value={instrument}
            onChange={e => setInstrument(e.target.value)}
            style={{
              background:"#0A1020", border:`1px solid ${C.border}`,
              borderRadius:8, padding:"8px 14px",
              color:C.text, fontSize:13, outline:"none",
              fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
            }}
          >
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <span style={{ color:C.muted, fontSize:12, marginLeft:"auto" }}>
            {filtered.length} of {ALL_ALERTS.length} alerts
          </span>
        </div>

        {/* Alerts table */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, overflow:"hidden",
        }}>
          {/* Table header */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"80px 120px 100px 1fr 180px 140px 80px",
            padding:"12px 20px",
            borderBottom:`1px solid ${C.border}`,
            background:"#0A1020",
          }}>
            {["Severity","Instrument","Rate","Flagged By","Anomaly Score","Time",""].map(h => (
              <span key={h} style={{ color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em" }}>
                {h.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {filtered.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", color:C.muted, fontSize:13 }}>
              No alerts match your filters
            </div>
          ) : (
            filtered.map((alert, i) => (
              <div key={alert.id} style={{
                display:"grid",
                gridTemplateColumns:"80px 120px 100px 1fr 180px 140px 80px",
                padding:"14px 20px",
                borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none",
                alignItems:"center",
                transition:"background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#0D1830"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <div><SeverityBadge severity={alert.severity}/></div>
                <span style={{ color:C.text, fontWeight:600, fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>
                  {alert.instrument}
                </span>
                <span style={{ color:C.accent, fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>
                  {alert.rate}
                </span>
                <div>{alert.models.map(m => <ModelTag key={m} model={m}/>)}</div>
                <div>
                  <span style={{ color:C.text, fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                    {alert.anomalyScore}
                  </span>
                  <span style={{ color:C.muted, fontSize:11 }}> / {alert.threshold}</span>
                </div>
                <span style={{ color:C.muted, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
                  {alert.time}
                </span>
                <button style={{
                  padding:"4px 12px", borderRadius:6, border:`1px solid ${C.border}`,
                  background:"transparent", color:C.muted, fontSize:11, cursor:"pointer",
                }}>Details</button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
