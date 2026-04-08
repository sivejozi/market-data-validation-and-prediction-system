import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const PREDICTION_DATA = [
  { model:"Linear Regression",  zareur:0.991, zarusd:0.992, sofr:0.981 },
  { model:"Gradient Boosting",  zareur:0.753, zarusd:0.963, sofr:-0.787 },
  { model:"Random Forest Reg.", zareur:0.928, zarusd:0.970, sofr:-0.645 },
];

const VALIDATION_DATA = [
  { model:"K-Means",    zareur:245, zarusd:335, sofr:113 },
  { model:"Autoencoder",zareur:147, zarusd:176, sofr:10  },
  { model:"RFC",        zareur:241, zarusd:343, sofr:116 },
];

const F1_DATA = [
  { instrument:"ZAR/EUR", f1:0.851 },
  { instrument:"ZAR/USD", f1:0.845 },
  { instrument:"SOFR",    f1:0.898 },
];

const RADAR_DATA = [
  { metric:"Accuracy",      lr:99, gbr:87, rfr:94 },
  { metric:"Generalisation",lr:98, gbr:75, rfr:92 },
  { metric:"Consistency",   lr:97, gbr:70, rfr:90 },
  { metric:"Speed",         lr:99, gbr:80, rfr:75 },
  { metric:"Interpretability",lr:95,gbr:60,rfr:65 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:8, padding:"10px 14px",
    }}>
      <p style={{ color:C.muted, fontSize:11, margin:0, marginBottom:6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontSize:12, margin:0, fontFamily:"'JetBrains Mono',monospace" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function MetricTable({ title, rows, cols, getValue, formatValue }) {
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, overflow:"hidden",
    }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <h2 style={{ margin:0, fontSize:14, fontWeight:700 }}>{title}</h2>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#0A1020" }}>
            <th style={{ padding:"10px 16px", textAlign:"left", color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em" }}>MODEL</th>
            {cols.map(c => (
              <th key={c} style={{ padding:"10px 16px", textAlign:"right", color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.model} style={{ borderTop:`1px solid ${C.border}` }}>
              <td style={{ padding:"12px 16px", color:C.text, fontSize:13, fontWeight:600 }}>{row.model}</td>
              {cols.map(col => {
                const val = getValue(row, col);
                const formatted = formatValue(val);
                const color = typeof val === "number" && val < 0 ? C.red : typeof val === "number" && val > 0.9 ? C.green : C.text;
                return (
                  <td key={col} style={{ padding:"12px 16px", textAlign:"right", color, fontSize:13, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Models({ activeNav, onNavigate, onLogout }) {
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
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Model Performance</h1>
          <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
            Detailed metrics across all 6 ML models and 3 instruments
          </p>
        </div>

        {/* R² comparison chart */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, padding:24, marginBottom:20,
        }}>
          <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700 }}>
            Prediction Model R² Score Comparison
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={PREDICTION_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="model" stroke={C.muted} tick={{ fontSize:11 }}/>
              <YAxis stroke={C.muted} tick={{ fontSize:11 }} domain={[-1, 1]}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              <Bar dataKey="zareur" name="ZAR/EUR" fill={C.accent}  radius={[4,4,0,0]}/>
              <Bar dataKey="zarusd" name="ZAR/USD" fill={C.green}   radius={[4,4,0,0]}/>
              <Bar dataKey="sofr"   name="SOFR"    fill={C.amber}   radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

          {/* Prediction R² table */}
          <MetricTable
            title="Prediction Models — R² Score"
            rows={PREDICTION_DATA}
            cols={["ZAR/EUR","ZAR/USD","SOFR"]}
            getValue={(row, col) => col==="ZAR/EUR" ? row.zareur : col==="ZAR/USD" ? row.zarusd : row.sofr}
            formatValue={(val) => val?.toFixed(3)}
          />

          {/* Validation anomaly counts */}
          <MetricTable
            title="Validation Models — Anomaly Count"
            rows={VALIDATION_DATA}
            cols={["ZAR/EUR","ZAR/USD","SOFR"]}
            getValue={(row, col) => col==="ZAR/EUR" ? row.zareur : col==="ZAR/USD" ? row.zarusd : row.sofr}
            formatValue={(val) => val}
          />
        </div>

        {/* RFC F1 + Radar row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* F1 scores */}
          <div style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:12, padding:24,
          }}>
            <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700 }}>
              RFC F1 Score by Instrument
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={F1_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="instrument" stroke={C.muted} tick={{ fontSize:11 }}/>
                <YAxis stroke={C.muted} tick={{ fontSize:11 }} domain={[0.8, 1.0]}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="f1" name="F1 Score" fill={C.green} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart */}
          <div style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:12, padding:24,
          }}>
            <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700 }}>
              Prediction Model Comparison (ZAR/EUR)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke={C.border}/>
                <PolarAngleAxis dataKey="metric" tick={{ fill:C.muted, fontSize:10 }}/>
                <Radar name="Linear Regression"  dataKey="lr"  stroke={C.accent} fill={C.accent} fillOpacity={0.2}/>
                <Radar name="Gradient Boosting"  dataKey="gbr" stroke={C.red}    fill={C.red}    fillOpacity={0.1}/>
                <Radar name="Random Forest Reg." dataKey="rfr" stroke={C.green}  fill={C.green}  fillOpacity={0.1}/>
                <Legend/>
                <Tooltip content={<CustomTooltip/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      <Footer/>
    </div>
  );
}
