import React, { useState, useEffect } from "react";
import { apiFetch } from "../api.js";

const PRESETS = [
  { name: "Cyber Neon", primary: "#6366f1", secondary: "#22d3ee", theme: "cyber" },
  { name: "Sunset Gold", primary: "#f59e0b", secondary: "#ec4899", theme: "sunset" },
  { name: "Forest Aura", primary: "#10b981", secondary: "#3b82f6", theme: "forest" },
  { name: "Electric Crimson", primary: "#f43f5e", secondary: "#8b5cf6", theme: "crimson" },
  { name: "Hypertrophy Orange", primary: "#f97316", secondary: "#ef4444", theme: "hypertrophy" },
  { name: "CrossFit Red", primary: "#dc2626", secondary: "#111827", theme: "crossfit" },
  { name: "Pilates Mint", primary: "#2dd4bf", secondary: "#34d399", theme: "pilates" },
  { name: "Endurance Blue", primary: "#3b82f6", secondary: "#8b5cf6", theme: "endurance" },
  { name: "Custom Palette 🎨", primary: "#6366f1", secondary: "#22d3ee", theme: "custom" },
];

export default function CreatorStudio({ user }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [brandName, setBrandName] = useState("Sterling Strength Studio");
  const [coachPersona, setCoachPersona] = useState("Empathetic, highly motivational, and focused on sustainable habits.");
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  
  // Custom Color overrides for preset "custom"
  const [customPrimary, setCustomPrimary] = useState("#6366f1");
  const [customSecondary, setCustomSecondary] = useState("#22d3ee");

  // Logo Override
  const [logoUrl, setLogoUrl] = useState("👑");

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

  // New Client Form State
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientGoal, setNewClientGoal] = useState("");
  const [newClientWeight, setNewClientWeight] = useState("70 kg");
  const [newClientDiet, setNewClientDiet] = useState("Standard");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("password");

  // AI Prompt Plan State
  const [promptPlanInstruction, setPromptPlanInstruction] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Fetch coach and clients data on mount
  useEffect(() => {
    fetchCoachSettings();
    fetchClients();
  }, []);

  async function fetchCoachSettings() {
    try {
      const coachId = user?.coach_id || 1;
      const data = await apiFetch(`/api/db/coaches/${coachId}`);
      if (data) {
        setBrandName(data.brand_name);
        setCoachPersona(data.persona);
        setLogoUrl(data.logo_url || "👑");
        setCustomPrimary(data.custom_primary || "#6366f1");
        setCustomSecondary(data.custom_secondary || "#22d3ee");
        
        const preset = PRESETS.find(p => p.theme === data.preset_theme) || PRESETS[0];
        setSelectedPreset(preset);
        
        // Apply styling colors locally
        if (data.preset_theme === "custom" && data.custom_primary) {
          document.documentElement.style.setProperty("--primary", data.custom_primary);
          document.documentElement.style.setProperty("--secondary", data.custom_secondary || data.custom_primary);
        } else {
          document.documentElement.style.setProperty("--primary", preset.primary);
          document.documentElement.style.setProperty("--secondary", preset.secondary);
        }
      }
    } catch (err) {
      console.error("Failed to fetch coach settings", err);
    }
  }

  async function fetchClients() {
    try {
      const coachId = user?.coach_id || 1;
      const data = await apiFetch(`/api/db/coaches/${coachId}/clients`);
      setClients(data);
      if (data && data.length > 0) {
        setSelectedClient(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch client roster", err);
    }
  }

  function handlePresetSelect(preset) {
    setSelectedPreset(preset);
    if (preset.theme !== "custom") {
      document.documentElement.style.setProperty("--primary", preset.primary);
      document.documentElement.style.setProperty("--secondary", preset.secondary);
    } else {
      document.documentElement.style.setProperty("--primary", customPrimary);
      document.documentElement.style.setProperty("--secondary", customSecondary);
    }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveSettings() {
    try {
      const coachId = user?.coach_id || 1;
      await apiFetch(`/api/db/coaches/${coachId}`, {
        method: "PUT",
        body: {
          brand_name: brandName,
          persona: coachPersona,
          preset_theme: selectedPreset.theme,
          logo_url: logoUrl,
          custom_primary: selectedPreset.theme === "custom" ? customPrimary : null,
          custom_secondary: selectedPreset.theme === "custom" ? customSecondary : null
        }
      });
      
      // Update session storage so logo & brand title refreshes locally in header
      const savedUser = localStorage.getItem("fitness_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.branding = {
          brand_name: brandName,
          preset_theme: selectedPreset.theme,
          persona: coachPersona,
          logo_url: logoUrl,
          custom_primary: selectedPreset.theme === "custom" ? customPrimary : null,
          custom_secondary: selectedPreset.theme === "custom" ? customSecondary : null
        };
        localStorage.setItem("fitness_user", JSON.stringify(parsed));
      }
      
      setSyncStatus("✓ Custom branding options saved to database.");
      setTimeout(() => setSyncStatus(""), 3500);
    } catch (err) {
      setSyncStatus("❌ Failed to save configurations: " + err.message);
      setTimeout(() => setSyncStatus(""), 3500);
    }
  }

  async function handleExportPlan() {
    if (!selectedClient) return;
    setIsSyncing(true);
    setSyncStatus("");
    try {
      const formattedGoal = `${newPlan.focus} (${newPlan.calories} kcal, ${newPlan.protein}g protein)`;
      await apiFetch(`/api/db/clients/${selectedClient.id}`, {
        method: "PUT",
        body: {
          goal: formattedGoal,
          weight: selectedClient.weight,
          diet: newPlan.diet,
          status: "Active Plan",
          progress: "Week 1 / 16"
        }
      });
      setIsSyncing(false);
      setSyncStatus(`✓ Successfully exported generated plan for ${selectedClient.name} to Database!`);
      fetchClients();
    } catch (err) {
      setIsSyncing(false);
      setSyncStatus("❌ Failed to export: " + err.message);
    }
  }

  async function handleAddClient(e) {
    e.preventDefault();
    if (!newClientName || !newClientGoal) {
      alert("Please enter a name and initial goal.");
      return;
    }
    try {
      const coachId = user?.coach_id || 1;
      await apiFetch(`/api/db/coaches/${coachId}/clients`, {
        method: "POST",
        body: {
          name: newClientName,
          goal: newClientGoal,
          weight: newClientWeight || "70 kg",
          diet: newClientDiet,
          email: newClientEmail || null,
          password: newClientPassword || "password"
        }
      });
      setNewClientName("");
      setNewClientGoal("");
      setNewClientWeight("70 kg");
      setNewClientDiet("Standard");
      setNewClientEmail("");
      setNewClientPassword("password");
      setShowAddClientForm(false);
      fetchClients();
    } catch (err) {
      alert("Failed to invite client: " + err.message);
    }
  }


  async function handleAIGeneratePlan() {
    if (!promptPlanInstruction.trim()) {
      alert("Please describe what features or rules you want in the plan first.");
      return;
    }
    setIsGeneratingPlan(true);
    try {
      const data = await apiFetch("/api/ai/parse-program", {
        method: "POST",
        body: { instruction: promptPlanInstruction }
      });
      setNewPlan({
        calories: data.calories,
        protein: data.protein,
        diet: data.diet,
        focus: data.focus,
        level: "Beginner"
      });
      setPromptPlanInstruction("");
      setSyncStatus("✓ AI built the plan parameters! Review and tweak below.");
      setTimeout(() => setSyncStatus(""), 4000);
    } catch (err) {
      alert("Plan parsing failed: " + err.message);
    } finally {
      setIsGeneratingPlan(false);
    }
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
              placeholder="e.g. Coach Kabir's Club"
            />
          </div>

          <div className="field" style={{ marginTop: "14px" }}>
            <label>Brand Logo (Emoji / Character or Image Upload)</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={logoUrl.startsWith("data:image") ? "" : logoUrl}
                onChange={(e) => setLogoUrl(e.target.value || "👑")}
                placeholder="Emoji or character (e.g. 👑, ⚡, ✦)"
                maxLength={5}
                style={{ flex: 1 }}
                disabled={logoUrl.startsWith("data:image")}
              />
              {logoUrl.startsWith("data:image") ? (
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={() => setLogoUrl("👑")}
                  style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                >
                  Clear Image
                </button>
              ) : (
                <div style={{ position: "relative" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="logo-upload-input"
                    style={{ display: "none" }}
                  />
                  <label 
                    htmlFor="logo-upload-input" 
                    className="secondary pill" 
                    style={{ 
                      padding: "10px 14px", 
                      fontSize: "0.8rem", 
                      background: "rgba(255,255,255,0.06)", 
                      border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "inline-block"
                    }}
                  >
                    Upload Logo PNG
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="field" style={{ marginTop: "14px" }}>
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

          {selectedPreset.theme === "custom" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "12px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: "0.75rem" }}>Primary Hex Color</label>
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => {
                    setCustomPrimary(e.target.value);
                    document.documentElement.style.setProperty("--primary", e.target.value);
                  }}
                  style={{ height: "40px", padding: "2px", cursor: "pointer", border: "none", background: "none" }}
                />
              </div>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: "0.75rem" }}>Secondary Hex Color</label>
                <input
                  type="color"
                  value={customSecondary}
                  onChange={(e) => {
                    setCustomSecondary(e.target.value);
                    document.documentElement.style.setProperty("--secondary", e.target.value);
                  }}
                  style={{ height: "40px", padding: "2px", cursor: "pointer", border: "none", background: "none" }}
                />
              </div>
            </div>
          )}

          <div className="field" style={{ marginTop: "14px" }}>
            <label>Arti (AI Coach) Custom Persona & Tone</label>
            <textarea
              value={coachPersona}
              onChange={(e) => setCoachPersona(e.target.value)}
              rows={3}
              placeholder="e.g., Enthusiastic, clinical, supportive..."
            />
            <p className="field-hint" style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "4px" }}>
              This dictates how Arti behaves when your clients ask questions.
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
                background: `linear-gradient(135deg, ${selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary}cc, ${selectedPreset.theme === "custom" ? customSecondary : selectedPreset.secondary}bb)`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px"
              }}
            >
              <div style={{ fontSize: "1.4rem", display: "flex", alignItems: "center" }}>
                {logoUrl.startsWith("data:image") ? (
                  <img src={logoUrl} alt="Logo" style={{ height: "24px", width: "24px", borderRadius: "4px", objectFit: "cover" }} />
                ) : (
                  <span>{logoUrl}</span>
                )}
              </div>
              <div>
                <div className="header-brand-title" style={{ fontSize: "0.95rem", fontWeight: "700" }}>{brandName}</div>
                <div className="header-status-indicator" style={{ fontSize: "0.7rem", opacity: 0.8 }}>✦ Arti Online</div>
              </div>
            </div>
            
            <div className="phone-app-body">
              <div className="bubble assistant" style={{ borderColor: selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary }}>
                <span className="label" style={{ color: selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary }}>Arti</span>
                Hello! Welcome to your custom dashboard. I am trained as your coach: "{coachPersona.slice(0, 50)}..." How can I help you today?
              </div>

              <div className="phone-app-plan-widget">
                <div className="widget-header" style={{ borderBottom: `2px solid ${selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary}` }}>
                  📅 Active Plan Overview
                </div>
                {selectedClient && (
                  <div className="widget-row">
                    <span>Diet: {selectedClient.diet}</span>
                    <span>Goal: {selectedClient.goal ? selectedClient.goal.split(" ")[0] : "None"}</span>
                  </div>
                )}
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
            <button 
              type="button" 
              className="pill active" 
              style={{ width: "100%", marginBottom: "12px", background: selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary }}
              onClick={() => setShowAddClientForm(!showAddClientForm)}
            >
              {showAddClientForm ? "✕ Cancel Invite" : "➕ Invite New Client"}
            </button>

            {showAddClientForm ? (
              <form onSubmit={handleAddClient} style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                <h5 style={{ margin: "0 0 8px 0" }}>Invite Form</h5>
                <div className="field" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Client Name</label>
                  <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required placeholder="Jane Doe" style={{ padding: "6px" }} />
                </div>
                <div className="field" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Client Email</label>
                  <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} required placeholder="client@test.com" style={{ padding: "6px" }} />
                </div>
                <div className="field" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Client Password</label>
                  <input type="text" value={newClientPassword} onChange={(e) => setNewClientPassword(e.target.value)} required placeholder="password" style={{ padding: "6px" }} />
                </div>
                <div className="field" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Target Goal</label>
                  <input type="text" value={newClientGoal} onChange={(e) => setNewClientGoal(e.target.value)} required placeholder="10K Running Base" style={{ padding: "6px" }} />
                </div>
                <div className="field" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Initial Weight</label>
                  <input type="text" value={newClientWeight} onChange={(e) => setNewClientWeight(e.target.value)} placeholder="70 kg" style={{ padding: "6px" }} />
                </div>
                <div className="field" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "0.75rem" }}>Diet</label>
                  <select value={newClientDiet} onChange={(e) => setNewClientDiet(e.target.value)} style={{ padding: "6px" }}>
                    <option value="Standard">Standard</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Keto">Keto</option>
                  </select>
                </div>
                <button type="submit" style={{ width: "100%", padding: "8px" }}>Create & Invite</button>
              </form>
            ) : null}

            {clients.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedClient(c)}
                className={`client-row-item ${selectedClient && selectedClient.id === c.id ? "active" : ""}`}
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
          {selectedClient ? (
            <div className="plan-builder-column">
              <h4 style={{ margin: "0 0 12px 0", color: selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary, fontWeight: 700 }}>
                AI Plan Builder for {selectedClient.name}
              </h4>

              {/* AI Prompt Generator */}
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px" }}>
                <h5 style={{ margin: "0 0 6px 0", color: "var(--fg)" }}>✨ Conversational AI Plan Generator</h5>
                <textarea
                  value={promptPlanInstruction}
                  onChange={(e) => setPromptPlanInstruction(e.target.value)}
                  rows={2}
                  placeholder="e.g. Write a glute-focused plan with 1800 calories, high protein, eggetarian diet..."
                  style={{ fontSize: "0.85rem", marginBottom: "8px" }}
                />
                <button 
                  type="button" 
                  onClick={handleAIGeneratePlan} 
                  disabled={isGeneratingPlan} 
                  style={{ width: "100%", padding: "6px", fontSize: "0.8rem", background: selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary, border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}
                >
                  {isGeneratingPlan ? "AI Generating Plan Parameters..." : "⚡ Generate Plan Parameters"}
                </button>
              </div>

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
                    background: `linear-gradient(135deg, ${selectedPreset.theme === "custom" ? customPrimary : selectedPreset.primary} 0%, ${selectedPreset.theme === "custom" ? customSecondary : selectedPreset.secondary} 100%)`,
                    flex: 1
                  }}
                >
                  {isSyncing ? "Exporting Plan..." : `⚡ Export to ${selectedClient.name}'s Profile`}
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
                💡 <em>Exporting updates the database plan configurations so your clients can view and track their customized metrics live in their coach chat app.</em>
              </div>
            </div>
          ) : (
            <div className="plan-builder-column" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <p className="muted">Please invite or select a client from the list to construct a plan.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
