import { useState, useEffect } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";

const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR", "JIBAR3M"];
const SOURCES     = ["FRED", "Bloomberg"];

const INSTRUMENT_MAP = {
  "ZAR/EUR": "ZAREUR",
  "ZAR/USD": "ZARUSD",
  "SOFR":    "SOFR",
  "JIBAR3M":    "JIBAR3M",
};

const SOURCE_COL = {
  FRED:      C.accent,
  BLOOMBERG: "#00D4AA",
};

// ── Tooltip ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
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

// ── Stat card ──────────────────────────────────────────────────
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

// ── Toggle button ──────────────────────────────────────────────
function ToggleBtn({ label, active, col, onClick }) {
  return (
      <button onClick={onClick} style={{
        padding: "8px 18px", borderRadius: 8, border: "none",
        background: active
            ? `linear-gradient(135deg, ${col}, ${col}BB)`
            : C.surface,
        border: active ? "none" : `1px solid ${C.border}`,
        color: active ? "#000" : C.muted,
        fontSize: 13, fontWeight: 700, cursor: "pointer",
        fontFamily: "'JetBrains Mono',monospace",
        transition: "all 0.2s",
      }}>
        {label}
      </button>
  );
}

// ── Main screen ────────────────────────────────────────────────
export default function Historical({ activeNav, onNavigate, onLogout }) {
  const [instrument, setInstrument] = useState("SOFR");
  const [source, setSource]         = useState("FRED");
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchRates = async (inst, src) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const token = localStorage.getItem("token");
      const param = INSTRUMENT_MAP[inst] || inst;

      const res = await fetch(
          `${API_BASE}/api/market-rates/search?instrument=${param}&source=${src}`,
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
    fetchRates(instrument, source);
  }, [instrument, source]);

  // ── Derived stats ──────────────────────────────────────────
  const rates    = data.map(d => d.rate);
  const latest   = data[data.length - 1];
  const earliest = data[0];
  const minRate  = rates.length ? Math.min(...rates).toFixed(4) : "—";
  const maxRate  = rates.length ? Math.max(...rates).toFixed(4) : "—";
  const avgRate  = rates.length
      ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4) : "—";

  const step      = Math.max(1, Math.floor(data.length / 300));
  const chartData = data.filter((_, i) => i % step === 0);

  const srcCol = SOURCE_COL[source] || C.accent;

  return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans',sans-serif", color: C.text,
      }}>
        <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

        <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

        <div style={{
          flex: 1, padding: "24px",
          maxWidth: 1400, margin: "0 auto",
          width: "100%", boxSizing: "border-box",
        }}>

          {/* Header */}
          <div style={{
            marginBottom: 24, display: "flex",
            justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                Historical Analysis
              </h1>
              <p style={{ margin: 0, marginTop: 4, color: C.muted, fontSize: 13 }}>
                Rate history and feature data per instrument and source
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>

              {/* Instrument toggles */}
              <div style={{
                display: "flex", gap: 6,
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: 4,
              }}>
                {INSTRUMENTS.map(i => (
                    <ToggleBtn
                        key={i} label={i}
                        active={instrument === i}
                        col={C.accent}
                        onClick={() => setInstrument(i)}
                    />
                ))}
              </div>

              {/* Divider */}
              <div style={{
                width: 1, height: 32,
                background: C.border,
              }}/>

              {/* Source toggles */}
              <div style={{
                display: "flex", gap: 6,
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: 4,
              }}>
                {SOURCES.map(s => (
                    <ToggleBtn
                        key={s} label={s}
                        active={source === s}
                        col={SOURCE_COL[s]}
                        onClick={() => setSource(s)}
                    />
                ))}
              </div>
            </div>
          </div>

          {/* Source badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 20,
            background: `${srcCol}15`,
            border: `1px solid ${srcCol}44`,
            marginBottom: 20,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: srcCol,
            }}/>
            <span style={{
              color: srcCol, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em",
            }}>
            {source} · {instrument}
          </span>
            {data.length > 0 && (
                <span style={{ color: C.muted, fontSize: 11 }}>
              · {data.length.toLocaleString()} observations
            </span>
            )}
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
                  borderTop: `3px solid ${srcCol}`,
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}/>
                Loading {source} · {instrument} rates...
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
                      col={srcCol}
                  />
                  <StatCard
                      label="Latest Rate"
                      value={latest?.rate ?? "—"}
                      col={C.green}
                  />
                  <StatCard label="Min Rate"     value={minRate} col={C.amber}/>
                  <StatCard label="Max Rate"     value={maxRate} col={C.red}/>
                  <StatCard label="Average Rate" value={avgRate} col={srcCol}/>
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
                      <span style={{
                        marginLeft: 10, fontSize: 11, fontWeight: 600,
                        color: srcCol, letterSpacing: "0.06em",
                      }}>
                    {source}
                  </span>
                    </h2>
                    <span style={{
                      color: C.muted, fontSize: 11,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                  {data.length.toLocaleString()} observations
                      {step > 1 ? ` · every ${step}th point` : ""}
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
                          type="monotone" dataKey="rate"
                          stroke={srcCol} strokeWidth={1.5}
                          dot={false} name="Rate"
                      />
                      <Line
                          type="monotone" dataKey="rollingMean7"
                          stroke={C.amber} strokeWidth={1}
                          dot={false} strokeDasharray="4 4" name="MA7"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                    {[
                      { col: srcCol,   label: "Rate" },
                      { col: C.amber,  label: "7-Day Moving Average (dashed)" },
                    ].map(({ col, label }) => (
                        <div key={label} style={{
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <div style={{
                            width: 14, height: 3,
                            borderRadius: 2, background: col,
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
                    <span style={{
                      marginLeft: 10, fontSize: 11, fontWeight: 600,
                      color: srcCol, letterSpacing: "0.06em",
                    }}>
                  {source}
                </span>
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
                          type="monotone" dataKey="rollingStd7"
                          stroke={C.red} strokeWidth={1.2}
                          dot={false} name="Volatility"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Data table */}
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
                    <span style={{
                      color: srcCol, fontSize: 11,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 600,
                    }}>
                  {source} · Last 20 observations
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

                  {/* Table rows */}
                  {[...data].reverse().slice(0, 20).map((row, i) => (
                      <div key={row.id} style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                        padding: "11px 20px",
                        borderBottom: i < 19 ? `1px solid ${C.border}` : "none",
                        alignItems: "center",
                        transition: "background 0.15s",
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
                        {[
                          row.rate,
                          row.lag1,
                          row.lag7,
                          row.rollingMean7?.toFixed(4),
                          row.rollingStd7?.toFixed(6),
                        ].map((val, j) => (
                            <span key={j} style={{
                              color: j === 0 ? srcCol : C.text,
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
                No {source} data found for {instrument}
              </div>
          )}

        </div>
        <Footer/>
      </div>
  );
}
