import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";
const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR"];

// ── Model result card ──────────────────────────────────────────
function ModelResult({ label, type, result, loading }) {
  const col =
    type === "unsupervised"   ? C.amber  :
    type === "selfsupervised" ? "#C77DFF": C.green;

  const anomalyCol = result?.isAnomaly ? C.red : C.green;

  return (
    <div style={{
      background: "#0A1020",
      border: `1px solid ${result
        ? (result.isAnomaly ? C.red + "44" : C.green + "44")
        : C.border}`,
      borderRadius: 12, padding: 20,
      borderTop: `3px solid ${col}`,
      transition: "all 0.3s",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16,
      }}>
        <div>
          <p style={{
            color: C.muted, fontSize: 10, margin: 0,
            letterSpacing: "0.06em", fontWeight: 600,
          }}>
            {type.toUpperCase()}
          </p>
          <h3 style={{
            color: C.text, fontSize: 14, fontWeight: 700,
            margin: 0, marginTop: 2,
          }}>{label}</h3>
        </div>

        {loading && (
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: `2px solid ${col}44`,
            borderTop: `2px solid ${col}`,
            animation: "spin 0.8s linear infinite",
          }}/>
        )}

        {result && !loading && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: result.isAnomaly ? `${C.red}22` : `${C.green}22`,
            border: `2px solid ${anomalyCol}`,
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14,
          }}>
            {result.isAnomaly ? "⚠️" : "✅"}
          </div>
        )}
      </div>

      {!result && !loading && (
        <div style={{
          color: C.muted, fontSize: 12,
          textAlign: "center", padding: "20px 0",
        }}>
          Awaiting validation...
        </div>
      )}

      {loading && (
        <div style={{
          color: col, fontSize: 12,
          textAlign: "center", padding: "20px 0",
        }}>
          Running model...
        </div>
      )}

      {result && !loading && (
        <>
          <div style={{
            display: "flex", justifyContent: "center",
            alignItems: "center", padding: "16px 0", marginBottom: 16,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 800,
              color: anomalyCol, letterSpacing: "0.1em",
              padding: "8px 24px",
              background: result.isAnomaly ? `${C.red}11` : `${C.green}11`,
              border: `1px solid ${anomalyCol}44`,
              borderRadius: 8,
            }}>
              {result.isAnomaly ? "ANOMALY DETECTED" : "VALID"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Anomaly Score", value: result.anomalyScore?.toFixed(6) },
              { label: "Threshold",     value: result.threshold?.toFixed(6) },
              { label: "Rate",          value: result.rate },
              { label: "Model",         value: result.model },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{label}</span>
                <span style={{
                  color: C.text, fontSize: 11,
                  fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                }}>
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
function ConsensusBanner({ consensus }) {
  if (!consensus) return null;

  const { isAnomaly, modelsAgreed, totalModels,
          consensus: label, alertPublished } = consensus;

  const col = modelsAgreed === 3 ? C.red  :
              modelsAgreed >= 2  ? C.amber : C.green;

  const desc = alertPublished
    ? `${modelsAgreed} of ${totalModels} models flagged — alert published to market.rates.alert`
    : `${modelsAgreed} of ${totalModels} models flagged — rate is valid`;

  return (
    <div style={{
      background: `${col}11`,
      border: `2px solid ${col}44`,
      borderRadius: 12, padding: 20, marginBottom: 24,
      display: "flex", alignItems: "center", gap: 16,
      animation: "fadeUp 0.4s ease both",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: `${col}22`, border: `2px solid ${col}`,
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>
        {isAnomaly ? "⚠️" : "✅"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          color: col, fontWeight: 800,
          fontSize: 16, letterSpacing: "0.06em",
        }}>{label}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
          {desc}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          color: col, fontSize: 24, fontWeight: 800,
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {modelsAgreed}/{totalModels}
        </div>
        <div style={{ color: C.muted, fontSize: 11 }}>models flagged</div>
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────
export default function ValidateRate({ activeNav, onNavigate, onLogout }) {
  const [instrument, setInstrument] = useState("ZAR/EUR");
  const [date, setDate]             = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rate, setRate]             = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState({});
  const [consensus, setConsensus]   = useState(null);
  const [error, setError]           = useState(null);
  const [focused, setFocused]       = useState(null);

  const handleValidate = async () => {
    if (!rate) return;

    setResults({});
    setConsensus(null);
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/market-rates/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            instrument: instrument.replace("/", ""),
            date:       date,
            rate:       parseFloat(rate),
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Validation failed — ${res.status}`);
      }

      const data = await res.json();

      // Map model results by model name
      const mapped = {};
      (data.modelResults || []).forEach(m => {
        mapped[m.model] = {
                ...m,
                isAnomaly: m.anomaly ?? m.isAnomaly
            };
      });
      setResults(mapped);

      // Set consensus from Java response
      setConsensus({
            isAnomaly:      data.anomaly ?? data.isAnomaly,
            modelsAgreed:   data.modelsAgreed,
            totalModels:    data.totalModels,
            consensus:      data.consensus,
            alertPublished: data.alertPublished,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif", color: C.text,
    }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

      <div style={{
        flex: 1, padding: "24px",
        maxWidth: 1100, margin: "0 auto",
        width: "100%", boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Validate Rate
          </h1>
          <p style={{ margin: 0, marginTop: 4, color: C.muted, fontSize: 13 }}>
            Submit a market rate for real-time validation across all
            three ML models. An alert is published if 2 or more models
            flag an anomaly.
          </p>
        </div>

        {/* Input form */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 24, marginBottom: 24,
        }}>
          <h2 style={{ margin: 0, marginBottom: 20, fontSize: 14, fontWeight: 700 }}>
            Rate Details
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 16, alignItems: "end",
          }}>

            {/* Instrument */}
            <div>
              <label style={{
                color: C.muted, fontSize: 11, fontWeight: 600,
                letterSpacing: "0.06em", display: "block", marginBottom: 6,
              }}>INSTRUMENT</label>
              <select
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                style={{
                  width: "100%", background: "#0A1020",
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "11px 14px", color: C.text, fontSize: 14,
                  outline: "none", fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer",
                }}
              >
                {INSTRUMENTS.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{
                color: C.muted, fontSize: 11, fontWeight: 600,
                letterSpacing: "0.06em", display: "block", marginBottom: 6,
              }}>DATE</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                onFocus={() => setFocused("date")}
                onBlur={() => setFocused(null)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: focused === "date" ? `${C.accent}08` : "#0A1020",
                  border: `1px solid ${focused === "date" ? C.accent : C.border}`,
                  borderRadius: 8, padding: "11px 14px",
                  color: C.text, fontSize: 14, outline: "none",
                  fontFamily: "'DM Sans',sans-serif", colorScheme: "dark",
                }}
              />
            </div>

            {/* Rate */}
            <div>
              <label style={{
                color: C.muted, fontSize: 11, fontWeight: 600,
                letterSpacing: "0.06em", display: "block", marginBottom: 6,
              }}>RATE</label>
              <input
                type="number"
                step="0.0001"
                value={rate}
                placeholder={instrument === "SOFR" ? "e.g. 3.65" : "e.g. 20.41"}
                onChange={e => setRate(e.target.value)}
                onFocus={() => setFocused("rate")}
                onBlur={() => setFocused(null)}
                onKeyDown={e => e.key === "Enter" && handleValidate()}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: focused === "rate" ? `${C.accent}08` : "#0A1020",
                  border: `1px solid ${focused === "rate" ? C.accent : C.border}`,
                  borderRadius: 8, padding: "11px 14px",
                  color: C.text, fontSize: 14, outline: "none",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              />
            </div>

            {/* Validate button */}
            <button
              onClick={handleValidate}
              disabled={!rate || loading}
              style={{
                padding: "11px 28px", borderRadius: 8, border: "none",
                background: !rate || loading
                  ? C.border
                  : `linear-gradient(135deg,${C.accent},${C.accent2})`,
                color: !rate || loading ? C.muted : "#000",
                fontSize: 13, fontWeight: 700,
                cursor: !rate || loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {loading ? "VALIDATING..." : "⚡ VALIDATE"}
            </button>
          </div>

          {/* Info strip */}
          <div style={{
            marginTop: 16, padding: "10px 14px",
            background: "#0A1020", borderRadius: 8,
            border: `1px solid ${C.border}`,
            display: "flex", gap: 24,
          }}>
            {[
              { label: "Models",               value: "K-Means · Autoencoder · RFC" },
              { label: "Consensus threshold",  value: "2 of 3 models" },
              { label: "Alert topic",          value: "market.rates.alert" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", gap: 6, alignItems: "center",
              }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{label}:</span>
                <span style={{
                  color: C.accent, fontSize: 11,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: "center", padding: "40px 0",
            color: C.muted, fontSize: 13,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.accent}`,
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}/>
            Running K-Means, Autoencoder and RFC models...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: "12px 16px",
            background: `${C.red}11`, border: `1px solid ${C.red}44`,
            borderRadius: 8, color: C.red, fontSize: 12,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Consensus banner */}
        {consensus && <ConsensusBanner consensus={consensus}/>}

        {/* Model results grid */}
        {Object.keys(results).length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
          }}>
            <ModelResult
              label="K-Means Clustering"
              type="unsupervised"
              result={results.kmeans}
              loading={false}
            />
            <ModelResult
              label="Autoencoder"
              type="selfsupervised"
              result={results.autoencoder}
              loading={false}
            />
            <ModelResult
              label="Random Forest Classifier"
              type="supervised"
              result={results.rfc}
              loading={false}
            />
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}