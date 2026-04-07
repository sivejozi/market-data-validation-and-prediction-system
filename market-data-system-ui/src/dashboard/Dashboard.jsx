import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import StatCard from "../components/StatCard";
import AlertRow from "../components/AlertRow";
import ModelBadge from "../components/ModelBadge";

export default function Dashboard({ activeNav, onNavigate, onLogout }) {
  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans',sans-serif", color:C.text,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');`}</style>

      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

      <div style={{ flex:1, padding:"24px", maxWidth:1400, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* Page header */}
        <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Market Data Dashboard</h1>
            <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
              Real-time validation and anomaly detection across FX rates and interest rate fixings
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{
              padding:"8px 16px", borderRadius:8,
              background:"transparent", border:`1px solid ${C.border}`,
              color:C.muted, fontSize:12, cursor:"pointer",
            }}>Export Report</button>
            <button onClick={() => onNavigate("validate")} style={{
              padding:"8px 16px", borderRadius:8,
              background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
              border:"none", color:"#000", fontSize:12, fontWeight:700, cursor:"pointer",
            }}>+ Validate Rate</button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
          <StatCard label="Instruments Monitored" value="3"      sub="ZAR/EUR · ZAR/USD · SOFR"  accent={C.accent} icon="📊"/>
          <StatCard label="Rates Validated Today"  value="847"   sub="↑ 12% from yesterday"       accent={C.green}  icon="✅"/>
          <StatCard label="Anomalies Detected"     value="4"     sub="2 HIGH · 1 MED · 1 LOW"     accent={C.amber}  icon="⚠️"/>
          <StatCard label="Models Active"          value="6"     sub="3 prediction · 3 validation" accent={C.accent} icon="🤖"/>
          <StatCard label="Avg Validation Latency" value="142ms" sub="p99: 380ms"                  accent={C.green}  icon="⚡"/>
        </div>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

          {/* Recent alerts */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ margin:0, fontSize:14, fontWeight:700 }}>Recent Anomaly Alerts</h2>
              <span onClick={() => onNavigate("alerts")} style={{ color:C.accent, fontSize:12, cursor:"pointer" }}>View all →</span>
            </div>
            <AlertRow instrument="SOFR"    rate="3.65%" models={["K-Means","RFC"]}              time="14:32:01"  severity="MED" />
            <AlertRow instrument="ZAR/EUR" rate="21.71" models={["K-Means","Autoencoder","RFC"]} time="09:15:44"  severity="HIGH"/>
            <AlertRow instrument="ZAR/USD" rate="19.69" models={["K-Means","RFC"]}              time="09:15:44"  severity="HIGH"/>
            <AlertRow instrument="SOFR"    rate="5.25%" models={["Autoencoder"]}                time="Yesterday" severity="LOW" />
          </div>

          {/* Model performance */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ margin:0, fontSize:14, fontWeight:700 }}>Model Performance</h2>
              <span onClick={() => onNavigate("models")} style={{ color:C.accent, fontSize:12, cursor:"pointer" }}>Details →</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              <ModelBadge name="Linear Regression"  r2="0.991" type="prediction"    />
              <ModelBadge name="Gradient Boosting"  r2="0.963" type="prediction"    />
              <ModelBadge name="Random Forest Reg." r2="0.970" type="prediction"    />
              <ModelBadge name="K-Means"            f1="—"     type="unsupervised"  />
              <ModelBadge name="Autoencoder"        f1="—"     type="selfsupervised"/>
              <ModelBadge name="RFC"                f1="0.898" type="supervised"    />
            </div>
          </div>
        </div>

        {/* Instrument status */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h2 style={{ margin:0, marginBottom:16, fontSize:14, fontWeight:700 }}>Instrument Status</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[
              { name:"ZAR/EUR", rate:"20.41", status:"VALID",   last:"14:35:00", anomalies:2, col:C.green },
              { name:"ZAR/USD", rate:"17.83", status:"VALID",   last:"14:35:00", anomalies:1, col:C.green },
              { name:"SOFR",    rate:"3.65%", status:"ANOMALY", last:"14:32:01", anomalies:4, col:C.amber },
            ].map(inst => (
              <div key={inst.name} style={{
                background:"#0A1020",
                border:`1px solid ${inst.col}44`,
                borderRadius:10, padding:16,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontWeight:700, fontSize:14, fontFamily:"'JetBrains Mono',monospace" }}>{inst.name}</span>
                  <span style={{
                    fontSize:10, color:inst.col,
                    border:`1px solid ${inst.col}44`, borderRadius:4,
                    padding:"2px 8px", letterSpacing:"0.06em", fontWeight:700,
                  }}>{inst.status}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>
                  {inst.rate}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.muted, fontSize:11 }}>Last: {inst.last}</span>
                  <span style={{ color:inst.anomalies > 0 ? C.amber : C.green, fontSize:11 }}>
                    {inst.anomalies} anomalies today
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}
