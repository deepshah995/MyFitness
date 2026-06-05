import React, { useState } from "react";

/* ─────────────── MOCK SHEET DATA ─────────────── */
const sheetsMockData = {
  config: {
    headers: ["key", "value"],
    rows: [
      ["program_name", "Hypertrophy & Cardio Hybrid (Arms Focus)"],
      ["calorie_target", "2,150 kcal"],
      ["protein_target_g", "145g"],
      ["carbs_target_g", "180g"],
      ["fat_target_g", "65g"],
      ["weekly_run_goal_km", "22.0 km"],
      ["current_weight_kg", "75.5"],
      ["height_cm", "173"],
    ],
  },
  journal_entries: {
    headers: ["date", "sleep_hrs", "sleep_quality", "stress", "steps", "fasting_glucose", "notes"],
    rows: [
      ["2026-06-02", "7.8", "4/5", "2/5", "11,240", "94 mg/dL", "Felt energized, great sleep"],
      ["2026-06-01", "6.5", "3/5", "4/5", "8,400", "102 mg/dL", "Stress high due to work meeting"],
      ["2026-05-31", "8.0", "5/5", "1/5", "12,500", "89 mg/dL", "Deep restorative sleep"],
    ],
  },
  body_stats: {
    headers: ["date", "weight_kg", "waist_cm", "notes"],
    rows: [
      ["2026-06-02", "75.5", "82.4", "Weekly weigh-in · fasting"],
      ["2026-05-28", "75.9", "83.0", "Slight increase from weekend"],
      ["2026-05-21", "76.4", "83.6", "Start of arms focus phase"],
    ],
  },
  run_logs: {
    headers: ["date", "distance_km", "duration_min", "pace_sec_km", "rpe", "zone"],
    rows: [
      ["2026-06-01", "5.2 km", "29.5 min", "340 sec/km", "6/10", "Z2 Aerobic"],
      ["2026-05-29", "4.0 km", "22.0 min", "330 sec/km", "7/10", "Tempo"],
    ],
  },
  strength_sessions: {
    headers: ["date", "week", "session_type", "volume_score", "rpe"],
    rows: [
      ["2026-05-30", "Week 2", "Arms Hypertrophy (Mon)", "5,200", "8/10"],
      ["2026-05-28", "Week 2", "Lower Body & Core (Wed)", "3,800", "7/10"],
    ],
  },
};

/* ─────────────── GUIDE STEPS ─────────────── */
const guideSteps = [
  {
    num: "01", icon: "📋",
    title: "Create Google Spreadsheet",
    desc: "Go to sheets.google.com and create a new spreadsheet. Copy the Spreadsheet ID from the URL — it's the long alphanumeric string between '/d/' and '/edit'.",
    color: "#a5b4fc",
  },
  {
    num: "02", icon: "🔑",
    title: "Share with Service Account",
    desc: "Open Share settings in your spreadsheet and add the backend service account email as an Editor. Uncheck 'Notify people' to avoid sending an email.",
    color: "#34d399",
  },
  {
    num: "03", icon: "🚀",
    title: "Set Environment Variable",
    desc: "In your GCP Cloud Run service, set SPREADSHEET_ID to your copied ID and OPENAI_API_KEY to your sk-... key. Redeploy to activate full sync.",
    color: "#22d3ee",
  },
];

/* ─────────────── PROMPT LIBRARY ─────────────── */
const promptLibrary = [
  {
    category: "💪 Arm Training",
    color: "#a5b4fc",
    prompts: [
      { short: "Weekly arm hypertrophy plan", full: "Design a 4-day arm hypertrophy microcycle for me this week with 3-4 specialized biceps, triceps, and forearm movements. Include sets, reps, and tempo for each." },
      { short: "Optimize arm pump finisher", full: "Give me a 15-minute arm pump finisher circuit I can add to the end of my upper body Friday session. Focus on maximum mechanical tension and blood flow." },
    ],
  },
  {
    category: "🍳 Eggetarian Diet",
    color: "#34d399",
    prompts: [
      { short: "7-Day low-GI meal plan", full: "Create a 7-day low-GI eggetarian meal plan targeting 145g protein and 2,150 kcal. Limit carbs to under 180g. Save each day to the sheet with calorie targets." },
      { short: "Post-workout meal ideas", full: "Suggest 5 high-protein eggetarian post-workout meals I can prep in under 20 minutes. Each should have at least 35g protein and be blood glucose friendly." },
    ],
  },
  {
    category: "📈 Glucose & Health",
    color: "#fbbf24",
    prompts: [
      { short: "Correlate glucose + sleep logs", full: "Analyze my last 14 days of journal entries. Find correlations between my fasting glucose levels, sleep hours, stress scores, and step counts. What should I change?" },
      { short: "Prediabetes improvement plan", full: "Based on my HbA1c of 6.0 and weight of 75.5kg at 173cm, what are my top 3 actionable changes this week to improve insulin sensitivity without medication?" },
    ],
  },
  {
    category: "🏃 Running",
    color: "#22d3ee",
    prompts: [
      { short: "10K progress checkpoint", full: "Based on my recent run logs, assess my Zone 2 aerobic base progress toward running a 10K in 4 months. What should I focus on this week?" },
      { short: "Optimize Zone 2 runs", full: "I want to improve my Zone 2 running economy. Give me a weekly run structure with heart rate zones, duration, and progression guidance for my current 5.2km base." },
    ],
  },
];

/* ─────────────── SUPPLEMENT REFERENCE ─────────────── */
const supplements = [
  { name: "Vitamin D3", dose: "5000 IU", timing: "Morning with food", why: "Insulin sensitivity + testosterone + immunity", color: "#fbbf24" },
  { name: "Berberine HCl", dose: "500 mg × 3/day", timing: "With each main meal", why: "Activates AMPK pathway · clinically matches Metformin for glucose control · key prediabetes protocol", color: "#34d399" },
  { name: "Omega-3 EPA/DHA", dose: "2000 mg", timing: "Morning with food", why: "Anti-inflammation + cardiovascular health + brain", color: "#67e8f9" },
  { name: "Whey Protein Isolate", dose: "1.5 scoops (35g)", timing: "Post-workout (within 30 min)", why: "Anabolic window · muscle protein synthesis", color: "#f472b6" },
  { name: "Ashwagandha KSM-66", dose: "600 mg", timing: "Bedtime", why: "Cortisol suppression · prevents liver glucose dump · sleep quality", color: "#a78bfa" },
];

/* ─────────────── COMPONENT ─────────────── */
export default function HelpGuide({ onSelectPrompt }) {
  const [activeSheetTab, setActiveSheetTab] = useState("config");
  const [activePromptCat, setActivePromptCat] = useState(0);
  const [expandedPrompt, setExpandedPrompt] = useState(null);

  const selectedSheet = sheetsMockData[activeSheetTab];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ─── HERO HEADER ─── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: "20px", padding: "28px 28px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "999px", padding: "5px 12px", fontSize: "0.72rem",
            fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            ⚙ Setup & Integration Guide
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Connect, Configure & Coach
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem", maxWidth: "540px", lineHeight: "1.6" }}>
            Sync Google Sheets as your live fitness database, configure your AI coach with personalized prompts, and reference your full supplement protocol below.
          </p>
        </div>
      </div>

      {/* ─── SETUP STEPS ─── */}
      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: "0.92rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Quick Setup
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {guideSteps.map((step) => (
            <div key={step.num} style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${step.color}25`,
              borderTop: `3px solid ${step.color}`,
              borderRadius: "16px", padding: "20px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "-10px", right: "-10px",
                fontSize: "4rem", opacity: 0.04, fontWeight: 900,
                pointerEvents: "none", userSelect: "none",
              }}>{step.num}</div>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: `${step.color}15`, border: `1px solid ${step.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", marginBottom: "12px",
              }}>
                {step.icon}
              </div>
              <h4 style={{ margin: "0 0 6px", fontSize: "0.92rem", fontWeight: 700, color: step.color }}>{step.title}</h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: "1.5" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>


      {/* ─── SHEET SCHEMA VISUALIZER ─── */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)", flexWrap: "wrap", gap: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
            }}>📊</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Google Sheet Schema</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Live database structure · click tabs to explore</div>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: "999px", fontSize: "0.65rem",
            fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
            border: "1px solid rgba(99,102,241,0.2)", textTransform: "uppercase", letterSpacing: "0.04em",
          }}>Live Schema</span>
        </div>

        {/* Sheet tabs */}
        <div style={{
          display: "flex", gap: "2px", padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.15)", overflowX: "auto",
        }}>
          {Object.keys(sheetsMockData).map(tab => (
            <button
              key={tab} type="button"
              onClick={() => setActiveSheetTab(tab)}
              style={{
                padding: "6px 12px", fontSize: "0.75rem", whiteSpace: "nowrap",
                background: activeSheetTab === tab ? "rgba(99,102,241,0.2)" : "transparent",
                border: activeSheetTab === tab ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
                borderRadius: "8px", color: activeSheetTab === tab ? "#a5b4fc" : "var(--muted)",
                fontWeight: activeSheetTab === tab ? 700 : 500,
                boxShadow: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              📁 {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", padding: "0 2px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                {selectedSheet.headers.map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", fontSize: "0.72rem",
                    fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase",
                    letterSpacing: "0.06em", whiteSpace: "nowrap",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedSheet.rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{
                      padding: "10px 14px", color: cIdx === 0 ? "#94a3b8" : "var(--text)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      fontFamily: cIdx === 0 ? "monospace" : "inherit",
                      fontSize: cIdx === 0 ? "0.78rem" : "0.82rem",
                      whiteSpace: "nowrap",
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PROMPT LIBRARY ─── */}
      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: "0.92rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ⚡ AI Coach Prompt Library
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--muted)", lineHeight: "1.5" }}>
          Click any prompt to instantly load it into the Coach tab. Personalized for your profile: 75.5 kg · 173 cm · prediabetic · eggetarian.
        </p>

        {/* Category pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {promptLibrary.map((cat, idx) => (
            <button key={idx} type="button"
              onClick={() => setActivePromptCat(idx)}
              style={{
                padding: "7px 14px", fontSize: "0.78rem", borderRadius: "999px",
                background: activePromptCat === idx ? `${cat.color}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activePromptCat === idx ? cat.color + "50" : "rgba(255,255,255,0.08)"}`,
                color: activePromptCat === idx ? cat.color : "var(--muted)",
                fontWeight: activePromptCat === idx ? 700 : 500,
                boxShadow: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Prompts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
          {promptLibrary[activePromptCat].prompts.map((p, idx) => {
            const cat = promptLibrary[activePromptCat];
            const key = `${activePromptCat}-${idx}`;
            const isExpanded = expandedPrompt === key;
            return (
              <div key={idx} style={{
                background: `${cat.color}08`, border: `1px solid ${cat.color}25`,
                borderLeft: `3px solid ${cat.color}`,
                borderRadius: "14px", padding: "16px",
                cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "60"; e.currentTarget.style.background = `${cat.color}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cat.color + "25"; e.currentTarget.style.background = `${cat.color}08`; }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "8px" }}>
                  {p.short}
                </div>

                {/* Preview / expand */}
                <div
                  onClick={() => setExpandedPrompt(isExpanded ? null : key)}
                  style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: "1.5", marginBottom: "12px", cursor: "pointer" }}
                >
                  {isExpanded ? `"${p.full}"` : `"${p.full.slice(0, 90)}..." `}
                  <span style={{ color: cat.color, fontWeight: 600 }}>{isExpanded ? " Show less" : "Show more"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPrompt(p.full)}
                  style={{
                    padding: "8px 16px", fontSize: "0.78rem", borderRadius: "8px",
                    background: `${cat.color}20`, border: `1px solid ${cat.color}40`,
                    color: cat.color, fontWeight: 700, boxShadow: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}35`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${cat.color}20`; }}
                >
                  ↗ Use in Coach →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SUPPLEMENT REFERENCE ─── */}
      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: "0.92rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          💊 Daily Supplement Reference
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          {supplements.map(s => (
            <div key={s.name} style={{
              background: `${s.color}08`, border: `1px solid ${s.color}25`,
              borderTop: `3px solid ${s.color}`,
              borderRadius: "14px", padding: "16px",
            }}>
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: s.color, marginBottom: "4px" }}>{s.name}</div>
              <div style={{
                display: "inline-block", padding: "2px 8px", borderRadius: "999px",
                background: `${s.color}15`, color: s.color, fontSize: "0.72rem",
                fontWeight: 700, marginBottom: "8px",
              }}>{s.dose}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "6px" }}>
                🕐 <strong style={{ color: "var(--text)" }}>{s.timing}</strong>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: "1.4" }}>↳ {s.why}</div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
