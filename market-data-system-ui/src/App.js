import { useState } from "react";
import LoginScreen from "./login/LoginScreen";
import Dashboard from "./dashboard/Dashboard";
import { ValidateRate, Historical, Models, Alerts, Settings, Prediction } from "./screens";

export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  const commonProps = {
    activeNav,
    onNavigate: setActiveNav,
    onLogout: () => { setLoggedIn(false); setActiveNav("dashboard"); },
  };

  const screens = {
    dashboard:  <Dashboard  {...commonProps} />,
    validate:   <ValidateRate {...commonProps} />,
    historical: <Historical {...commonProps} />,
    models:     <Models     {...commonProps} />,
    alerts:     <Alerts     {...commonProps} />,
    settings:   <Settings   {...commonProps} />,
    prediction:   <Prediction   {...commonProps} />,
  };

  return screens[activeNav] || screens.dashboard;
}
