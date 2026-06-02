import React, { useState } from "react";

const sheetsMockData = {
  config: {
    headers: ["key", "value"],
    rows: [
      ["program_name", "Hypertrophy & Cardio Hybrid (Arms Focus)"],
      ["calorie_target", "2400 kcal"],
      ["protein_target_g", "165g"],
      ["carbs_target_g", "250g"],
      ["fat_target_g", "80g"],
      ["weekly_run_goal_km", "15.0"]
    ]
  },
  journal_entries: {
    headers: ["date", "sleep_hours", "sleep_quality_1_5", "stress_1_5", "steps", "fasting_glucose_mg_dl", "notes"],
    rows: [
      ["2026-06-01", "7.8", "4", "2", "11240", "94", "Felt energized, great sleep"],
      ["2026-05-31", "6.5", "3", "4", "8400", "102", "Stress high due to work meeting"],
      ["2026-05-30", "8.0", "5", "1", "12500", "89", "Deep restorative sleep, fasting glucose lower"]
    ]
  },
  body_stats: {
    headers: ["date", "weight_kg", "waist_cm", "notes"],
    rows: [
      ["2026-05-28", "78.4", "84.2", "Fasting weight"],
      ["2026-05-21", "79.1", "84.9", "Start of arms focus phase"]
    ]
  },
  run_logs: {
    headers: ["date", "distance_km", "duration_min", "avg_pace_sec_km", "rpe_1_10", "zone"],
    rows: [
      ["2026-05-30", "5.2", "29.5", "340", "6", "Z2 Aerobic"],
      ["2026-05-27", "4.0", "22.0", "330", "7", "Tempo pace"]
    ]
  },
  strength_sessions: {
    headers: ["date", "program_week", "session_type", "total_volume_score", "rpe_1_10"],
    rows: [
      ["2026-05-29", "2", "Upper Body (Arms Focus)", "4800", "8"],
      ["2026-05-26", "2", "Lower Body & Core", "3600", "7"]
    ]
  }
};

const guideSteps = [
  {
    num: "1",
    title: "Create your Spreadsheet",
    desc: "Create a new Google Spreadsheet and copy its ID from the URL (the long string of letters and numbers between '/d/' and '/edit')."
  },
  {
    num: "2",
    title: "Share with the Service Account",
    desc: "Share your spreadsheet with the backend service account email as an Editor to authorize sync. Details below."
  },
  {
    num: "3",
    title: "Deploy Environment Variable",
    desc: "Paste the Spreadsheet ID into your GCP Cloud Run env variables as SPREADSHEET_ID. That's it!"
  }
];

const promptSuggestions = [
  {
    category: "💪 Training adjustments",
    prompt: "Adjust my weekly training for arm hypertrophy. Give me 3-4 specialized arm movements and specify sets and reps.",
    short: "Specialized arm hypertrophy routine"
  },
  {
    category: "🍳 Custom Meal Plans",
    prompt: "Create a 7-day low-GI eggetarian meal plan with 160g protein, save it to the sheet, and list calorie targets per day.",
    short: "7-Day low-GI eggetarian meal plan"
  },
  {
    category: "📈 Journal Queries",
    prompt: "Look at my fasting glucose, stress and sleep logs for the last 14 days and tell me if there is a correlation.",
    short: "Correlate glucose, stress & sleep logs"
  }
];

export default function HelpGuide({ onSelectPrompt }) {
  const [activeSheetTab, setActiveSheetTab] = useState("config");
  const [copied, setCopied] = useState(false);
  
  const serviceAccountEmail = "250801762919-compute@developer.gserviceaccount.com";

  function handleCopy() {
    navigator.clipboard.writeText(serviceAccountEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedSheet = sheetsMockData[activeSheetTab];

  return (
    <div className="help-wizard">
      <div>
        <h2 className="panel-title">Help & Integration Guide</h2>
        <p className="panel-subtitle">Learn how to connect Google Sheets as your dynamic database and get the most out of your AI Fitness Coach.</p>
      </div>

      <div className="help-grid">
        {/* Left Side: Steps and Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Setup Wizard Steps */}
          <div className="grid cols-3">
            {guideSteps.map((step) => (
              <div key={step.num} className="card" style={{ padding: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--accent-help)",
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                  marginBottom: "10px"
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>{step.title}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Service Account Card */}
          <div className="card card-accent-journal" style={{ background: "rgba(16, 185, 129, 0.04)" }}>
            <h3 style={{ color: "var(--accent-help)" }}>🔑 Backend Service Account Credentials</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              To enable automatic syncing, open your Google Sheet's <b>Share</b> panel and add this service account email as an <b>Editor</b> (make sure "Notify people" is unchecked to avoid sending an email):
            </p>
            <div className="interactive-code-box">
              <code>{serviceAccountEmail}</code>
              <button type="button" className="copy-btn" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "📋 Copy Email"}
              </button>
            </div>
          </div>

          {/* Interactive Google Sheet Database Visualizer Map */}
          <div className="sheet-map-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h4 style={{ fontFamily: "var(--font)", fontWeight: "700", fontSize: "0.85rem" }}>
                📊 Google Sheet Schema Map
              </h4>
              <span className="badge brand" style={{ fontSize: "0.62rem" }}>Live Database Schema</span>
            </div>
            
            <div className="sheet-map-header">
              {Object.keys(sheetsMockData).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`sheet-tab-mock ${activeSheetTab === tab ? "active" : ""}`}
                  style={{ cursor: "pointer", boxShadow: "none" }}
                  onClick={() => setActiveSheetTab(tab)}
                >
                  📁 {tab}
                </button>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="sheet-table-mock">
                <thead>
                  <tr>
                    {selectedSheet.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSheet.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Prompts & AI Tricks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card card-accent-strength" style={{ height: "100%" }}>
            <h3 style={{ color: "var(--stat-strength)" }}>⚡ Quick AI Coach Prompts</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Click any chip below to copy the prompt template directly into the AI Coach chat and switch tabs automatically.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {promptSuggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className="card" 
                  onClick={() => onSelectPrompt(s.prompt)}
                  style={{
                    padding: "12px 14px",
                    background: "var(--bg-input)",
                    cursor: "pointer",
                    borderLeft: "3px solid var(--primary)",
                    transition: "transform 0.2s"
                  }}
                >
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", marginBottom: "4px" }}>
                    {s.category}
                  </span>
                  <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px", color: "var(--text)" }}>
                    {s.short}
                  </span>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineClamp: "2", WebkitLineClamp: "2", display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    "{s.prompt}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
