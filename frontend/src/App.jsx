import React, { useState, useEffect } from "react";
import { apiFetch } from "./api.js";
import CoachChat from "./components/CoachChat.jsx";
import LogForms from "./components/LogForms.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HelpGuide from "./components/HelpGuide.jsx";
import Blueprint from "./components/Blueprint.jsx";
import CreatorStudio from "./components/CreatorStudio.jsx";

// ── Capacitor Native Plugin stubs ────────────────────────────────────
// These are no-ops in the browser / PWA.
// When @capacitor/* packages are installed (native build), swap these
// back to dynamic imports: await import("@capacitor/status-bar") etc.
async function initNativePlugins() { /* no-op in PWA/browser */ }
async function hapticTap() { /* no-op in PWA/browser */ }


const tabs = [
  { id: "coach",     label: "Coach",     icon: "✦",  mobileLabel: "Coach"   },
  { id: "log",       label: "Log",       icon: "◆",  mobileLabel: "Log"     },
  { id: "blueprint", label: "Blueprint", icon: "❖",  mobileLabel: "Plan"    },
  { id: "dashboard", label: "Dashboard", icon: "▣",  mobileLabel: "Sync"    },
  { id: "creator",   label: "Studio",    icon: "👑", mobileLabel: "Studio"  },
  { id: "help",      label: "Setup",     icon: "⚙",  mobileLabel: "Setup"   },
];

/** Returns true when the viewport is phone-width */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [active, setActive] = useState("coach");
  const [preloadedPrompt, setPreloadedPrompt] = useState("");
  const isMobile = useIsMobile();

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
    // Fire native plugin setup (no-op in browser)
    initNativePlugins();
  }, []);

  function handleSelectPrompt(prompt) {
    setPreloadedPrompt(prompt);
    setActive("coach");
  }

  // Live Sync Badge Rendering
  const isConnected = systemStatus.sheets_configured && !error;

  return (
    <div className="app-shell">

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-text-block">
          {/* Desktop badge - hidden on mobile via CSS */}
          {!isMobile && (
            <div className="hero-badge hero-desktop-badge">
              <span style={{ marginRight: "10px" }}>✦ AI Training System</span>
              <span>❖ GCP Cloud Run</span>
            </div>
          )}
          <h1>MyFitness AI{isMobile ? "" : " Coach"}</h1>
          {!isMobile && (
            <p style={{ marginTop: "10px" }}>
              Track progress, log workouts, and get smart, personalized guidance for recomp, arms, and your 10K goal.
            </p>
          )}
        </div>

        {/* Live sync card */}
        <div className="connection-status-card">
          <div className={`status-indicator ${isConnected ? "active" : "warning"}`} />
          <div className="status-details">
            <span className="status-title">
              {isConnected ? "Sheets Connected" : "Offline Mode"}
            </span>
            <span className="status-subtitle">
              {isConnected ? "Auto-syncing to Drive" : "Config required"}
            </span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP TAB ROW ────────────────────────────────── */}
      <div className="tab-row-wrapper">
        <div
          className="tab-row"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
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

          {!isConnected && active !== "help" ? (
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "0.8rem", padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", boxShadow: "none" }}
              onClick={() => setActive("help")}
            >
              ⚙ View Setup Guide
            </button>
          ) : null}
        </div>
      </div>

      {/* ── MAIN PANEL ─────────────────────────────────────── */}
      <div className="panel">
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

        {active === "blueprint" ? (
          <Blueprint />
        ) : null}

        {active === "creator" ? (
          <CreatorStudio />
        ) : null}

        {active === "help" ? (
          <HelpGuide
            onSelectPrompt={handleSelectPrompt}
          />
        ) : null}
      </div>

      {/* ── BOTTOM NAVIGATION BAR (mobile only) ────────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`bottom-nav-item ${active === t.id ? "active" : ""}`}
            onClick={() => { hapticTap(); setActive(t.id); }}
            aria-label={t.label}
            aria-current={active === t.id ? "page" : undefined}
          >
            <span className="nav-icon-wrap">
              <span className="nav-icon" aria-hidden="true">{t.icon}</span>
            </span>
            <span className="nav-label">{t.mobileLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
