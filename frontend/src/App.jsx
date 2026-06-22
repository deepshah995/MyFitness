import React, { useState, useEffect } from "react";
import { apiFetch } from "./api.js";
import CoachChat from "./components/CoachChat.jsx";
import LogForms from "./components/LogForms.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HelpGuide from "./components/HelpGuide.jsx";
import Blueprint from "./components/Blueprint.jsx";
import CreatorStudio from "./components/CreatorStudio.jsx";
import AgencyDashboard from "./components/AgencyDashboard.jsx";
import AuthScreen from "./components/AuthScreen.jsx";

// ── Capacitor Native Plugin stubs ────────────────────────────────────
async function initNativePlugins() { /* no-op in PWA/browser */ }
async function hapticTap() { /* no-op in PWA/browser */ }

const PRESETS = [
  { name: "Cyber Neon", primary: "#6366f1", secondary: "#22d3ee", theme: "cyber" },
  { name: "Sunset Gold", primary: "#f59e0b", secondary: "#ec4899", theme: "sunset" },
  { name: "Forest Aura", primary: "#10b981", secondary: "#3b82f6", theme: "forest" },
  { name: "Electric Crimson", primary: "#f43f5e", secondary: "#8b5cf6", theme: "crimson" },
  { name: "Hypertrophy Orange", primary: "#f97316", secondary: "#ef4444", theme: "hypertrophy" },
  { name: "CrossFit Red", primary: "#dc2626", secondary: "#111827", theme: "crossfit" },
  { name: "Pilates Mint", primary: "#2dd4bf", secondary: "#34d399", theme: "pilates" },
  { name: "Endurance Blue", primary: "#3b82f6", secondary: "#8b5cf6", theme: "endurance" },
];

function applyBrandingColors(branding) {
  if (!branding) return;
  if (branding.preset_theme === "custom" && branding.custom_primary) {
    document.documentElement.style.setProperty("--primary", branding.custom_primary);
    document.documentElement.style.setProperty("--secondary", branding.custom_secondary || branding.custom_primary);
  } else {
    const preset = PRESETS.find(p => p.theme === branding.preset_theme) || PRESETS[0];
    document.documentElement.style.setProperty("--primary", preset.primary);
    document.documentElement.style.setProperty("--secondary", preset.secondary);
  }
}

const tabs = [
  { id: "coach",     label: "Coach",     icon: "✦",  mobileLabel: "Coach"   },
  { id: "log",       label: "Log",       icon: "◆",  mobileLabel: "Log"     },
  { id: "blueprint", label: "Blueprint", icon: "❖",  mobileLabel: "Plan"    },
  { id: "dashboard", label: "Dashboard", icon: "▣",  mobileLabel: "Sync"    },
  { id: "creator",   label: "Studio",    icon: "👑", mobileLabel: "Studio"  },
  { id: "agency",    label: "Agency",    icon: "🏢", mobileLabel: "Agency"  },
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
  const [user, setUser] = useState(null);
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
    const savedUser = localStorage.getItem("fitness_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      applyBrandingColors(parsed.branding);
    }
    fetchStatus();
    initNativePlugins();
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
    localStorage.setItem("fitness_user", JSON.stringify(userData));
    applyBrandingColors(userData.branding);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("fitness_user");
    document.documentElement.style.setProperty("--primary", "#6366f1");
    document.documentElement.style.setProperty("--secondary", "#22d3ee");
  }

  function handleSelectPrompt(prompt) {
    setPreloadedPrompt(prompt);
    setActive("coach");
  }

  // Database Connection Badge Rendering
  const isDbConnected = systemStatus.db_connected && !error;

  // Filter tabs by user role to enforce space personalization & isolation
  const visibleTabs = tabs.filter((t) => {
    if (t.id === "creator") {
      return user && (user.role === "coach" || user.role === "agency");
    }
    if (t.id === "agency") {
      return user && user.role === "agency";
    }
    return true; // Everyone sees coach, log, blueprint, dashboard, setup
  });

  // Intercept layout if not logged in
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const brandTitle = user?.branding?.brand_name || "MyFitness AI";
  const logoUrl = user?.branding?.logo_url || "👑";

  return (
    <div className="app-shell">

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-text-block" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Logo element: text/emoji or image */}
          <div className="app-logo-wrap" style={{ fontSize: "2.4rem", display: "flex", alignItems: "center" }}>
            {logoUrl.startsWith("data:image") ? (
              <img src={logoUrl} alt="Logo" style={{ height: "48px", width: "48px", borderRadius: "8px", objectFit: "cover" }} />
            ) : (
              <span>{logoUrl}</span>
            )}
          </div>
          <div>
            {/* Desktop badge */}
            {!isMobile && (
              <div className="hero-badge hero-desktop-badge">
                <span style={{ marginRight: "10px" }}>✦ AI Training System</span>
                <span style={{ textTransform: "uppercase" }}>❖ Role: {user.role}</span>
              </div>
            )}
            <h1>{brandTitle}</h1>
            {!isMobile && (
              <p style={{ marginTop: "6px", fontSize: "0.88rem" }}>
                Welcome back, <strong>{user.email}</strong>. Track progress, logs, and get smart guidance from your custom AI coach, Arti.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* DB connection status card */}
          <div className="connection-status-card">
            <div className={`status-indicator ${isDbConnected ? "active" : "warning"}`} />
            <div className="status-details">
              <span className="status-title">
                {isDbConnected ? "Database Active" : "Local Sync"}
              </span>
              <span className="status-subtitle">
                {isDbConnected ? "SQLite Engine Online" : "SQLite Stalled"}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            className="secondary" 
            onClick={handleLogout}
            style={{ 
              padding: "8px 16px", 
              fontSize: "0.8rem", 
              borderRadius: "999px", 
              background: "rgba(244, 63, 94, 0.12)", 
              border: "1px solid rgba(244, 63, 94, 0.25)", 
              color: "#f43f5e",
              cursor: "pointer",
              boxShadow: "none"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── DESKTOP TAB ROW ────────────────────────────────── */}
      <div className="tab-row-wrapper">
        <div
          className="tab-row"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {visibleTabs.map((t) => (
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

          {active !== "help" ? (
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "0.8rem", padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", boxShadow: "none" }}
              onClick={() => setActive("help")}
            >
              ⚙ View Help Guide
            </button>
          ) : null}
        </div>
      </div>

      {/* ── MAIN PANEL ─────────────────────────────────────── */}
      <div className="panel">
        {active === "coach" ? (
          <CoachChat
            user={user}
            preloadedPrompt={preloadedPrompt}
            clearPreloadedPrompt={() => setPreloadedPrompt("")}
          />
        ) : null}

        {active === "log" ? (
          <LogForms
            user={user}
            onSaveSuccess={fetchStatus}
          />
        ) : null}

        {active === "dashboard" ? (
          <Dashboard
            user={user}
            dashboardData={dashboardData}
            loading={loading}
            error={error}
            refetch={fetchStatus}
            onNavigateToHelp={() => setActive("help")}
          />
        ) : null}

        {active === "blueprint" ? (
          <Blueprint user={user} />
        ) : null}

        {active === "creator" ? (
          <CreatorStudio user={user} />
        ) : null}

        {active === "agency" ? (
          <AgencyDashboard />
        ) : null}

        {active === "help" ? (
          <HelpGuide
            onSelectPrompt={handleSelectPrompt}
          />
        ) : null}
      </div>

      {/* ── BOTTOM NAVIGATION BAR (mobile only) ────────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {visibleTabs.map((t) => (
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
