import { useState, useEffect } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import StatCard from "../components/StatCard";
import AlertRow from "../components/AlertRow";
import ModelBadge from "../components/ModelBadge";

const API_BASE = process.env.REACT_APP_API_BASE_URL
    || "http://localhost:8082";

export default function Dashboard({ activeNav, onNavigate, onLogout }) {

  const [alerts,      setAlerts]      = useState([]);
  const [modelStatus, setModelStatus] = useState([]);
  const [modelRuns,   setModelRuns]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      const [alertsRes, statusRes, runsRes] = await Promise.all([
        fetch(`${API_BASE}/api/alerts`, { headers }),
        fetch(`${API_BASE}/api/market-rates/mlops/model-status`,
            { headers }),
        fetch(`${API_BASE}/api/market-rates/mlops/model-runs`,
            { headers }),
      ]);

      if (alertsRes.ok)  setAlerts(await alertsRes.json());
      if (statusRes.ok)  setModelStatus(await statusRes.json());
      if (runsRes.ok)    setModelRuns(await runsRes.json());

      setLastRefresh(new Date().toLocaleTimeString("en-ZA"));
    } catch (err) {
      console.error("[DASHBOARD] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Derived stats ──────────────────────────────────────────
  const totalAlerts   = alerts.length;
  const highAlerts    = alerts.filter(a => a.severity === "HIGH").length;
  const medAlerts     = alerts.filter(a => a.severity === "MED").length;
  const lowAlerts     = alerts.filter(a => a.severity === "LOW").length;
  const recentAlerts  = alerts.slice(0, 4);

  const totalModels   = modelStatus.reduce((acc, s) =>
      acc + (s.kmeansReady ? 1 : 0) +
      (s.autoencoderReady ? 1 : 0) +
      (s.rfcReady ? 1 : 0) +
      (s.lrReady ? 1 : 0) +
      (s.gbrReady ? 1 : 0) +
      (s.rfrReady ? 1 : 0), 0);

  const avgLrR2 = modelStatus.length
      ? (modelStatus.reduce((a, s) => a + (s.lrR2 || 0), 0) /
          modelStatus.length).toFixed(3)
      : "—";

  const totalRuns = modelRuns.length;


  // Instrument anomaly count from alerts
  const instrumentAlerts = (instrument) =>
      alerts.filter(a => a.instrument === instrument).length;
  
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
          maxWidth: 1400, margin: "0 auto",
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
                Market Data Dashboard
              </h1>
              <p style={{
                margin: 0, marginTop: 4,
                color: C.muted, fontSize: 13,
              }}>
                Real-time validation and anomaly detection
                across FX rates and interest rate fixings
                {lastRefresh && (
                    <span style={{ marginLeft: 12 }}>
                                    · Last updated:{" "}
                      <span style={{
                        color: C.accent,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}>
                                        {lastRefresh}
                                    </span>
                                </span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                  onClick={fetchAll}
                  disabled={loading}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 12,
                    cursor: "pointer",
                  }}
              >
                {loading ? "↻ Loading..." : "↻ Refresh"}
              </button>
              <button
                  onClick={() => onNavigate("validate")}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: `linear-gradient(135deg,
                                    ${C.accent},${C.accent2})`,
                    border: "none", color: "#000",
                    fontSize: 12, fontWeight: 700,
                    cursor: "pointer",
                  }}
              >
                + Validate Rate
              </button>
            </div>
          </div>

          {/* Loading spinner */}
          {loading && (
              <div style={{
                textAlign: "center", padding: "40px 0",
                color: C.muted, fontSize: 13,
              }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  border: `3px solid ${C.border}`,
                  borderTop: `3px solid ${C.accent}`,
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 10px",
                }}/>
                Loading dashboard...
              </div>
          )}

          {!loading && (
              <>
                {/* Stat cards */}
                <div style={{
                  display: "flex", gap: 16,
                  marginBottom: 24, flexWrap: "wrap",
                }}>
                  <StatCard
                      label="Instruments Monitored"
                      value="3"
                      sub="ZAR/EUR · ZAR/USD · SOFR"
                      accent={C.accent} icon="📊"
                  />
                  <StatCard
                      label="Total Alerts"
                      value={totalAlerts}
                      sub={`${highAlerts} HIGH · ${medAlerts} MED · ${lowAlerts} LOW`}
                      accent={highAlerts > 0 ? C.red : C.green}
                      icon="⚠️"
                  />
                  <StatCard
                      label="Models Active"
                      value={totalModels}
                      sub="3 prediction · 3 validation"
                      accent={C.accent} icon="🤖"
                  />
                  <StatCard
                      label="Avg LR R²"
                      value={avgLrR2}
                      sub="Linear Regression accuracy"
                      accent={C.green} icon="📈"
                  />
                  <StatCard
                      label="Validation Runs"
                      value={totalRuns}
                      sub="Total model runs recorded"
                      accent={C.amber} icon="⚡"
                  />
                </div>

                {/* Main grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20, marginBottom: 20,
                }}>

                  {/* Recent alerts */}
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: 20,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}>
                      <h2 style={{
                        margin: 0, fontSize: 14,
                        fontWeight: 700,
                      }}>
                        Recent Anomaly Alerts
                      </h2>
                      <span
                          onClick={() => onNavigate("alerts")}
                          style={{
                            color: C.accent, fontSize: 12,
                            cursor: "pointer",
                          }}
                      >
                                        View all →
                                    </span>
                    </div>

                    {recentAlerts.length === 0 ? (
                        <div style={{
                          textAlign: "center",
                          padding: "20px 0",
                          color: C.muted, fontSize: 13,
                        }}>
                          No alerts yet
                        </div>
                    ) : (
                        recentAlerts.map((alert, i) => (
                            <AlertRow
                                key={alert.id || i}
                                instrument={alert.instrument}
                                rate={alert.rate}
                                models={alert.flaggedModels
                                    ?.split(", ") || []}
                                time={alert.receivedAt
                                    ? new Date(alert.receivedAt)
                                        .toLocaleTimeString("en-ZA")
                                    : "—"}
                                severity={alert.severity}
                            />
                        ))
                    )}
                  </div>

                  {/* Model performance */}
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: 20,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}>
                      <h2 style={{
                        margin: 0, fontSize: 14,
                        fontWeight: 700,
                      }}>
                        Model Performance
                      </h2>
                      <span
                          onClick={() => onNavigate("models")}
                          style={{
                            color: C.accent, fontSize: 12,
                            cursor: "pointer",
                          }}
                      >
                                        Details →
                                    </span>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                    }}>
                      <ModelBadge
                          name="Linear Regression"
                          r2={avgLrR2}
                          type="prediction"
                      />
                      <ModelBadge
                          name="Gradient Boosting"
                          r2={modelStatus.length
                              ? modelStatus
                                  .filter(s => s.gbrR2 > 0)
                                  .reduce((a, s) =>
                                      a + s.gbrR2, 0) /
                              Math.max(1, modelStatus
                                  .filter(s => s.gbrR2 > 0)
                                  .length)
                              : "—"}
                          type="prediction"
                      />
                      <ModelBadge
                          name="Random Forest Reg."
                          r2={modelStatus.length
                              ? (modelStatus.reduce((a, s) =>
                                      a + (s.rfrR2 || 0), 0) /
                                  modelStatus.length).toFixed(3)
                              : "—"}
                          type="prediction"
                      />
                      <ModelBadge
                          name="K-Means"
                          f1="—"
                          type="unsupervised"
                      />
                      <ModelBadge
                          name="Autoencoder"
                          f1="—"
                          type="selfsupervised"
                      />
                      <ModelBadge
                          name="RFC"
                          f1="0.898"
                          type="supervised"
                      />
                    </div>
                  </div>
                </div>

                {/* Instrument status */}
                <div style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}>
                    <h2 style={{
                      margin: 0, fontSize: 14,
                      fontWeight: 700,
                    }}>
                      Instrument Status
                    </h2>
                    <span style={{
                      color: C.muted, fontSize: 11,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                                    Based on latest alerts
                                </span>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                  }}>
                    {["ZAREUR", "ZARUSD", "SOFR"].map(inst => {
                      const status = modelStatus.find(
                          s => s.instrument === inst);
                      const alertCount = instrumentAlerts(inst);
                      const lastAlert  = alerts.find(
                          a => a.instrument === inst);
                      const hasAnomaly = alertCount > 0;
                      const col = hasAnomaly
                          ? C.amber : C.green;
                      const label = inst === "ZAREUR"
                          ? "ZAR/EUR"
                          : inst === "ZARUSD"
                              ? "ZAR/USD" : "SOFR";

                      return (
                          <div key={inst} style={{
                            background: "#0A1020",
                            border: `1px solid ${col}44`,
                            borderRadius: 10, padding: 16,
                          }}>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 12,
                            }}>
                                                <span style={{
                                                  fontWeight: 700,
                                                  fontSize: 14,
                                                  fontFamily: "'JetBrains Mono',monospace",
                                                }}>
                                                    {label}
                                                </span>
                              <span style={{
                                fontSize: 10,
                                color: col,
                                border: `1px solid ${col}44`,
                                borderRadius: 4,
                                padding: "2px 8px",
                                letterSpacing: "0.06em",
                                fontWeight: 700,
                              }}>
                                                    {hasAnomaly
                                                        ? "ANOMALY" : "VALID"}
                                                </span>
                            </div>

                            {/* Model version */}
                            <div style={{
                              fontSize: 11,
                              color: C.muted,
                              marginBottom: 8,
                              fontFamily: "'JetBrains Mono',monospace",
                            }}>
                              v{status?.modelVersion ?? "—"} ·{" "}
                              {status?.totalRates?.toLocaleString()
                                  ?? "—"} rates
                            </div>

                            {/* LR R² */}
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}>
                                                <span style={{
                                                  color: C.muted,
                                                  fontSize: 11,
                                                }}>
                                                    LR R²
                                                </span>
                              <span style={{
                                color: C.accent,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono',monospace",
                                fontWeight: 700,
                              }}>
                                                    {status?.lrR2?.toFixed(3) ?? "—"}
                                                </span>
                            </div>

                            {/* Alerts */}
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}>
                                                <span style={{
                                                  color: C.muted,
                                                  fontSize: 11,
                                                }}>
                                                    Total alerts
                                                </span>
                              <span style={{
                                color: alertCount > 0
                                    ? C.amber : C.green,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono',monospace",
                                fontWeight: 700,
                              }}>
                                                    {alertCount}
                                                </span>
                            </div>

                            {/* Last alert */}
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}>
                                                <span style={{
                                                  color: C.muted,
                                                  fontSize: 11,
                                                }}>
                                                    Last alert
                                                </span>
                              <span style={{
                                color: C.muted,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono',monospace",
                              }}>
                                                    {lastAlert?.receivedAt
                                                        ? new Date(lastAlert.receivedAt)
                                                            .toLocaleTimeString("en-ZA")
                                                        : "None"}
                                                </span>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
              </>
          )}
        </div>
        <Footer/>
      </div>
  );
}