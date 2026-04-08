import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter, ComposedChart } from "recharts";

// Sample historical data points
const generateData = (instrument) => {
  const data = {
    "ZAR/EUR": [
      { date:"2000", rate:6.5,  anomaly:false },
      { date:"2001", rate:8.2,  anomaly:false },
      { date:"2002", rate:10.5, anomaly:true  },
      { date:"2003", rate:9.1,  anomaly:false },
      { date:"2004", rate:8.5,  anomaly:false },
      { date:"2005", rate:7.8,  anomaly:false },
      { date:"2006", rate:9.2,  anomaly:false },
      { date:"2007", rate:10.1, anomaly:false },
      { date:"2008", rate:13.5, anomaly:true  },
      { date:"2009", rate:11.2, anomaly:false },
      { date:"2010", rate:9.8,  anomaly:false },
      { date:"2011", rate:10.5, anomaly:false },
      { date:"2012", rate:10.8, anomaly:false },
      { date:"2013", rate:12.1, anomaly:true  },
      { date:"2014", rate:14.2, anomaly:false },
      { date:"2015", rate:15.8, anomaly:false },
      { date:"2016", rate:17.2, anomaly:false },
      { date:"2017", rate:15.1, anomaly:false },
      { date:"2018", rate:16.8, anomaly:false },
      { date:"2019", rate:15.9, anomaly:false },
      { date:"2020", rate:19.8, anomaly:true  },
      { date:"2021", rate:17.5, anomaly:false },
      { date:"2022", rate:17.1, anomaly:false },
      { date:"2023", rate:20.2, anomaly:false },
      { date:"2024", rate:20.1, anomaly:false },
      { date:"2025", rate:21.7, anomaly:true  },
    ],
    "ZAR/USD": [
      { date:"2000", rate:6.9,  anomaly:false },
      { date:"2001", rate:8.6,  anomaly:false },
      { date:"2002", rate:10.5, anomaly:true  },
      { date:"2003", rate:7.5,  anomaly:false },
      { date:"2004", rate:6.4,  anomaly:false },
      { date:"2005", rate:6.3,  anomaly:false },
      { date:"2006", rate:6.8,  anomaly:false },
      { date:"2007", rate:7.1,  anomaly:false },
      { date:"2008", rate:10.2, anomaly:true  },
      { date:"2009", rate:8.4,  anomaly:false },
      { date:"2010", rate:7.3,  anomaly:false },
      { date:"2011", rate:8.1,  anomaly:false },
      { date:"2012", rate:8.5,  anomaly:false },
      { date:"2013", rate:10.2, anomaly:true  },
      { date:"2014", rate:10.8, anomaly:false },
      { date:"2015", rate:13.9, anomaly:false },
      { date:"2016", rate:15.8, anomaly:false },
      { date:"2017", rate:13.5, anomaly:false },
      { date:"2018", rate:15.5, anomaly:false },
      { date:"2019", rate:14.7, anomaly:false },
      { date:"2020", rate:18.1, anomaly:true  },
      { date:"2021", rate:15.2, anomaly:false },
      { date:"2022", rate:17.2, anomaly:false },
      { date:"2023", rate:18.9, anomaly:false },
      { date:"2024", rate:18.3, anomaly:false },
      { date:"2025", rate:19.7, anomaly:true  },
    ],
    "SOFR": [
      { date:"2018", rate:1.91, anomaly:false },
      { date:"2019", rate:2.35, anomaly:true  },
      { date:"2020", rate:0.09, anomaly:true  },
      { date:"2021", rate:0.05, anomaly:false },
      { date:"2022", rate:3.05, anomaly:false },
      { date:"2023", rate:5.30, anomaly:false },
      { date:"2024", rate:5.33, anomaly:false },
      { date:"2025", rate:4.30, anomaly:false },
      { date:"2026", rate:3.65, anomaly:false },
    ],
  };
  return data[instrument] || [];
};

const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:8, padding:"10px 14px",
    }}>
      <p style={{ color:C.muted, fontSize:11, margin:0, marginBottom:4 }}>{label}</p>
      <p style={{ color:C.accent, fontSize:14, fontWeight:700, margin:0, fontFamily:"'JetBrains Mono',monospace" }}>
        Rate: {d?.rate}
      </p>
      {d?.anomaly && (
        <p style={{ color:C.red, fontSize:11, margin:0, marginTop:4 }}>⚠️ Anomaly detected</p>
      )}
    </div>
  );
};

export default function Historical({ activeNav, onNavigate, onLogout }) {
  const [instrument, setInstrument] = useState("ZAR/EUR");
  const data = generateData(instrument);
  const anomalies = data.filter(d => d.anomaly);

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
        <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Historical Analysis</h1>
            <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
              Anomaly detection history and rate trends per instrument
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {INSTRUMENTS.map(i => (
              <button key={i} onClick={() => setInstrument(i)} style={{
                padding:"8px 16px", borderRadius:8, border:"none",
                background: instrument===i
                  ? `linear-gradient(135deg,${C.accent},${C.accent2})`
                  : `${C.surface}`,
                border: instrument===i ? "none" : `1px solid ${C.border}`,
                color: instrument===i ? "#000" : C.muted,
                fontSize:13, fontWeight:700, cursor:"pointer",
                fontFamily:"'JetBrains Mono',monospace",
              }}>{i}</button>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ display:"flex", gap:16, marginBottom:24 }}>
          {[
            { label:"Data Points",       value:data.length,      col:C.accent },
            { label:"Anomalies Detected", value:anomalies.length, col:C.red   },
            { label:"Anomaly Rate",       value:`${((anomalies.length/data.length)*100).toFixed(1)}%`, col:C.amber },
            { label:"Latest Rate",        value:data[data.length-1]?.rate, col:C.green },
          ].map(({ label, value, col }) => (
            <div key={label} style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"16px 24px",
              borderLeft:`3px solid ${col}`, flex:1,
            }}>
              <p style={{ color:C.muted, fontSize:11, margin:0, marginBottom:4, letterSpacing:"0.06em", fontWeight:600 }}>
                {label.toUpperCase()}
              </p>
              <p style={{ color:C.text, fontSize:22, fontWeight:700, margin:0, fontFamily:"'JetBrains Mono',monospace" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, padding:24, marginBottom:20,
        }}>
          <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700 }}>
            {instrument} Rate History with Anomaly Flags
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize:11 }}/>
              <YAxis stroke={C.muted} tick={{ fontSize:11 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              <Line
                type="monotone"
                dataKey="rate"
                stroke={C.accent}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.anomaly) {
                    return <circle key={cx} cx={cx} cy={cy} r={6} fill={C.red} stroke={C.red} strokeWidth={2}/>;
                  }
                  return <circle key={cx} cx={cx} cy={cy} r={3} fill={C.accent} strokeWidth={0}/>;
                }}
                name="Rate"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:C.accent }}/>
              <span style={{ color:C.muted, fontSize:11 }}>Normal rate</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:C.red }}/>
              <span style={{ color:C.muted, fontSize:11 }}>Anomaly detected</span>
            </div>
          </div>
        </div>

        {/* Anomaly events table */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, padding:20,
        }}>
          <h2 style={{ margin:0, marginBottom:16, fontSize:14, fontWeight:700 }}>
            Detected Anomaly Events — {instrument}
          </h2>
          <div style={{
            display:"grid",
            gridTemplateColumns:"100px 1fr 1fr",
            padding:"10px 16px",
            borderBottom:`1px solid ${C.border}`,
            background:"#0A1020",
            borderRadius:"8px 8px 0 0",
          }}>
            {["Year","Rate","Event Context"].map(h => (
              <span key={h} style={{ color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em" }}>
                {h.toUpperCase()}
              </span>
            ))}
          </div>
          {anomalies.map((a, i) => (
            <div key={a.date} style={{
              display:"grid",
              gridTemplateColumns:"100px 1fr 1fr",
              padding:"12px 16px",
              borderBottom: i < anomalies.length-1 ? `1px solid ${C.border}` : "none",
              alignItems:"center",
            }}>
              <span style={{ color:C.text, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                {a.date}
              </span>
              <span style={{ color:C.red, fontFamily:"'JetBrains Mono',monospace" }}>
                {a.rate}
              </span>
              <span style={{ color:C.muted, fontSize:12 }}>
                {a.date === "2002" ? "ZAR currency crisis" :
                 a.date === "2008" ? "Global financial crisis" :
                 a.date === "2013" ? "EM selloff — Fed tapering" :
                 a.date === "2019" ? "US repo market stress" :
                 a.date === "2020" ? "COVID-19 market shock" :
                 a.date === "2025" ? "April 2025 ZAR spike" : "Anomalous rate movement"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
