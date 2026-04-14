import { useState } from "react";
import { C } from "../theme";
import Ticker from "../components/Ticker";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [focused, setFocused]     = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Invalid email or password.");
      }

      const data = await res.json();

      // Save token to localStorage for session
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);

      onLogin();

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.border} 1px,transparent 1px),
                          linear-gradient(90deg,${C.border} 1px,transparent 1px)`,
        backgroundSize: "48px 48px", opacity: 0.4,
      }}/>

      {/* Glow orb */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%",
        transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }}/>

      <Ticker/>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 32px",
        borderBottom: `1px solid ${C.border}`,
        background: `${C.surface}CC`,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
          display: "flex", alignItems: "center",
          justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#000",
        }}>M</div>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
          MarketGuard
        </span>
        <span style={{
          marginLeft: 8, fontSize: 10, color: C.accent,
          border: `1px solid ${C.accent}44`, borderRadius: 4,
          padding: "2px 6px", letterSpacing: "0.08em",
        }}>ML VALIDATION</span>
      </div>

      {/* Login card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24, position: "relative",
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: `${C.surface}EE`,
          border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 40,
          boxShadow: `0 0 60px ${C.accent}10, 0 24px 48px #00000060`,
          backdropFilter: "blur(20px)",
          animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg,${C.accent}22,${C.accent2}22)`,
              border: `1px solid ${C.accent}44`,
              display: "flex", alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px", fontSize: 24,
            }}>🛡️</div>
            <h1 style={{
              color: C.text, fontSize: 22, fontWeight: 700,
              margin: 0, marginBottom: 6,
            }}>Welcome back</h1>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
              Sign in to your MarketGuard account
            </p>
          </div>

          {/* Inputs */}
          {[
            { label: "Email",    value: email,    setter: setEmail,
              type: "email",    placeholder: "you@institution.com", id: "email"    },
            { label: "Password", value: password, setter: setPassword,
              type: "password", placeholder: "••••••••••••",         id: "password" },
          ].map(({ label, value, setter, type, placeholder, id }) => (
            <div key={id} style={{ marginBottom: 16 }}>
              <label style={{
                color: C.muted, fontSize: 12, fontWeight: 600,
                letterSpacing: "0.06em", display: "block", marginBottom: 6,
              }}>
                {label.toUpperCase()}
              </label>
              <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => setter(e.target.value)}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused(null)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: focused === id ? `${C.accent}08` : "#0A1020",
                  border: `1px solid ${focused === id ? C.accent : C.border}`,
                  borderRadius: 8, padding: "11px 14px",
                  color: C.text, fontSize: 14, outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
            </div>
          ))}

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px",
              background: `${C.red}11`,
              border: `1px solid ${C.red}44`,
              borderRadius: 8, color: C.red, fontSize: 12,
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: "flex", justifyContent: "flex-end", marginBottom: 24,
          }}>
            <span style={{ color: C.accent, fontSize: 12, cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading
                ? C.border
                : `linear-gradient(135deg,${C.accent},${C.accent2})`,
              border: "none", borderRadius: 8,
              color: loading ? C.muted : "#000",
              fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", letterSpacing: "0.04em",
            }}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>

          <div style={{
            marginTop: 24, padding: "12px 16px",
            background: "#0A1020", borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}>
            <p style={{
              color: C.muted, fontSize: 11, margin: 0, textAlign: "center",
            }}>
              🔒 Protected by JWT authentication · TLS 1.3 encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}