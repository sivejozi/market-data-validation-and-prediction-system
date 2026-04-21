import { useState, useEffect } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE_URL
    || "http://localhost:8082";

// ── Custom tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#0A1020",
            border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 14px",
        }}>
            <p style={{
                color: C.muted, fontSize: 11,
                margin: 0, marginBottom: 4,
            }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{
                    color: p.fill, fontSize: 13,
                    fontWeight: 700, margin: "2px 0",
                    fontFamily: "'JetBrains Mono',monospace",
                }}>
                    {p.name}: {Number(p.value).toFixed(4)}
                </p>
            ))}
        </div>
    );
};

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ ready }) {
    return (
        <span style={{
            fontSize: 10, fontWeight: 700,
            color:  ready ? C.green : C.red,
            border: `1px solid ${ready
                ? C.green : C.red}44`,
            borderRadius: 4, padding: "2px 8px",
            letterSpacing: "0.06em",
        }}>
            {ready ? "READY" : "NOT TRAINED"}
        </span>
    );
}

// ── R² badge ───────────────────────────────────────────────────
function R2Badge({ value }) {
    if (value === null || value === undefined)
        return <span style={{ color: C.muted }}>—</span>;
    const col = value > 0.9 ? C.green  :
        value > 0.7 ? C.amber  :
            value > 0   ? C.red    : "#FF4444";
    return (
        <span style={{
            color: col, fontWeight: 700, fontSize: 13,
            fontFamily: "'JetBrains Mono',monospace",
        }}>
            {value.toFixed(4)}
        </span>
    );
}

// ── Instrument panel ───────────────────────────────────────────
function InstrumentPanel({ data }) {
    const [open, setOpen] = useState(false);

    const allReady = data.kmeansReady && data.autoencoderReady &&
        data.rfcReady    && data.lrReady &&
        data.gbrReady    && data.rfrReady;

    // R² chart data
    const r2Data = [
        { model: "LR",  r2: data.lrR2  ?? 0 },
        { model: "GBR", r2: data.gbrR2 ?? 0 },
        { model: "RFR", r2: data.rfrR2 ?? 0 },
    ];

    return (
        <div style={{
            background: C.surface,
            border: `1px solid ${allReady
                ? C.green + "44" : C.border}`,
            borderRadius: 12, overflow: "hidden",
            marginBottom: 16,
        }}>
            {/* Header */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    padding: "16px 20px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                    background: open ? "#0A1020" : "transparent",
                }}
            >
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                }}>
                    <span style={{
                        color: C.text, fontWeight: 700, fontSize: 16,
                        fontFamily: "'JetBrains Mono',monospace",
                    }}>
                        {data.instrument}
                    </span>
                    <StatusBadge ready={allReady}/>
                    <span style={{ color: C.muted, fontSize: 12 }}>
                        v{data.modelVersion} ·{" "}
                        {data.totalRates?.toLocaleString()} rates ·{" "}
                        Trained{" "}
                        {data.trainedAt === "never" ? "never"
                            : new Date(data.trainedAt)
                                .toLocaleDateString("en-ZA")}
                    </span>
                </div>
                <span style={{ color: C.muted, fontSize: 18 }}>
                    {open ? "▲" : "▼"}
                </span>
            </div>

            {open && (
                <div style={{ padding: "20px" }}>

                    {/* ── Charts row ─────────────────────────── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16, marginBottom: 24,
                    }}>

                        {/* R² bar chart */}
                        <div style={{
                            background: "#0A1020",
                            border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: "16px",
                        }}>
                            <p style={{
                                color: C.muted, fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                margin: "0 0 4px",
                            }}>
                                PREDICTION MODELS — R² SCORE
                            </p>
                            <p style={{
                                color: C.muted, fontSize: 11,
                                margin: "0 0 16px",
                            }}>
                                Higher is better · 1.0 = perfect fit
                            </p>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={r2Data}
                                          margin={{ top: 4, right: 8,
                                              left: -20, bottom: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={C.border}/>
                                    <XAxis
                                        dataKey="model"
                                        stroke={C.muted}
                                        tick={{ fontSize: 11 }}/>
                                    <YAxis
                                        stroke={C.muted}
                                        tick={{ fontSize: 10 }}
                                        domain={[-1, 1]}/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <ReferenceLine
                                        y={0} stroke={C.red}
                                        strokeDasharray="3 3"/>
                                    <ReferenceLine
                                        y={0.9} stroke={C.green}
                                        strokeDasharray="3 3"
                                        label={{
                                            value: "0.9",
                                            fill: C.green,
                                            fontSize: 10
                                        }}/>
                                    <Bar dataKey="r2" name="R²"
                                         radius={[4, 4, 0, 0]}>
                                        {r2Data.map((entry) => (
                                            <rect
                                                key={entry.model}
                                                fill={
                                                    entry.r2 > 0.9
                                                        ? C.green :
                                                        entry.r2 > 0.7
                                                            ? C.amber :
                                                            entry.r2 > 0
                                                                ? C.red
                                                                : "#FF4444"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Validation thresholds chart */}
                        <div style={{
                            background: "#0A1020",
                            border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: "16px",
                        }}>
                            <p style={{
                                color: C.muted, fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                margin: "0 0 4px",
                            }}>
                                VALIDATION MODELS — ANOMALY THRESHOLDS
                            </p>
                            <p style={{
                                color: C.muted, fontSize: 11,
                                margin: "0 0 16px",
                            }}>
                                Distance threshold · above = anomaly
                            </p>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    data={[
                                        {
                                            model: "K-Means",
                                            threshold: parseFloat(
                                                (data.kmeansThreshold ?? 0)
                                                    .toFixed(4))
                                        },
                                        {
                                            model: "Autoencoder",
                                            threshold: parseFloat(
                                                (data.autoencoderThreshold ?? 0)
                                                    .toFixed(6))
                                        },
                                        {
                                            model: "RFC",
                                            threshold: data.rfcThreshold ?? 0
                                        },
                                    ]}
                                    margin={{ top: 4, right: 8,
                                        left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={C.border}/>
                                    <XAxis
                                        dataKey="model"
                                        stroke={C.muted}
                                        tick={{ fontSize: 11 }}/>
                                    <YAxis
                                        stroke={C.muted}
                                        tick={{ fontSize: 10 }}/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Bar
                                        dataKey="threshold"
                                        name="Threshold"
                                        fill={C.accent}
                                        radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Validation model cards ──────────────── */}
                    <p style={{
                        color: C.muted, fontSize: 11, fontWeight: 600,
                        letterSpacing: "0.06em", margin: "0 0 12px",
                    }}>
                        VALIDATION MODELS
                    </p>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12, marginBottom: 20,
                    }}>
                        {[
                            {
                                type:  "UNSUPERVISED",
                                label: "K-Means Clustering",
                                col:   C.amber,
                                ready: data.kmeansReady,
                                meta:  `Threshold: ${
                                    data.kmeansThreshold?.toFixed(4) ?? "—"}`
                            },
                            {
                                type:  "SELF-SUPERVISED",
                                label: "Autoencoder",
                                col:   "#C77DFF",
                                ready: data.autoencoderReady,
                                meta:  `Threshold: ${
                                    data.autoencoderThreshold?.toFixed(8) ?? "—"}`
                            },
                            {
                                type:  "SUPERVISED",
                                label: "Random Forest Classifier",
                                col:   C.green,
                                ready: data.rfcReady,
                                meta:  `Threshold: ${
                                    data.rfcThreshold?.toFixed(4) ?? "—"}`
                            },
                        ].map(({ type, label, col, ready, meta }) => (
                            <div key={label} style={{
                                background: "#0A1020",
                                border: `1px solid ${C.border}`,
                                borderRadius: 8, padding: "14px 16px",
                                borderTop: `3px solid ${col}`,
                            }}>
                                <p style={{
                                    color: C.muted, fontSize: 10,
                                    margin: 0, letterSpacing: "0.06em",
                                    fontWeight: 600,
                                }}>{type}</p>
                                <p style={{
                                    color: C.text, fontWeight: 700,
                                    fontSize: 13, margin: "4px 0 10px",
                                }}>{label}</p>
                                <StatusBadge ready={ready}/>
                                <p style={{
                                    color: C.muted, fontSize: 11,
                                    margin: "10px 0 0",
                                    fontFamily: "'JetBrains Mono',monospace",
                                }}>{meta}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Prediction model cards ──────────────── */}
                    <p style={{
                        color: C.muted, fontSize: 11, fontWeight: 600,
                        letterSpacing: "0.06em", margin: "0 0 12px",
                    }}>
                        PREDICTION MODELS
                    </p>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12, marginBottom: 20,
                    }}>
                        {[
                            {
                                label: "Linear Regression",
                                col:   C.accent,
                                ready: data.lrReady,
                                r2:    data.lrR2,
                            },
                            {
                                label: "Gradient Boosting",
                                col:   C.amber,
                                ready: data.gbrReady,
                                r2:    data.gbrR2,
                            },
                            {
                                label: "Random Forest Regressor",
                                col:   C.green,
                                ready: data.rfrReady,
                                r2:    data.rfrR2,
                            },
                        ].map(({ label, col, ready, r2 }) => (
                            <div key={label} style={{
                                background: "#0A1020",
                                border: `1px solid ${C.border}`,
                                borderRadius: 8, padding: "14px 16px",
                                borderTop: `3px solid ${col}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <div>
                                    <p style={{
                                        color: C.muted, fontSize: 10,
                                        margin: 0, letterSpacing: "0.06em",
                                        fontWeight: 600,
                                    }}>R² SCORE</p>
                                    <p style={{
                                        color: C.text, fontWeight: 700,
                                        fontSize: 12, margin: "4px 0 8px",
                                    }}>{label}</p>
                                    <StatusBadge ready={ready}/>
                                </div>
                                <R2Badge value={r2}/>
                            </div>
                        ))}
                    </div>

                    {/* Retrain hint */}
                    <div style={{
                        display: "flex", justifyContent: "flex-end",
                    }}>
                        <span style={{
                            color: C.muted, fontSize: 11,
                            fontStyle: "italic",
                        }}>
                            Retrain via POST /mlops/train/{data.instrument}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main screen ────────────────────────────────────────────────
export default function Models({ activeNav, onNavigate, onLogout }) {
    const [status,  setStatus]  = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res   = await fetch(
                `${API_BASE}/api/market-rates/mlops/model-status`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error(
                `Failed to fetch model status — ${res.status}`);
            setStatus(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStatus(); }, []);

    const totalReady = status.filter(s =>
        s.kmeansReady && s.autoencoderReady && s.rfcReady &&
        s.lrReady && s.gbrReady && s.rfrReady
    ).length;

    const avgLrR2 = status.length
        ? (status.reduce((a, s) => a + (s.lrR2 || 0), 0) /
            status.length).toFixed(4)
        : "—";

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
                <div style={{
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}>
                    <div>
                        <h1 style={{
                            margin: 0, fontSize: 22, fontWeight: 700,
                        }}>
                            Model Status
                        </h1>
                        <p style={{
                            margin: 0, marginTop: 4,
                            color: C.muted, fontSize: 13,
                        }}>
                            MLOps pipeline — trained artefacts,
                            versions and performance metrics
                        </p>
                    </div>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        style={{
                            padding: "8px 16px", borderRadius: 8,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            color: C.muted, fontSize: 12,
                            cursor: "pointer",
                        }}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Summary cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 16, marginBottom: 24,
                }}>
                    {[
                        { label: "Instruments",
                            value: status.length,  col: C.accent },
                        { label: "Fully Trained",
                            value: totalReady,      col: C.green  },
                        { label: "Models Per Instrument",
                            value: 6,              col: C.amber  },
                        { label: "Avg LR R²",
                            value: avgLrR2,         col: C.accent },
                    ].map(({ label, value, col }) => (
                        <div key={label} style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: "16px 20px",
                            borderLeft: `3px solid ${col}`,
                        }}>
                            <p style={{
                                color: C.muted, fontSize: 11,
                                margin: 0, marginBottom: 4,
                                letterSpacing: "0.06em",
                                fontWeight: 600,
                            }}>
                                {label.toUpperCase()}
                            </p>
                            <p style={{
                                color: C.text, fontSize: 22,
                                fontWeight: 700, margin: 0,
                                fontFamily: "'JetBrains Mono',monospace",
                            }}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{
                        textAlign: "center", padding: "60px 0",
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
                        Loading model status...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: "12px 16px", marginBottom: 16,
                        background: `${C.red}11`,
                        border: `1px solid ${C.red}44`,
                        borderRadius: 8, color: C.red, fontSize: 13,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Instrument panels */}
                {!loading && status.map(s => (
                    <InstrumentPanel key={s.instrument} data={s}/>
                ))}

                {/* MLOps info strip */}
                {!loading && status.length > 0 && (
                    <div style={{
                        marginTop: 8, padding: "12px 16px",
                        background: "#0A1020", borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        display: "flex", gap: 24, flexWrap: "wrap",
                    }}>
                        {[
                            { label: "Train",
                                value: "POST /mlops/train/{instrument}" },
                            { label: "Retrain all",
                                value: "POST /mlops/retrain/all"        },
                            { label: "Artefacts",
                                value: "models/ + metadata/"            },
                            { label: "Auto-retrain",
                                value: "market.rates.clean → Kafka"     },
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
                                    fontFamily: "'JetBrains Mono',monospace",
                                }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
}