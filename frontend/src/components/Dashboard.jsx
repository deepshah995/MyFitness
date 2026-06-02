import React from "react";

export default function Dashboard({ dashboardData, loading, error, refetch, onNavigateToHelp }) {
  if (loading) {
    return (
      <div>
        <h2 className="panel-title">Loading Metrics</h2>
        <p className="panel-subtitle">Synthesizing recent logs and training parameters...</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "24px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: "100px", padding: "16px" }}>
              <div className="skeleton-bar" style={{ width: "40%", marginBottom: "12px" }} />
              <div className="skeleton-bar" style={{ width: "80%", height: "24px" }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: "20px", height: "140px", padding: "20px" }}>
          <div className="skeleton-bar" style={{ width: "30%", marginBottom: "16px" }} />
          <div className="skeleton-bar" style={{ width: "90%", marginBottom: "10px" }} />
          <div className="skeleton-bar" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  // Handle configuration errors or sheets disconnected states
  if (error || !dashboardData) {
    return (
      <div style={{ textAlign: "center", padding: "20px 10px" }}>
        <h2 className="panel-title">Dashboard</h2>
        <p className="panel-subtitle">Real-time consistency tracking & biological indicators.</p>

        <div className="alert warning" style={{ marginTop: "24px", textAlign: "left" }}>
          <span>⚠️ <b>Sheets offline:</b> {error || "No dashboard data found."}</span>
        </div>

        <div className="card card-accent-journal" style={{ maxWidth: "600px", margin: "20px auto 0", padding: "24px", textAlign: "left" }}>
          <h3 style={{ fontSize: "1.25rem", color: "var(--accent-help)", marginBottom: "8px" }}>
            🚀 Quick 2-Minute Sheets Integration
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
            Connecting your Google Sheet turns it into a high-speed secure database. The AI Coach will save workout plans, dietary recipes, and track your glucose signals automatically.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" className="primary" onClick={onNavigateToHelp}>
              ⚡ Setup Spreadsheet
            </button>
            <button type="button" className="secondary" onClick={refetch}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const journal = dashboardData.recent?.journal_entries || [];
  const bodyStats = dashboardData.recent?.body_stats || [];
  const runs = dashboardData.recent?.run_logs || [];
  const strength = dashboardData.recent?.strength_sessions || [];
  const config = dashboardData.config || {};

  // Consistency goals for last 14 days
  const journalGoal = 7;
  const bodyGoal = 2;
  const runGoal = 3;
  const strengthGoal = 4;

  const journalPct = Math.min(100, Math.round((journal.length / journalGoal) * 100));
  const bodyPct = Math.min(100, Math.round((bodyStats.length / bodyGoal) * 100));
  const runPct = Math.min(100, Math.round((runs.length / runGoal) * 100));
  const strengthPct = Math.min(100, Math.round((strength.length / strengthGoal) * 100));

  // Glucose warning checks
  const latestJournal = journal.length > 0 ? journal[journal.length - 1] : null;
  const fastingGlucose = latestJournal ? Number(latestJournal.fasting_glucose_mg_dl) : null;
  const postMealGlucose = latestJournal ? Number(latestJournal.post_meal_glucose_mg_dl) : null;

  const isFastingHigh = fastingGlucose && fastingGlucose >= 100;
  const isPostMealHigh = postMealGlucose && postMealGlucose >= 140;

  return (
    <div>
      <div className="panel-title-row">
        <div>
          <h2 className="panel-title">Performance Dashboard</h2>
          <p className="panel-subtitle">Your bio-signals, training metrics, and sheets status at a glance.</p>
        </div>
        <button type="button" className="secondary" style={{ padding: "8px 14px", fontSize: "0.82rem" }} onClick={refetch}>
          🔄 Refresh Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-container">
        <div className="kpi-card journal">
          <span className="kpi-label">Daily Journals</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{journal.length}</span>
            <span className="kpi-decor">📝</span>
          </div>
        </div>

        <div className="kpi-card body">
          <span className="kpi-label">Waist/Weight Logs</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{bodyStats.length}</span>
            <span className="kpi-decor">📏</span>
          </div>
        </div>

        <div className="kpi-card runs">
          <span className="kpi-label">Cardio Runs</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{runs.length}</span>
            <span className="kpi-decor">🏃</span>
          </div>
        </div>

        <div className="kpi-card strength">
          <span className="kpi-label">Lift Sessions</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{strength.length}</span>
            <span className="kpi-decor">💪</span>
          </div>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: "start", marginTop: "24px" }}>
        {/* Consistency Goals / Progress */}
        <div className="card">
          <h3 style={{ borderBottom: "1px dashed var(--border)", paddingBottom: "10px", marginBottom: "16px" }}>
            🎯 14-Day Consistency Goals
          </h3>
          
          <div className="visual-progress-bar-wrapper">
            <div className="progress-header">
              <span>Journal Tracking</span>
              <span>{journal.length} / {journalGoal} days ({journalPct}%)</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill journal" style={{ width: `${journalPct}%` }} />
            </div>
          </div>

          <div className="visual-progress-bar-wrapper">
            <div className="progress-header">
              <span>Body Metrics Weight-in</span>
              <span>{bodyStats.length} / {bodyGoal} logs ({bodyPct}%)</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill body" style={{ width: `${bodyPct}%` }} />
            </div>
          </div>

          <div className="visual-progress-bar-wrapper">
            <div className="progress-header">
              <span>Aerobic Zone 2 Runs</span>
              <span>{runs.length} / {runGoal} sessions ({runPct}%)</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill runs" style={{ width: `${runPct}%` }} />
            </div>
          </div>

          <div className="visual-progress-bar-wrapper">
            <div className="progress-header">
              <span>Strength Volume Blocks</span>
              <span>{strength.length} / {strengthGoal} sessions ({strengthPct}%)</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill strength" style={{ width: `${strengthPct}%` }} />
            </div>
          </div>
        </div>

        {/* Glucose Warnings & Signals */}
        <div className="card">
          <h3 style={{ borderBottom: "1px dashed var(--border)", paddingBottom: "10px", marginBottom: "16px" }}>
            🩸 Recent Bio-Signals & Targets
          </h3>
          
          {latestJournal ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span>Latest Logged Date</span>
                <span style={{ fontWeight: "700" }}>{latestJournal.date}</span>
              </div>
              
              {/* Fasting Glucose indicator */}
              <div className="card" style={{
                background: "var(--bg-input)",
                borderLeft: `4px solid ${isFastingHigh ? "var(--error)" : "var(--success)"}`,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Fasting Glucose
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>
                    {fastingGlucose ? `${fastingGlucose} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <span className="badge" style={{ color: isFastingHigh ? "var(--error)" : "var(--success)", background: isFastingHigh ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.06)" }}>
                  {isFastingHigh ? "⚠️ Target exceeded" : "✓ Optimal (<100)"}
                </span>
              </div>

              {/* Post-Meal Glucose indicator */}
              <div className="card" style={{
                background: "var(--bg-input)",
                borderLeft: `4px solid ${isPostMealHigh ? "var(--error)" : "var(--success)"}`,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Post-Meal Glucose
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>
                    {postMealGlucose ? `${postMealGlucose} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <span className="badge" style={{ color: isPostMealHigh ? "var(--error)" : "var(--success)", background: isPostMealHigh ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.06)" }}>
                  {isPostMealHigh ? "⚠️ Target exceeded" : "✓ Optimal (<140)"}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5" }}>
              No metabolic logs found for the last 14 days. Head to the <b>Log</b> section to record fasting/post-meal glucose data to activate bio-signal warning indicators.
            </p>
          )}
        </div>
      </div>

      {/* Profiles / Config Section */}
      {Object.keys(config).length > 0 ? (
        <div className="card" style={{ marginTop: "24px" }}>
          <h3 style={{ borderBottom: "1px dashed var(--border)", paddingBottom: "10px", marginBottom: "16px" }}>
            👤 Live Coaching Configuration
          </h3>
          <div className="config-grid">
            {Object.entries(config).map(([k, v]) => (
              <div key={k} className="config-item">
                <span className="config-key">{k.replace(/_/g, " ")}</span>
                <span className="config-value">{v || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
