import React, { useState } from "react";

// Mock initial client list
const INITIAL_CLIENTS = [
  { id: 1, name: "Jane Doe", goal: "10K Run & Recomp", weight: "68.2 kg", diet: "Standard", status: "Active Plan", progress: "Week 4 / 16" },
  { id: 2, name: "John Smith", goal: "Arm Hypertrophy", weight: "82.5 kg", diet: "High Protein", status: "Active Plan", progress: "Week 2 / 16" },
  { id: 3, name: "Emily Davis", goal: "Insulin Sensitivity & Fitness", weight: "74.0 kg", diet: "Eggetarian", status: "Awaiting Sync", progress: "Setup Mode" },
];

const PRESETS = [
  { name: "Cyber Neon", primary: "#6366f1", secondary: "#22d3ee", theme: "cyber" },
  { name: "Sunset Gold", primary: "#f59e0b", secondary: "#ec4899", theme: "sunset" },
  { name: "Forest Aura", primary: "#10b981", secondary: "#3b82f6", theme: "forest" },
  { name: "Electric Crimson", primary: "#f43f5e", secondary: "#8b5cf6", theme: "crimson" },
];

export default function CreatorStudio() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [selectedClient, setSelectedClient] = useState(INITIAL_CLIENTS[0]);
  const [brandName, setBrandName] = useState("Sarah's Elite Fitness");
  const [coachPersona, setCoachPersona] = useState("Empathetic, highly motivational, and focused on sustainable habits.");
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  
  // Custom Plan Builder State
  const [newPlan, setNewPlan] = useState({
    calories: "2200",
    protein: "140",
    diet: "Eggetarian",
    focus: "Recomp",
    level: "Beginner"
  });

  const [syncStatus, setSyncStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  function handlePresetSelect(preset) {
    setSelectedPreset(preset);
  }

  function handleSaveSettings() {
    setSyncStatus("✓ Branding & AI Coach Persona updated for all clients.");
    setTimeout(() => setSyncStatus(""), 3500);
  }

  function handleExportPlan() {
    setIsSyncing(true);
    setSyncStatus("");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(`✓ Successfully exported generated plan for ${selectedClient.name} to Google Sheets & generated client link!`);
      // Update local client list
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, status: "Active Plan", progress: "Week 1 / 16" } : c));
      setSelectedClient(prev => ({ ...prev, status: "Active Plan", progress: "Week 1 / 16" }));
    }, 2000);
  }

  return (
    <div className="creator-studio-container">
      {/* ─── STUDIO DASHBOARD SUMMARY ─── */}
      <div className="studio-hero-card">
        <div className="studio-hero-badge">👑 CREATOR PORTAL</div>
        <h2>{brandName} Studio</h2>
        <p className="muted">
          Manage your student/client roster, customize the client-facing AI coach, and deploy optimized fitness & nutrition blueprints.
        </p>
        <div className="studio-metrics-row">
          <div className="studio-metric">
            <span className="metric-val">{clients.length}</span>
            <span className="metric-label">Total Clients</span>
          </div>
          <div className="studio-metric">
            <span className="metric-val">{clients.filter(c => c.status === "Active Plan").length}</span>
            <span className="metric-label">Active Plans</span>
          </div>
          <div className="studio-metric">
            <span className="metric-val">12</span>
            <span className="metric-label">Total Exports</span>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className={`alert ${syncStatus.startsWith("✓") ? "success" : "error"}`} style={{ marginBottom: 20 }}>
          {syncStatus}
        </div>
      )}

      <div className="grid cols-2" style={{ alignItems: "start", gap: "20px" }}>
        
        {/* ─── LEFT COLUMN: BRANDING & AI PERSONA ─── */}
        <div className="card creator-card">
          <h3 className="creator-card-title">🎨 Custom Client Branding</h3>
          
          <div className="field">
            <label>Brand / Coach Name</label>
            <input 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)} 
              placeholder="e.g. Coach Sarah's Club"
            />
          </div>

          <div className="field">
            <label>Color Theme Preset</label>
            <div className="preset-grid">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={`preset-pill ${selectedPreset.name === preset.name ? "active" : ""}`}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    borderLeft: `4px solid ${preset.primary}`,
                    background: selectedPreset.name === preset.name ? "rgba(99, 102, 241, 0.15)" : "var(--bg-elevated)"
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>AI Coach Custom Persona & Tone</label>
            <textarea
              value={coachPersona}
              onChange={(e) => setCoachPersona(e.target.value)}
              rows={3}
              placeholder="e.g., Enthusiastic, clinical, supportive..."
            />
            <p className="field-hint" style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "4px" }}>
              This dictates how the AI coach behaves when your clients ask questions.
            </p>
          </div>

          <button 
            type="button" 
            onClick={handleSaveSettings} 
            className="secondary" 
            style={{ width: "100%", marginTop: "10px" }}
          >
            Save Brand Settings
          </button>
        </div>

        {/* ─── RIGHT COLUMN: APP PREVIEW ─── */}
        <div className="card creator-card preview-card">
          <h3 className="creator-card-title">📱 Live Client Preview</h3>
          <p className="muted" style={{ fontSize: "0.8rem", marginBottom: 12 }}>
            This is how the application layout adapts for your clients based on your brand configurations.
          </p>

          <div className="phone-preview-frame">
            <div className="phone-status-bar">
              <span>9:41</span>
              <span>📶 🔋</span>
            </div>
            <div 
              className="phone-app-header"
              style={{
                background: `linear-gradient(135deg, ${selectedPreset.primary}cc, ${selectedPreset.secondary}bb)`
              }}
            >
              <div className="header-brand-title">👑 {brandName}</div>
              <div className="header-status-indicator">✦ AI Coach Online</div>
            </div>
            
            <div className="phone-app-body">
              <div className="bubble assistant" style={{ borderColor: selectedPreset.primary }}>
                <span className="label" style={{ color: selectedPreset.primary }}>AI Coach</span>
                Hello! Welcome to your custom dashboard. I am trained as your coach: "{coachPersona.slice(0, 50)}..." How can I help you today?
              </div>

              <div className="phone-app-plan-widget">
                <div className="widget-header" style={{ borderBottom: `2px solid ${selectedPreset.primary}` }}>
                  📅 Active Plan Overview
                </div>
                <div className="widget-row">
                  <span>Diet: {selectedClient.diet}</span>
                  <span>Goal: {selectedClient.goal.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── SECTION: CLIENT ROSTER & PLAN EXPORTER ─── */}
      <div className="card creator-card" style={{ marginTop: "24px" }}>
        <h3 className="creator-card-title">👥 Client Roster & Export Studio</h3>
        <p className="muted" style={{ marginBottom: "16px" }}>
          Select a client to construct their customized plan and export it.
        </p>

        <div className="client-roster-layout">
          
          {/* Client list side */}
          <div className="client-list-column">
            {clients.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedClient(c)}
                className={`client-row-item ${selectedClient.id === c.id ? "active" : ""}`}
              >
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{c.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Goal: {c.goal}</div>
                <div className="client-status-row">
                  <span className={`client-status-pill ${c.status === "Active Plan" ? "active" : "pending"}`}>
                    {c.status}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{c.progress}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Plan builder & export side */}
          <div className="plan-builder-column">
            <h4 style={{ margin: "0 0 12px 0", color: selectedPreset.primary, fontWeight: 700 }}>
              AI Plan Builder for {selectedClient.name}
            </h4>

            <div className="grid cols-2" style={{ gap: "10px" }}>
              <div className="field">
                <label>Daily Calories</label>
                <input 
                  type="number" 
                  value={newPlan.calories} 
                  onChange={(e) => setNewPlan({ ...newPlan, calories: e.target.value })} 
                />
              </div>
              <div className="field">
                <label>Protein (g)</label>
                <input 
                  type="number" 
                  value={newPlan.protein} 
                  onChange={(e) => setNewPlan({ ...newPlan, protein: e.target.value })} 
                />
              </div>
              <div className="field">
                <label>Diet Preference</label>
                <select 
                  value={newPlan.diet} 
                  onChange={(e) => setNewPlan({ ...newPlan, diet: e.target.value })}
                >
                  <option value="Eggetarian">Eggetarian (Eggs + Veggie)</option>
                  <option value="Vegan">Vegan (100% Plant-based)</option>
                  <option value="Standard">Standard / Balanced</option>
                  <option value="Keto">Keto / High Fat</option>
                </select>
              </div>
              <div className="field">
                <label>Primary Focus</label>
                <select 
                  value={newPlan.focus} 
                  onChange={(e) => setNewPlan({ ...newPlan, focus: e.target.value })}
                >
                  <option value="Recomp">Recomp (Build Muscle, Lose Fat)</option>
                  <option value="Arm Hypertrophy">Arm Hypertrophy</option>
                  <option value="Cardio / Running">10K Running Base</option>
                </select>
              </div>
            </div>

            <div className="action-buttons-group" style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
              <button 
                type="button" 
                onClick={handleExportPlan} 
                disabled={isSyncing}
                style={{
                  background: `linear-gradient(135deg, ${selectedPreset.primary} 0%, ${selectedPreset.secondary} 100%)`,
                  flex: 1
                }}
              >
                {isSyncing ? "Exporting Plan..." : `⚡ Export to ${selectedClient.name}'s Google Sheets`}
              </button>

              <button 
                type="button" 
                className="secondary" 
                onClick={() => {
                  alert(`Successfully generated client sign-up & invite configurations for ${selectedClient.name}! Link copied to clipboard.`);
                }}
              >
                🔗 Invite Customer
              </button>
            </div>

            <div style={{ marginTop: "14px", fontSize: "0.78rem", color: "var(--muted)", lineHeight: "1.4" }}>
              💡 <em>Exporting syncs the AI-generated weekly logs, calorie distributions, and workouts to Google Drive so your clients can view and track their progress live on their phone app.</em>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
