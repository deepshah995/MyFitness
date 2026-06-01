import React, { useState } from "react";
import CoachChat from "./components/CoachChat.jsx";
import Dashboard from "./components/Dashboard.jsx";
import LogForms from "./components/LogForms.jsx";

const tabs = [
  { id: "coach", label: "Coach" },
  { id: "log", label: "Log" },
  { id: "dashboard", label: "Dashboard" },
];

export default function App() {
  const [active, setActive] = useState("coach");

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>MyFitness AI Coach</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: active === t.id ? "2px solid #0ea5e9" : "1px solid #d1d5db",
              background: active === t.id ? "#ecfeff" : "white",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "coach" ? <CoachChat /> : null}
      {active === "log" ? <LogForms /> : null}
      {active === "dashboard" ? <Dashboard /> : null}
    </div>
  );
}

