import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API_BASE  = process.env.REACT_APP_API_BASE_URL
    || "http://localhost:8082";
const INSTRUMENTS = ["ZAR/EUR", "ZAR/USD", "SOFR"];
const INSTRUMENT_MAP = {
    "ZAR/EUR": "ZAREUR",
    "ZAR/USD": "ZARUSD",
    "SOFR":    "SOFR",
};

const MODELS = [
    {
        key:          "lr",
        label:        "Linear Regression",
        endpoint:     "linear-regression",
        plotEndpoint: "linear-regression",
        col:          "#00D4FF",
        type:         "REGRESSION",
    },
    {
        key:          "gbr",
        label:        "Gradient Boosting",
        endpoint:     "gradient-boosting",
        plotEndpoint: "gradient-boosting",
        col:          "#EF9F27",
        type:         "ENSEMBLE",
    },
    {
        key:          "rfr",
        label:        "Random Forest",
        endpoint:     "random-forest",
        plotEndpoint: "random-forest",
        col:          "#97C459",
        type:         "ENSEMBLE",
    },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#0A1020",
            border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 14px",
        }}>
            <p style={{
                color: C.muted, fontSize: 11, margin: "0 0 6px",
            }}>
                {new Date(label).toLocaleDateString("en-ZA")}
            </p>
            {payload.map(p => (
                <p key={p.name} style={{
                    color: p.stroke, fontSize: 12,
                    fontWeight: 700, margin: "2px 0",
                    fontFamily: "'JetBrains Mono',monospace",
                }}>
                    {p.name}: {Number(p.value).toFixed(4)}
                </p>
            ))}
        </div>
    );
};

function ModelCard({ model, result, loading }) {
    const r2    = result?.metrics?.R2;
    const r2Col = r2 === null || r2 === undefined ? C.muted :
        r2 > 0.9  ? "#97C459" :
            r2 > 0.7  ? "#EF9F27" :
                r2 > 0    ? C.red     : "#FF4444";
    const lastPred = result?.predictions?.slice(-1)[0]?.Predicted_Rate;

    return (
        <div style={{
            background: "#0A1020",
            border: `1px solid ${result
                ? model.col + "66" : C.border}`,
            borderRadius: 10, padding: "16px",
            borderTop: `3px solid ${model.col}`,
        }}>
            <p style={{
                color: C.muted, fontSize: 10, margin: 0,
                letterSpacing: "0.06em", fontWeight: 600,
            }}>{model.type}</p>
            <p style={{
                color: C.text, fontSize: 14, fontWeight: 700,
                margin: "4px 0 12px",
            }}>{model.label}</p>

            {loading && (
                <div style={{
                    color: model.col, fontSize: 12,
                    textAlign: "center", padding: "12px 0",
                }}>
                    Running model...
                </div>
            )}
            {!loading && !result && (
                <div style={{
                    color: C.muted, fontSize: 12,
                    textAlign: "center", padding: "12px 0",
                }}>
                    Awaiting prediction...
                </div>
            )}
            {!loading && result && (
                <div style={{
                    display: "flex", flexDirection: "column", gap: 8,
                }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                    }}>
                        <span style={{ color: C.muted, fontSize: 11 }}>
                            R² Score
                        </span>
                        <span style={{
                            color: r2Col, fontSize: 13, fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                        }}>
                            {r2 !== null && r2 !== undefined
                                ? r2.toFixed(4) : "—"}
                        </span>
                    </div>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                    }}>
                        <span style={{ color: C.muted, fontSize: 11 }}>
                            Final prediction
                        </span>
                        <span style={{
                            color: model.col, fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                        }}>
                            {lastPred?.toFixed(4) ?? "—"}
                        </span>
                    </div>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                    }}>
                        <span style={{ color: C.muted, fontSize: 11 }}>
                            Predictions
                        </span>
                        <span style={{
                            color: C.text, fontSize: 11,
                            fontFamily: "'JetBrains Mono',monospace",
                        }}>
                            {result.predictions?.length ?? 0} days
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Prediction({ activeNav, onNavigate, onLogout }) {
    const [instrument, setInstrument] = useState("ZAR/USD");
    const [numDays,    setNumDays]    = useState(50);
    const [loading,    setLoading]    = useState({});
    const [results,    setResults]    = useState({});
    const [plots,      setPlots]      = useState({});
    const [plotLoading,setPltLoading] = useState({});
    const [error,      setError]      = useState(null);
    const [focused,    setFocused]    = useState(null);
    const [activeTab,  setActiveTab]  = useState("chart");

    const handlePredict = async () => {
        setResults({});
        setPlots({});
        setError(null);
        setLoading({ lr: true, gbr: true, rfr: true });
        setPltLoading({ lr: true, gbr: true, rfr: true });

        const token = localStorage.getItem("token");
        const inst  = INSTRUMENT_MAP[instrument] || instrument;

        // ── Fetch predictions ──────────────────────────────────
        await Promise.all(MODELS.map(async (model) => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/market-rates/prediction` +
                    `/${model.endpoint}/${inst}?numDays=${numDays}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                if (!res.ok) throw new Error(
                    `${model.label} failed — ${res.status}`);
                const data = await res.json();
                setResults(prev => ({ ...prev, [model.key]: data }));
            } catch (err) {
                setResults(prev => ({
                    ...prev, [model.key]: { error: err.message },
                }));
            } finally {
                setLoading(prev => ({
                    ...prev, [model.key]: false,
                }));
            }
        }));

        // ── Fetch plots ────────────────────────────────────────
        await Promise.all(MODELS.map(async (model) => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/market-rates/prediction` +
                    `/${model.plotEndpoint}/${inst}/plot` +
                    `?numDays=${numDays}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                if (!res.ok) throw new Error(
                    `${model.label} plot failed — ${res.status}`);
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                setPlots(prev => ({ ...prev, [model.key]: url }));
            } catch (err) {
                console.error(`[PLOT] ${model.label}:`, err.message);
            } finally {
                setPltLoading(prev => ({
                    ...prev, [model.key]: false,
                }));
            }
        }));
    };

    // ── Merge predictions for chart ────────────────────────────
    const chartData = (() => {
        const allDates = new Set();
        Object.values(results).forEach(r => {
            r?.predictions?.forEach(p => allDates.add(p.Date));
        });
        return Array.from(allDates).sort().map(date => {
            const point = { date };
            MODELS.forEach(m => {
                const pred = results[m.key]?.predictions?.find(
                    p => p.Date === date);
                if (pred) point[m.key] = pred.Predicted_Rate;
            });
            return point;
        });
    })();

    const hasResults  = Object.keys(results).length > 0;
    const isLoading   = Object.values(loading).some(v => v);

    return (
        <div style={{
            minHeight: "100vh", background: C.bg,
            display: "flex", flexDirection: "column",
            fontFamily: "'DM Sans',sans-serif", color: C.text,
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>

            <NavBar activeNav={activeNav}
                    onNavigate={onNavigate}
                    onLogout={onLogout}/>

            <div style={{
                flex: 1, padding: "24px",
                maxWidth: 1200, margin: "0 auto",
                width: "100%", boxSizing: "border-box",
            }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{
                        margin: 0, fontSize: 22, fontWeight: 700,
                    }}>
                        Rate Prediction
                    </h1>
                    <p style={{
                        margin: 0, marginTop: 4,
                        color: C.muted, fontSize: 13,
                    }}>
                        Forecast future rates using Linear Regression,
                        Gradient Boosting and Random Forest models
                        trained on historical data.
                    </p>
                </div>

                {/* Input form */}
                <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: 24,
                    marginBottom: 24,
                }}>
                    <h2 style={{
                        margin: "0 0 20px", fontSize: 14,
                        fontWeight: 700,
                    }}>
                        Prediction Parameters
                    </h2>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: 16, alignItems: "end",
                    }}>

                        {/* Instrument */}
                        <div>
                            <label style={{
                                color: C.muted, fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                display: "block", marginBottom: 6,
                            }}>INSTRUMENT</label>
                            <select
                                value={instrument}
                                onChange={e =>
                                    setInstrument(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "#0A1020",
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    padding: "11px 14px",
                                    color: C.text, fontSize: 14,
                                    outline: "none",
                                    fontFamily: "'DM Sans',sans-serif",
                                    cursor: "pointer",
                                }}
                            >
                                {INSTRUMENTS.map(i => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>

                        {/* Days */}
                        <div>
                            <label style={{
                                color: C.muted, fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                display: "block", marginBottom: 6,
                            }}>FORECAST DAYS</label>
                            <input
                                type="number"
                                min="5" max="365"
                                value={numDays}
                                onChange={e =>
                                    setNumDays(Number(e.target.value))}
                                onFocus={() => setFocused("days")}
                                onBlur={() => setFocused(null)}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    background: focused === "days"
                                        ? `${C.accent}08` : "#0A1020",
                                    border: `1px solid ${
                                        focused === "days"
                                            ? C.accent : C.border}`,
                                    borderRadius: 8,
                                    padding: "11px 14px",
                                    color: C.text, fontSize: 14,
                                    outline: "none",
                                    fontFamily:
                                        "'JetBrains Mono',monospace",
                                }}
                            />
                        </div>

                        {/* Predict button */}
                        <button
                            onClick={handlePredict}
                            disabled={isLoading}
                            style={{
                                padding: "11px 28px",
                                borderRadius: 8, border: "none",
                                background: isLoading
                                    ? C.border
                                    : `linear-gradient(135deg,
                                        ${C.accent},${C.accent2})`,
                                color: isLoading ? C.muted : "#000",
                                fontSize: 13, fontWeight: 700,
                                cursor: isLoading
                                    ? "not-allowed" : "pointer",
                                letterSpacing: "0.04em",
                                whiteSpace: "nowrap",
                                transition: "all 0.2s",
                            }}
                        >
                            {isLoading ? "PREDICTING..." : "📈 PREDICT"}
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
                            { label: "Models",
                                value: "LR · GBR · RFR" },
                            { label: "Method",
                                value: "Rolling window forecast" },
                            { label: "Inference",
                                value: "Saved artefacts — fast" },
                        ].map(({ label, value }) => (
                            <div key={label} style={{
                                display: "flex", gap: 6,
                                alignItems: "center",
                            }}>
                                <span style={{
                                    color: C.muted, fontSize: 11,
                                }}>{label}:</span>
                                <span style={{
                                    color: C.accent, fontSize: 11,
                                    fontFamily:
                                        "'JetBrains Mono',monospace",
                                }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div style={{
                        textAlign: "center", padding: "40px 0",
                        color: C.muted, fontSize: 13,
                    }}>
                        <div style={{
                            width: 32, height: 32,
                            borderRadius: "50%",
                            border: `3px solid ${C.border}`,
                            borderTop: `3px solid ${C.accent}`,
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 12px",
                        }}/>
                        Running LR · GBR · RFR predictions...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: 20, padding: "12px 16px",
                        background: `${C.red}11`,
                        border: `1px solid ${C.red}44`,
                        borderRadius: 8, color: C.red, fontSize: 13,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Model cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16, marginBottom: 24,
                }}>
                    {MODELS.map(m => (
                        <ModelCard
                            key={m.key}
                            model={m}
                            result={results[m.key]}
                            loading={loading[m.key]}
                        />
                    ))}
                </div>

                {/* Tabs + content */}
                {hasResults && (
                    <div style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12, overflow: "hidden",
                    }}>

                        {/* Tab bar */}
                        <div style={{
                            display: "flex",
                            borderBottom: `1px solid ${C.border}`,
                            background: "#0A1020",
                        }}>
                            {[
                                { key: "chart", label: "📊 Forecast Chart" },
                                { key: "plots", label: "🖼 Model Plots" },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        padding: "12px 24px",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: activeTab === tab.key
                                            ? `2px solid ${C.accent}`
                                            : "2px solid transparent",
                                        color: activeTab === tab.key
                                            ? C.accent : C.muted,
                                        fontSize: 13, fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab 1: Forecast Chart ──────────── */}
                        {activeTab === "chart" && (
                            <div style={{ padding: 24 }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 20,
                                }}>
                                    <div>
                                        <h2 style={{
                                            margin: 0, fontSize: 14,
                                            fontWeight: 700,
                                        }}>
                                            {instrument} — {numDays}-Day
                                            Forecast
                                        </h2>
                                        <p style={{
                                            margin: 0, marginTop: 4,
                                            color: C.muted, fontSize: 12,
                                        }}>
                                            All 3 models overlaid
                                        </p>
                                    </div>
                                    <span style={{
                                        color: C.muted, fontSize: 11,
                                        fontFamily:
                                            "'JetBrains Mono',monospace",
                                    }}>
                                        {chartData.length} data points
                                    </span>
                                </div>

                                <ResponsiveContainer
                                    width="100%" height={360}>
                                    <LineChart data={chartData}
                                               margin={{
                                                   top: 4, right: 16,
                                                   left: 0, bottom: 0,
                                               }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke={C.border}/>
                                        <XAxis
                                            dataKey="date"
                                            stroke={C.muted}
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={v =>
                                                new Date(v)
                                                    .toLocaleDateString(
                                                        "en-ZA", {
                                                            month: "short",
                                                            day:   "numeric",
                                                        })}
                                        />
                                        <YAxis
                                            stroke={C.muted}
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={v =>
                                                v.toFixed(2)}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip/>}/>
                                        <Legend wrapperStyle={{
                                            fontSize: 12,
                                            color: C.muted,
                                        }}/>
                                        {MODELS.map(m => (
                                            results[m.key]
                                                ?.predictions && (
                                                <Line
                                                    key={m.key}
                                                    type="monotone"
                                                    dataKey={m.key}
                                                    stroke={m.col}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name={m.label}
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>

                                {/* R² legend */}
                                <div style={{
                                    display: "flex", gap: 20,
                                    marginTop: 16, flexWrap: "wrap",
                                }}>
                                    {MODELS.map(m => {
                                        const r2 = results[m.key]
                                            ?.metrics?.R2;
                                        if (r2 === undefined) return null;
                                        const col =
                                            r2 > 0.9  ? "#97C459" :
                                                r2 > 0.7  ? "#EF9F27" :
                                                    r2 > 0    ? C.red     :
                                                        "#FF4444";
                                        return (
                                            <div key={m.key} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}>
                                                <div style={{
                                                    width: 14, height: 3,
                                                    borderRadius: 2,
                                                    background: m.col,
                                                }}/>
                                                <span style={{
                                                    color: C.muted,
                                                    fontSize: 11,
                                                }}>
                                                    {m.label}
                                                </span>
                                                <span style={{
                                                    color: col,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    fontFamily:
                                                        "'JetBrains Mono'," +
                                                        "monospace",
                                                }}>
                                                    R²={r2?.toFixed(4)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Tab 2: Model Plots ─────────────── */}
                        {activeTab === "plots" && (
                            <div style={{ padding: 24 }}>
                                <p style={{
                                    color: C.muted, fontSize: 13,
                                    margin: "0 0 20px",
                                }}>
                                    Matplotlib plots from Python ML
                                    service — historical rates,
                                    test data and future predictions.
                                </p>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 24,
                                }}>
                                    {MODELS.map(m => (
                                        <div key={m.key} style={{
                                            background: "#0A1020",
                                            border: `1px solid ${C.border}`,
                                            borderRadius: 10,
                                            overflow: "hidden",
                                            borderTop:
                                                `3px solid ${m.col}`,
                                        }}>
                                            {/* Plot header */}
                                            <div style={{
                                                padding: "12px 16px",
                                                borderBottom:
                                                    `1px solid ${C.border}`,
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems: "center",
                                            }}>
                                                <div>
                                                    <span style={{
                                                        color: C.muted,
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        letterSpacing:
                                                            "0.06em",
                                                    }}>
                                                        {m.type}
                                                    </span>
                                                    <span style={{
                                                        color: C.text,
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        marginLeft: 10,
                                                    }}>
                                                        {m.label}
                                                    </span>
                                                </div>
                                                {results[m.key]
                                                    ?.metrics?.R2 && (
                                                    <span style={{
                                                        color: m.col,
                                                        fontSize: 12,
                                                        fontFamily:
                                                            "'JetBrains Mono'," +
                                                            "monospace",
                                                        fontWeight: 700,
                                                    }}>
                                                        R²={results[m.key]
                                                        .metrics.R2
                                                        .toFixed(4)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Plot image */}
                                            {plotLoading[m.key] ? (
                                                <div style={{
                                                    textAlign: "center",
                                                    padding: "40px 0",
                                                    color: C.muted,
                                                    fontSize: 13,
                                                }}>
                                                    <div style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        border: `3px solid ${C.border}`,
                                                        borderTop:
                                                            `3px solid ${m.col}`,
                                                        animation:
                                                            "spin 0.8s linear infinite",
                                                        margin:
                                                            "0 auto 8px",
                                                    }}/>
                                                    Generating plot...
                                                </div>
                                            ) : plots[m.key] ? (
                                                <img
                                                    src={plots[m.key]}
                                                    alt={`${m.label} forecast`}
                                                    style={{
                                                        width: "100%",
                                                        display: "block",
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    textAlign: "center",
                                                    padding: "40px 0",
                                                    color: C.muted,
                                                    fontSize: 13,
                                                }}>
                                                    Plot unavailable
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
}