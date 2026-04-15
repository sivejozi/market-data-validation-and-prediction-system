import {useState, useEffect} from "react";
import {C} from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";
const SEVERITIES = ["ALL", "HIGH", "MED", "LOW"];
const INSTRUMENTS = ["ALL", "ZAREUR", "ZARUSD", "SOFR"];

function SeverityBadge({severity}) {
    const col = severity === "HIGH" ? C.red :
        severity === "MED" ? C.amber : C.green;
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, color: col,
            border: `1px solid ${col}44`, borderRadius: 4,
            padding: "2px 8px", letterSpacing: "0.06em",
        }}>{severity}</span>
    );
}

function ModelTag({model}) {
    const col = model === "kmeans" ? C.amber :
        model === "autoencoder" ? "#C77DFF" : C.green;
    return (
        <span style={{
            fontSize: 10, color: col,
            border: `1px solid ${col}33`,
            borderRadius: 4, padding: "2px 6px", marginRight: 4,
        }}>{model}</span>
    );
}

export default function Alerts({activeNav, onNavigate, onLogout}) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [severity, setSeverity] = useState("ALL");
    const [instrument, setInstrument] = useState("ALL");

    const fetchAlerts = async (sev, inst) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            let url = `${API_BASE}/api/alerts`;
            if (sev !== "ALL") url = `${API_BASE}/api/alerts/severity/${sev}`;
            if (inst !== "ALL") url = `${API_BASE}/api/alerts/instrument/${inst}`;

            const res = await fetch(url, {
                headers: {"Authorization": `Bearer ${token}`},
            });

            if (!res.ok) throw new Error(`Failed to fetch alerts — ${res.status}`);

            const data = await res.json();
            setAlerts(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts(severity, instrument);
    }, [severity, instrument]);

    // Summary counts
    const counts = {
        HIGH: alerts.filter(a => a.severity === "HIGH").length,
        MED: alerts.filter(a => a.severity === "MED").length,
        LOW: alerts.filter(a => a.severity === "LOW").length,
    };

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

            <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

            <div style={{
                flex: 1, padding: "24px",
                maxWidth: 1400, margin: "0 auto",
                width: "100%", boxSizing: "border-box",
            }}>

                {/* Header */}
                <div style={{marginBottom: 24}}>
                    <h1 style={{margin: 0, fontSize: 22, fontWeight: 700}}>
                        Anomaly Alerts
                    </h1>
                    <p style={{margin: 0, marginTop: 4, color: C.muted, fontSize: 13}}>
                        All anomaly alerts published to{" "}
                        <span style={{
                            color: C.accent,
                            fontFamily: "'JetBrains Mono',monospace",
                        }}>market.rates.alert</span>
                    </p>
                </div>

                {/* Summary cards */}
                <div style={{display: "flex", gap: 16, marginBottom: 24}}>
                    {[
                        {label: "Total Alerts", value: alerts.length, col: C.accent},
                        {label: "High", value: counts.HIGH, col: C.red},
                        {label: "Medium", value: counts.MED, col: C.amber},
                        {label: "Low", value: counts.LOW, col: C.green},
                    ].map(({label, value, col}) => (
                        <div key={label} style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: "16px 24px",
                            borderLeft: `3px solid ${col}`, flex: 1,
                        }}>
                            <p style={{
                                color: C.muted, fontSize: 11, margin: 0,
                                marginBottom: 4, letterSpacing: "0.06em", fontWeight: 600,
                            }}>
                                {label.toUpperCase()}
                            </p>
                            <p style={{
                                color: C.text, fontSize: 24, fontWeight: 700,
                                margin: 0, fontFamily: "'JetBrains Mono',monospace",
                            }}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: 16, marginBottom: 20,
                    display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                }}>
                    {/* Severity filter */}
                    <div style={{display: "flex", gap: 6}}>
                        {SEVERITIES.map(s => (
                            <button key={s} onClick={() => {
                                setSeverity(s);
                                setInstrument("ALL");
                            }} style={{
                                padding: "6px 14px", borderRadius: 7,
                                background: severity === s ? `${C.accent}22` : "#0A1020",
                                color: severity === s ? C.accent : C.muted,
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                border: severity === s
                                    ? `1px solid ${C.accent}44`
                                    : `1px solid ${C.border}`,
                            }}>{s}</button>
                        ))}
                    </div>

                    {/* Instrument filter */}
                    <select
                        value={instrument}
                        onChange={e => {
                            setInstrument(e.target.value);
                            setSeverity("ALL");
                        }}
                        style={{
                            background: "#0A1020", border: `1px solid ${C.border}`,
                            borderRadius: 8, padding: "8px 14px",
                            color: C.text, fontSize: 13, outline: "none",
                            fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                        }}
                    >
                        {INSTRUMENTS.map(i => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>

                    {/* Refresh button */}
                    <button
                        onClick={() => fetchAlerts(severity, instrument)}
                        style={{
                            padding: "6px 14px", borderRadius: 7,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            color: C.muted, fontSize: 12, cursor: "pointer",
                        }}
                    >
                        ↻ Refresh
                    </button>

                    <span style={{
                        color: C.muted, fontSize: 12, marginLeft: "auto",
                    }}>
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </span>
                </div>

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
                        Loading alerts...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: "12px 16px", marginBottom: 16,
                        background: `${C.red}11`, border: `1px solid ${C.red}44`,
                        borderRadius: 8, color: C.red, fontSize: 13,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Alerts table */}
                {!loading && alerts.length > 0 && (
                    <div style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 12, overflow: "hidden",
                    }}>
                        {/* Header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "90px 110px 100px 1fr 160px 160px",
                            padding: "12px 20px",
                            borderBottom: `1px solid ${C.border}`,
                            background: "#0A1020",
                        }}>
                            {["Severity", "Instrument", "Rate",
                                "Flagged By", "Consensus", "Received At"].map(h => (
                                <span key={h} style={{
                                    color: C.muted, fontSize: 11,
                                    fontWeight: 600, letterSpacing: "0.06em",
                                }}>
                  {h.toUpperCase()}
                </span>
                            ))}
                        </div>

                        {/* Rows */}
                        {alerts.map((alert, i) => (
                            <div key={alert.id} style={{
                                display: "grid",
                                gridTemplateColumns: "90px 110px 100px 1fr 160px 160px",
                                padding: "13px 20px",
                                borderBottom: i < alerts.length - 1
                                    ? `1px solid ${C.border}` : "none",
                                alignItems: "center",
                                transition: "background 0.15s",
                            }}
                                 onMouseEnter={e =>
                                     e.currentTarget.style.background = "#0D1830"}
                                 onMouseLeave={e =>
                                     e.currentTarget.style.background = "transparent"}
                            >
                                <div><SeverityBadge severity={alert.severity}/></div>

                                <span style={{
                                    color: C.text, fontWeight: 600, fontSize: 13,
                                    fontFamily: "'JetBrains Mono',monospace",
                                }}>
                  {alert.instrument}
                </span>

                                <span style={{
                                    color: C.accent, fontSize: 13,
                                    fontFamily: "'JetBrains Mono',monospace",
                                }}>
                  {alert.rate}
                </span>

                                <div>
                                    {alert.flaggedModels?.split(", ").map(m => (
                                        <ModelTag key={m} model={m.trim()}/>
                                    ))}
                                </div>

                                <span style={{color: C.muted, fontSize: 12}}>
                  {alert.consensus}
                </span>

                                <span style={{
                                    color: C.muted, fontSize: 11,
                                    fontFamily: "'JetBrains Mono',monospace",
                                }}>
                  {alert.receivedAt
                      ? new Date(alert.receivedAt).toLocaleString("en-ZA", {
                          dateStyle: "short", timeStyle: "short",
                      })
                      : "—"}
                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && alerts.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "60px 0",
                        color: C.muted, fontSize: 13,
                    }}>
                        <div style={{fontSize: 32, marginBottom: 12}}>🔔</div>
                        No alerts found
                    </div>
                )}

            </div>
            <Footer/>
        </div>
    );
}