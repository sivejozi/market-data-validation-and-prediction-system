import { useState, useEffect } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";
const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR"];

// Map display name to API instrument param
const INSTRUMENT_MAP = {
  "ZAR/EUR": "ZAREUR",
  "ZAR/USD": "ZARUSD",
  "SOFR":    "SOFR",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "10px 14px",
    }}>
      <p style={{ color: C.muted, fontSize: 11, margin: 0, marginBottom: 4 }}>
        {d?.date?.split(" ")[0]}
      </p>
      <p style={{
        color: C.accent, fontSize: 14, fontWeight: 700,
        margin: 0, fontFamily: "'JetBrains Mono',monospace",
      }}>
        Rate: {d?.rate}
      </p>
      <p style={{ color: C.muted, fontSize: 11, margin: 0, marginTop: 4 }}>
        MA7: {d?.rollingMean7?.toFixed(4)}
      </p>
      <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>
        Volatility: {d?.rollingStd7?.toFixed(4)}
      </p>
    </div>
  );
};

function StatCard({ label, value, col }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "16px 20px",
      borderLeft: `3px solid ${col}`, flex: 1,
    }}>
      <p style={{
        color: C.muted, fontSize: 11, margin: 0,
        marginBottom: 4, letterSpacing: "0.06em", fontWeight: 600,
      }}>
        {label.toUpperCase()}
      </p>
      <p style={{
        color: C.text, fontSize: 20, fontWeight: 700,
        margin: 0, fontFamily: "'JetBrains Mono',monospace",
      }}>
        {value}
      </p>
    </div>
  );
}

export default function Historical({ activeNav, onNavigate, onLogout }) {
  const [instrument, setInstrument] = useState("SOFR");
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchRates = async (inst) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const token = localStorage.getItem("token");
      const param = INSTRUMENT_MAP[inst] || inst;

      const res = await fetch(
        `${API_BASE}/api/market-rates/search?instrument=${param}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type":  "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch rates — ${res.status}`);

      const json = await res.json();
      setData(json);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(instrument);
  }, [instrument]);

  // ── Derived stats ──────────────────────────────────────────
  const rates     = data.map(d => d.rate);
  const latest    = data[data.length - 1];
  const earliest  = data[0];
  const minRate   = rates.length ? Math.min(...rates).toFixed(4) : "—";
  const maxRate   = rates.length ? Math.max(...rates).toFixed(4) : "—";
  const avgRate   = rates.length
    ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4) : "—";

  // Sample data for chart — every Nth point to avoid overplotting
  const step      = Math.max(1, Math.floor(data.length / 300));
  const chartData = data.filter((_, i) => i % step === 0);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif", color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      <NavBar
        activeNav={activeNav}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div style={{
        flex: 1, padding: "24px",
        maxWidth: 1400, margin: "0 auto",
        width: "100%", boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{
          marginBottom: 24, display: "flex",
          justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Historical Analysis
            </h1>
            <p style={{ margin: 0, marginTop: 4, color: C.muted, fontSize: 13 }}>
              Rate history and feature data per instrument
            </p>
          </div>

          {/* Instrument switcher */}
          <div style={{ display: "flex", gap: 8 }}>
            {INSTRUMENTS.map(i => (
              <button key={i} onClick={() => setInstrument(i)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: instrument === i
                  ? `linear-gradient(135deg,${C.accent},${C.accent2})`
                  : C.surface,
                border: instrument === i
                  ? "none" : `1px solid ${C.border}`,
                color: instrument === i ? "#000" : C.muted,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'JetBrains Mono',monospace",
              }}>{i}</button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 16px",
            background: `${C.red}11`, border: `1px solid ${C.red}44`,
            borderRadius: 8, color: C.red, fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: "center", padding: "60px 0",
            color: C.muted, fontSize: 13,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.accent}`,
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
            Loading {instrument} rates...
          </div>
        )}

        {!loading && data.length > 0 && (
          <>
            {/* Stat cards */}
            <div style={{
              display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap",
            }}>
              <StatCard
                label="Total Observations"
                value={data.length.toLocaleString()}
                col={C.accent}
              />
              <StatCard
                label="Latest Rate"
                value={latest?.rate ?? "—"}
                col={C.green}
              />
              <StatCard
                label="Min Rate"
                value={minRate}
                col={C.amber}
              />
              <StatCard
                label="Max Rate"
                value={maxRate}
                col={C.red}
              />
              <StatCard
                label="Average Rate"
                value={avgRate}
                col={C.accent}
              />
              <StatCard
                label="Date Range"
                value={`${earliest?.date?.split(" ")[0]} — ${latest?.date?.split(" ")[0]}`}
                col={C.muted}
              />
            </div>

            {/* Rate chart */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 24, marginBottom: 20,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20,
              }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  {instrument} Rate History
                </h2>
                <span style={{
                  color: C.muted, fontSize: 11,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  {data.length.toLocaleString()} observations
                  {step > 1 ? ` (showing every ${step}th point)` : ""}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis
                    dataKey="date"
                    stroke={C.muted}
                    tick={{ fontSize: 10 }}
                    tickFormatter={v => v?.split(" ")[0]?.substring(0, 7)}
                  />
                  <YAxis stroke={C.muted} tick={{ fontSize: 10 }}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={C.accent}
                    strokeWidth={1.5}
                    dot={false}
                    name="Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="rollingMean7"
                    stroke={C.amber}
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="4 4"
                    name="MA7"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div style={{
                display: "flex", gap: 20, marginTop: 10,
              }}>
                {[
                  { col: C.accent, label: "Rate" },
                  { col: C.amber,  label: "7-Day Moving Average (dashed)" },
                ].map(({ col, label }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{
                      width: 14, height: 3, borderRadius: 2,
                      background: col,
                    }}/>
                    <span style={{ color: C.muted, fontSize: 11 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volatility chart */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 24, marginBottom: 20,
            }}>
              <h2 style={{ margin: 0, marginBottom: 20, fontSize: 14, fontWeight: 700 }}>
                {instrument} Rolling 7-Day Volatility
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis
                    dataKey="date"
                    stroke={C.muted}
                    tick={{ fontSize: 10 }}
                    tickFormatter={v => v?.split(" ")[0]?.substring(0, 7)}
                  />
                  <YAxis stroke={C.muted} tick={{ fontSize: 10 }}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line
                    type="monotone"
                    dataKey="rollingStd7"
                    stroke={C.red}
                    strokeWidth={1.2}
                    dot={false}
                    name="Volatility"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data table — last 20 records */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Latest Records
                </h2>
                <span style={{ color: C.muted, fontSize: 12 }}>
                  Last 20 observations
                </span>
              </div>

              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                padding: "10px 20px",
                background: "#0A1020",
                borderBottom: `1px solid ${C.border}`,
              }}>
                {["Date","Rate","Lag 1","Lag 7","MA7","Volatility"].map(h => (
                  <span key={h} style={{
                    color: C.muted, fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.06em",
                  }}>
                    {h.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Table rows — last 20 */}
              {[...data].reverse().slice(0, 20).map((row, i) => (
                <div key={row.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "11px 20px",
                  borderBottom: i < 19 ? `1px solid ${C.border}` : "none",
                  alignItems: "center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#0D1830"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    color: C.muted, fontSize: 12,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>
                    {row.date?.split(" ")[0]}
                  </span>
                  {[row.rate, row.lag1, row.lag7,
                    row.rollingMean7?.toFixed(4),
                    row.rollingStd7?.toFixed(6)
                  ].map((val, j) => (
                    <span key={j} style={{
                      color: j === 0 ? C.accent : C.text,
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: j === 0 ? 700 : 400,
                    }}>
                      {val}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 0", color: C.muted,
          }}>
            No data found for {instrument}
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}