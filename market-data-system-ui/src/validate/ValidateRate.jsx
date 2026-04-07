import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR"];

const API_BASE = "http://localhost:8000";

const endpoints = {
  kmeans:      `${API_BASE}/kmeans/validate-rate`,
  autoencoder: `${API_BASE}/autoencoder/validate-rate`,
  rfc:         `${API_BASE}/random-forest-classifier/validate-rate`,
};

// ── Result card per model ──────────────────────────────────────
function ModelResult({ model, label, type, result, loading }) {
  const col =
    type === "unsupervised"   ? C.amber  :
    type === "selfsupervised" ? "#C77DFF": C.green;

  const anomalyCol = result?.isAnomaly ? C.red : C.green;

  return (
    <div style={{
      background: "#0A1020",
      border: `1px solid ${result ? (result.isAnomaly ? C.red + "44" : C.green + "44") : C.border}`,
      borderRadius: 12,
      padding: 20,
      borderTop: `3px solid ${col}`,
      transition: "all 0.3s",
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <p style={{ color:C.muted, fontSize:10, margin:0, letterSpacing:"0.06em", fontWeight:600 }}>
            {type.toUpperCase()}
          </p>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:700, margin:0, marginTop:2 }}>{label}</h3>
        </div>
        {loading && (
          <div style={{
            width:20, height:20, borderRadius:"50%",
            border:`2px solid ${col}44`,
            borderTop:`2px solid ${col}`,
            animation:"spin 0.8s linear infinite",
          }}/>
        )}
        {result && !loading && (
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background: result.isAnomaly ? `${C.red}22` : `${C.green}22`,
            border:`2px solid ${anomalyCol}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14,
          }}>
            {result.isAnomaly ? "⚠️" : "✅"}
          </div>
        )}
      </div>

      {/* Result */}
      {!result && !loading && (
        <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>
          Awaiting validation...
        </div>
      )}

      {loading && (
        <div style={{ color:col, fontSize:12, textAlign:"center", padding:"20px 0" }}>
          Running model...
        </div>
      )}

      {result && !loading && (
        <>
          <div style={{
            display:"flex", justifyContent:"center", alignItems:"center",
            padding:"16px 0", marginBottom:16,
          }}>
            <div style={{
              fontSize:18, fontWeight:800,
              color: anomalyCol,
              letterSpacing:"0.1em",
              padding:"8px 24px",
              background: result.isAnomaly ? `${C.red}11` : `${C.green}11`,
              border:`1px solid ${anomalyCol}44`,
              borderRadius:8,
            }}>
              {result.isAnomaly ? "ANOMALY DETECTED" : "VALID"}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label:"Anomaly Score", value: result.anomalyScore?.toFixed(6) },
              { label:"Threshold",     value: result.threshold?.toFixed(6) },
              { label:"Rate",          value: result.rate },
              { label:"Date",          value: result.date?.split("T")[0] || result.date?.split(" ")[0] },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.muted, fontSize:11 }}>{label}</span>
                <span style={{ color:C.text, fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Consensus banner ───────────────────────────────────────────
function ConsensusBanner({ results }) {
  if (!results || Object.keys(results).length < 3) return null;

  const flags = Object.values(results).filter(r => r?.isAnomaly).length;
  const isAnomaly = flags >= 2;
  const col = flags === 3 ? C.red : flags === 2 ? C.amber : C.green;
  const label = flags === 3 ? "HIGH CONFIDENCE ANOMALY" : flags === 2 ? "PROBABLE ANOMALY" : "VALID RATE";
  const desc  = flags === 3 ? "All 3 models agree — alert published to market.rates.alert"
              : flags === 2 ? "2 of 3 models flagged — alert published to market.rates.alert"
              : "All models agree — rate is valid";

  return (
    <div style={{
      background: `${col}11`,
      border:`2px solid ${col}44`,
      borderRadius:12, padding:20,
      marginBottom:24,
      display:"flex", alignItems:"center", gap:16,
      animation:"fadeUp 0.4s ease both",
    }}>
      <div style={{
        width:48, height:48, borderRadius:"50%",
        background:`${col}22`, border:`2px solid ${col}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, flexShrink:0,
      }}>
        {isAnomaly ? "⚠️" : "✅"}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ color:col, fontWeight:800, fontSize:16, letterSpacing:"0.06em" }}>{label}</div>
        <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>{desc}</div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ color:col, fontSize:24, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
          {flags}/3
        </div>
        <div style={{ color:C.muted, fontSize:11 }}>models flagged</div>
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────
export default function ValidateRate({ activeNav, onNavigate, onLogout }) {
  const [instrument, setInstrument] = useState("ZAR/EUR");
  const [date, setDate]             = useState(new Date().toISOString().split("T")[0]);
  const [rate, setRate]             = useState("");
  const [loading, setLoading]       = useState({});
  const [results, setResults]       = useState({});
  const [error, setError]           = useState(null);
  const [focused, setFocused]       = useState(null);

  const handleValidate = async () => {
    if (!rate) return;
    setResults({});
    setError(null);

    // Map instrument display name to API currencyPair
    const currencyPair = instrument.replace("/", "");

    // Run all 3 models in parallel
    const models = [
      { key:"kmeans",      url: endpoints.kmeans      },
      { key:"autoencoder", url: endpoints.autoencoder },
      { key:"rfc",         url: endpoints.rfc         },
    ];

    // Set all to loading
    setLoading({ kmeans:true, autoencoder:true, rfc:true });

    // Call each endpoint
    await Promise.all(models.map(async ({ key, url }) => {
      try {
        // Build request — send minimal rates for demo
        // In production this would fetch last 30 days from DB
        const mockRates = Array.from({ length: 30 }, (_, i) => ({
          currencyPair,
          date: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
          rate: parseFloat(rate) + (Math.random() - 0.5) * 0.5,
          lag1: parseFloat(rate),
          lag7: parseFloat(rate),
          rollingMean7: parseFloat(rate),
          rollingStd7: 0.1,
          rateScaled: 0.5,
        }));

        // Add today's rate as last item
        mockRates.push({
          currencyPair,
          date: new Date(date).toISOString(),
          rate: parseFloat(rate),
          lag1: parseFloat(rate),
          lag7: parseFloat(rate),
          rollingMean7: parseFloat(rate),
          rollingStd7: 0.1,
          rateScaled: 0.5,
        });

        const body = key === "kmeans"
          ? { currencyPair, rates: mockRates, numClusters:3, anomalyThresholdMultiplier:2.0 }
          : key === "autoencoder"
          ? { currencyPair, rates: mockRates, epochs:50, batchSize:16, anomalyThresholdMultiplier:2.0 }
          : { currencyPair, rates: mockRates, numClusters:3, anomalyThresholdMultiplier:2.0, nEstimators:200, randomState:42, testSize:0.2 };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        setResults(prev => ({ ...prev, [key]: data }));
      } catch (err) {
        setResults(prev => ({ ...prev, [key]: { error: err.message } }));
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    }));
  };

  const allDone = Object.keys(results).length === 3 &&
                  Object.values(loading).every(v => !v);

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans',sans-serif", color:C.text,
    }}>
      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

      <div style={{ flex:1, padding:"24px", maxWidth:1100, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* Page header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Validate Rate</h1>
          <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
            Submit a market rate for real-time validation across all three ML models.
            An alert is published if 2 or more models flag an anomaly.
          </p>
        </div>

        {/* Input form */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:12, padding:24, marginBottom:24,
        }}>
          <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700 }}>Rate Details</h2>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:16, alignItems:"end" }}>

            {/* Instrument */}
            <div>
              <label style={{ color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                INSTRUMENT
              </label>
              <select
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                style={{
                  width:"100%", background:"#0A1020",
                  border:`1px solid ${C.border}`, borderRadius:8,
                  padding:"11px 14px", color:C.text, fontSize:14,
                  outline:"none", fontFamily:"'DM Sans',sans-serif",
                  cursor:"pointer",
                }}
              >
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                onFocus={() => setFocused("date")}
                onBlur={() => setFocused(null)}
                style={{
                  width:"100%", boxSizing:"border-box",
                  background: focused==="date" ? `${C.accent}08` : "#0A1020",
                  border:`1px solid ${focused==="date" ? C.accent : C.border}`,
                  borderRadius:8, padding:"11px 14px",
                  color:C.text, fontSize:14, outline:"none",
                  fontFamily:"'DM Sans',sans-serif",
                  colorScheme:"dark",
                }}
              />
            </div>

            {/* Rate */}
            <div>
              <label style={{ color:C.muted, fontSize:11, fontWeight:600, letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                RATE
              </label>
              <input
                type="number"
                step="0.0001"
                value={rate}
                placeholder={instrument === "SOFR" ? "e.g. 3.65" : "e.g. 20.41"}
                onChange={e => setRate(e.target.value)}
                onFocus={() => setFocused("rate")}
                onBlur={() => setFocused(null)}
                style={{
                  width:"100%", boxSizing:"border-box",
                  background: focused==="rate" ? `${C.accent}08` : "#0A1020",
                  border:`1px solid ${focused==="rate" ? C.accent : C.border}`,
                  borderRadius:8, padding:"11px 14px",
                  color:C.text, fontSize:14, outline:"none",
                  fontFamily:"'JetBrains Mono',monospace",
                }}
              />
            </div>

            {/* Validate button */}
            <button
              onClick={handleValidate}
              disabled={!rate || Object.values(loading).some(v => v)}
              style={{
                padding:"11px 28px", borderRadius:8, border:"none",
                background: !rate || Object.values(loading).some(v => v)
                  ? C.border
                  : `linear-gradient(135deg,${C.accent},${C.accent2})`,
                color: !rate ? C.muted : "#000",
                fontSize:13, fontWeight:700, cursor: !rate ? "not-allowed" : "pointer",
                letterSpacing:"0.04em", whiteSpace:"nowrap",
                transition:"all 0.2s",
              }}
            >
              {Object.values(loading).some(v => v) ? "VALIDATING..." : "⚡ VALIDATE"}
            </button>
          </div>

          {/* Info strip */}
          <div style={{
            marginTop:16, padding:"10px 14px",
            background:"#0A1020", borderRadius:8,
            border:`1px solid ${C.border}`,
            display:"flex", gap:24,
          }}>
            {[
              { label:"Models", value:"K-Means · Autoencoder · RFC" },
              { label:"Consensus threshold", value:"2 of 3 models" },
              { label:"Alert topic", value:"market.rates.alert" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ color:C.muted, fontSize:11 }}>{label}:</span>
                <span style={{ color:C.accent, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consensus banner */}
        {allDone && <ConsensusBanner results={results}/>}

        {/* Model results grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <ModelResult
            model="kmeans"
            label="K-Means Clustering"
            type="unsupervised"
            result={results.kmeans}
            loading={loading.kmeans}
          />
          <ModelResult
            model="autoencoder"
            label="Autoencoder"
            type="selfsupervised"
            result={results.autoencoder}
            loading={loading.autoencoder}
          />
          <ModelResult
            model="rfc"
            label="Random Forest Classifier"
            type="supervised"
            result={results.rfc}
            loading={loading.rfc}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop:16, padding:"12px 16px",
            background:`${C.red}11`, border:`1px solid ${C.red}44`,
            borderRadius:8, color:C.red, fontSize:12,
          }}>
            {error}
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}
