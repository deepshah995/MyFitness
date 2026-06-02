import React, { useState } from "react";
import CoachChat from "./components/CoachChat.jsx";
import Dashboard from "./components/Dashboard.jsx";
import LogForms from "./components/LogForms.jsx";

const tabs = [
  { id: "coach", label: "Coach", icon: "✦" },
  { id: "log", label: "Log", icon: "◆" },
  { id: "dashboard", label: "Dashboard", icon: "▣" },
];

export default function App() {
  const [active, setActive] = useState("coach");

  return (
    <div className="app-shell">
      <div className="hero">
        <div>
          <div className="hero-badge">AI · Sheets · Training</div>
          <h1>MyFitness AI Coach</h1>
          <p>Track progress, log workouts, and get smart, personalized guidance for recomp, arms, and your 10K goal.</p>
        </div>
      </div>
      <div className="tab-row">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`pill ${active === t.id ? "active" : ""}`}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {active === "coach" ? <CoachChat /> : null}
        {active === "log" ? <LogForms /> : null}
        {active === "dashboard" ? <Dashboard /> : null}
      </div>
    </div>
  );
}
