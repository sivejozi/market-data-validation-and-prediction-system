import { C } from "./theme";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function PlaceholderScreen({ title, description, icon, activeNav, onNavigate, onLogout }) {
  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans',sans-serif", color:C.text,
    }}>
      <NavBar activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:48 }}>{icon}</div>
        <h1 style={{ margin:0, fontSize:20, fontWeight:700 }}>{title}</h1>
        <p style={{ color:C.muted, fontSize:13, margin:0 }}>{description}</p>
        <div style={{
          padding:"8px 16px", borderRadius:8,
          border:`1px solid ${C.accent}44`, color:C.accent, fontSize:12,
        }}>Coming soon</div>
      </div>
      <Footer/>
    </div>
  );
}

export { default as ValidateRate } from "./validate/ValidateRate";

export function Historical({ activeNav, onNavigate, onLogout }) {
  return <PlaceholderScreen title="Historical Analysis" description="Anomaly history and trend analysis per instrument" icon="📈" activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>;
}

export function Models({ activeNav, onNavigate, onLogout }) {
  return <PlaceholderScreen title="Model Performance" description="Detailed metrics, confusion matrices and R² charts" icon="🤖" activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>;
}

export function Alerts({ activeNav, onNavigate, onLogout }) {
  return <PlaceholderScreen title="Alerts" description="Full alert history with filtering and severity breakdown" icon="🔔" activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>;
}

export function Settings({ activeNav, onNavigate, onLogout }) {
  return <PlaceholderScreen title="Settings" description="System configuration and user preferences" icon="⚙️" activeNav={activeNav} onNavigate={onNavigate} onLogout={onLogout}/>;
}
