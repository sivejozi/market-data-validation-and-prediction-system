import { useState } from "react";
import { C } from "../theme";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function Section({ title, children }) {
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, padding:24, marginBottom:20,
    }}>
      <h2 style={{ margin:0, marginBottom:20, fontSize:14, fontWeight:700, borderBottom:`1px solid ${C.border}`, paddingBottom:12 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"12px 0",
      borderBottom:`1px solid ${C.border}`,
    }}>
      <div>
        <p style={{ color:C.text, fontSize:13, fontWeight:600, margin:0 }}>{label}</p>
        {description && <p style={{ color:C.muted, fontSize:11, margin:0, marginTop:2 }}>{description}</p>}
      </div>
      <div style={{ marginLeft:24 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:44, height:24, borderRadius:12,
      background: value ? C.accent : C.border,
      position:"relative", cursor:"pointer",
      transition:"background 0.2s",
    }}>
      <div style={{
        width:18, height:18, borderRadius:"50%",
        background:"white",
        position:"absolute", top:3,
        left: value ? 23 : 3,
        transition:"left 0.2s",
      }}/>
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step }) {
  return (
    <input
      type="number"
      value={value}
      min={min} max={max} step={step}
      onChange={e => onChange(e.target.value)}
      style={{
        width:80, background:"#0A1020",
        border:`1px solid ${C.border}`, borderRadius:8,
        padding:"6px 10px", color:C.text, fontSize:13,
        outline:"none", fontFamily:"'JetBrains Mono',monospace",
        textAlign:"right",
      }}
    />
  );
}

export default function Settings({ activeNav, onNavigate, onLogout }) {
  const [settings, setSettings] = useState({
    // Instruments
    zareur: true,
    zarusd: true,
    sofr:   true,
    // Models
    kmeans:      true,
    autoencoder: true,
    rfc:         true,
    lr:          true,
    gbr:         true,
    rfr:         true,
    // Thresholds
    kmeansThreshold:      2.0,
    autoencoderThreshold: 2.0,
    consensusMinModels:   2,
    // Kafka
    kafkaAlerts: true,
    alertTopic: "market.rates.alert",
    // System
    cacheEnabled: true,
    cacheTTL: 24,
  });

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans',sans-serif", color:C.text,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');`}</style>
      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>

      <div style={{ flex:1, padding:"24px", maxWidth:900, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* Header */}
        <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Settings</h1>
            <p style={{ margin:0, marginTop:4, color:C.muted, fontSize:13 }}>
              Configure instruments, models, thresholds and alerting
            </p>
          </div>
          <button onClick={handleSave} style={{
            padding:"10px 24px", borderRadius:8, border:"none",
            background: saved
              ? `${C.green}22`
              : `linear-gradient(135deg,${C.accent},${C.accent2})`,
            color: saved ? C.green : "#000",
            fontSize:13, fontWeight:700, cursor:"pointer",
            border: saved ? `1px solid ${C.green}44` : "none",
            transition:"all 0.2s",
          }}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>

        {/* Instruments */}
        <Section title="Instruments">
          <SettingRow label="ZAR/EUR" description="South African Rand / Euro">
            <Toggle value={settings.zareur} onChange={v => set("zareur", v)}/>
          </SettingRow>
          <SettingRow label="ZAR/USD" description="South African Rand / US Dollar">
            <Toggle value={settings.zarusd} onChange={v => set("zarusd", v)}/>
          </SettingRow>
          <SettingRow label="SOFR" description="Secured Overnight Financing Rate">
            <Toggle value={settings.sofr} onChange={v => set("sofr", v)}/>
          </SettingRow>
        </Section>

        {/* Validation Models */}
        <Section title="Validation Models">
          <SettingRow label="K-Means Clustering" description="Unsupervised — rate-level regime detection">
            <Toggle value={settings.kmeans} onChange={v => set("kmeans", v)}/>
          </SettingRow>
          <SettingRow label="Autoencoder" description="Self-supervised — multivariate behavioural anomaly detection">
            <Toggle value={settings.autoencoder} onChange={v => set("autoencoder", v)}/>
          </SettingRow>
          <SettingRow label="Random Forest Classifier" description="Supervised — trained on K-Means labels">
            <Toggle value={settings.rfc} onChange={v => set("rfc", v)}/>
          </SettingRow>
        </Section>

        {/* Prediction Models */}
        <Section title="Prediction Models">
          <SettingRow label="Linear Regression" description="Primary prediction model — R² > 0.98 across all instruments">
            <Toggle value={settings.lr} onChange={v => set("lr", v)}/>
          </SettingRow>
          <SettingRow label="Gradient Boosting Regressor" description="Ensemble — competitive on FX, limited on interest rates">
            <Toggle value={settings.gbr} onChange={v => set("gbr", v)}/>
          </SettingRow>
          <SettingRow label="Random Forest Regressor" description="Ensemble — consistent cross-instrument performance">
            <Toggle value={settings.rfr} onChange={v => set("rfr", v)}/>
          </SettingRow>
        </Section>

        {/* Thresholds */}
        <Section title="Anomaly Detection Thresholds">
          <SettingRow
            label="K-Means Threshold Multiplier"
            description="Anomaly if distance > mean + (multiplier × σ)"
          >
            <NumberInput value={settings.kmeansThreshold} onChange={v => set("kmeansThreshold", v)} min={1} max={5} step={0.1}/>
          </SettingRow>
          <SettingRow
            label="Autoencoder Threshold Multiplier"
            description="Anomaly if reconstruction error > mean + (multiplier × σ)"
          >
            <NumberInput value={settings.autoencoderThreshold} onChange={v => set("autoencoderThreshold", v)} min={1} max={5} step={0.1}/>
          </SettingRow>
          <SettingRow
            label="Consensus Minimum Models"
            description="Minimum number of models that must agree to publish an alert"
          >
            <NumberInput value={settings.consensusMinModels} onChange={v => set("consensusMinModels", v)} min={1} max={3} step={1}/>
          </SettingRow>
        </Section>

        {/* Kafka Alerting */}
        <Section title="Kafka Alerting">
          <SettingRow label="Publish Alerts to Kafka" description="Publish anomaly events to market.rates.alert topic">
            <Toggle value={settings.kafkaAlerts} onChange={v => set("kafkaAlerts", v)}/>
          </SettingRow>
          <SettingRow label="Alert Topic" description="Kafka topic for anomaly alert events">
            <input
              value={settings.alertTopic}
              onChange={e => set("alertTopic", e.target.value)}
              style={{
                width:220, background:"#0A1020",
                border:`1px solid ${C.border}`, borderRadius:8,
                padding:"6px 10px", color:C.accent, fontSize:12,
                outline:"none", fontFamily:"'JetBrains Mono',monospace",
              }}
            />
          </SettingRow>
        </Section>

        {/* System */}
        <Section title="System">
          <SettingRow label="Model Cache" description="Cache trained models to reduce validation latency">
            <Toggle value={settings.cacheEnabled} onChange={v => set("cacheEnabled", v)}/>
          </SettingRow>
          <SettingRow
            label="Cache TTL (hours)"
            description="Retrain models after this many hours"
          >
            <NumberInput value={settings.cacheTTL} onChange={v => set("cacheTTL", v)} min={1} max={168} step={1}/>
          </SettingRow>
        </Section>

      </div>
      <Footer/>
    </div>
  );
}
