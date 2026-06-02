import React, { useState, useEffect } from "react";
import { apiFetch } from "./api.js";
import CoachChat from "./components/CoachChat.jsx";
import LogForms from "./components/LogForms.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HelpGuide from "./components/HelpGuide.jsx";

const tabs = [
  { id: "coach", label: "Coach", icon: "✦" },
  { id: "log", label: "Log", icon: "◆" },
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "help", label: "Help & Guide", icon: "❖" },
];

export default function App() {
  const [active, setActive] = useState("coach");
  const [preloadedPrompt, setPreloadedPrompt] = useState("");
  
  // Dynamic system status from backend
  const [systemStatus, setSystemStatus] = useState({
    gemini_configured: false,
    sheets_configured: false,
    service_account_provided: false,
    service_account_email: "250801762919-compute@developer.gserviceaccount.com"
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStatus() {
    try {
      setError("");
      const res = await apiFetch("/api/dashboard/overview");
      if (res.status) {
        setSystemStatus(res.status);
      }
      setDashboardData(res);
      if (res.error) {
        setError(res.error);
      }
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  function handleSelectPrompt(prompt) {
    setPreloadedPrompt(prompt);
    setActive("coach");
  }

  // Live Sync Badge Rendering
  const isConnected = systemStatus.sheets_configured && !error;

  return (
    <div className="app-shell">
      {/* Redesigned Header bar */}
      <div className="header-bar">
        <div className="hero-content">
          <div className="hero-badges">
            <span className="badge brand">AI Training System</span>
            <span className="badge">GCP Cloud Run</span>
          </div>
          <h1>MyFitness AI Coach</h1>
          <p>Track progress, log workouts, and get smart, personalized guidance for recomp, arms, and your 10K goal.</p>
        </div>

        {/* Live sync card */}
        <div className="connection-status-card">
          <div className={`status-indicator ${isConnected ? "active" : "warning"}`} />
          <div className="status-details">
            <span className="status-title">
              {isConnected ? "Google Sheets Connected" : "Sheets Offline Mode"}
            </span>
            <span className="status-subtitle">
              {isConnected ? "Auto-syncing to your Drive database" : "Configuration required for sync"}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Tabs Navigation Navbar */}
      <div className="tab-navbar">
        <div className="nav-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              data-tab={t.id}
              onClick={() => setActive(t.id)}
              className={`tab-btn ${active === t.id ? "active" : ""}`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        
        {!isConnected && active !== "help" ? (
          <button 
            type="button" 
            className="secondary" 
            style={{ fontSize: "0.8rem", padding: "8px 16px" }}
            onClick={() => setActive("help")}
          >
            ⚙ View Setup Guide
          </button>
        ) : null}
      </div>

      {/* Main Premium Container Panel */}
      <div className="premium-panel">
        {active === "coach" ? (
          <CoachChat 
            preloadedPrompt={preloadedPrompt} 
            clearPreloadedPrompt={() => setPreloadedPrompt("")}
            sheetsConnected={isConnected}
          />
        ) : null}
        
        {active === "log" ? (
          <LogForms 
            onSaveSuccess={fetchStatus} 
            sheetsConnected={isConnected}
          />
        ) : null}
        
        {active === "dashboard" ? (
          <Dashboard 
            dashboardData={dashboardData}
            loading={loading}
            error={error}
            refetch={fetchStatus}
            onNavigateToHelp={() => setActive("help")}
          />
        ) : null}

        {active === "help" ? (
          <HelpGuide 
            onSelectPrompt={handleSelectPrompt}
          />
        ) : null}
      </div>
    </div>
  );
}
