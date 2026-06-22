import React, { useState, useEffect } from "react";
import { apiFetch } from "../api.js";

export default function AgencyDashboard() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Client matching state
  const [clientDesc, setClientDesc] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Achievements marketing post state
  const [generatingPost, setGeneratingPost] = useState(false);
  const [postDraft, setPostDraft] = useState("");

  useEffect(() => {
    fetchCoachesPerformance();
  }, []);

  async function fetchCoachesPerformance() {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/db/agency/coaches-performance");
      setCoaches(data);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFindMatch(e) {
    e.preventDefault();
    if (!clientDesc.trim()) {
      alert("Please describe the client's needs (e.g. goals, preferences, history).");
      return;
    }
    setMatching(true);
    setMatchResult(null);
    try {
      const data = await apiFetch("/api/db/agency/match-client", {
        method: "POST",
        body: { client_description: clientDesc }
      });
      setMatchResult(data);
    } catch (err) {
      alert("Matching failed: " + err.message);
    } finally {
      setMatching(false);
    }
  }

  async function handleGeneratePost() {
    setGeneratingPost(true);
    setPostDraft("");
    try {
      const data = await apiFetch("/api/db/agency/achievements-draft");
      setPostDraft(data.draft);
    } catch (err) {
      alert("Draft generation failed: " + err.message);
    } finally {
      setGeneratingPost(false);
    }
  }

  return (
    <div className="agency-dashboard-container">
      {/* Hero Header */}
      <div className="studio-hero-card" style={{ marginBottom: "24px" }}>
        <div className="studio-hero-badge" style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>🏢 AGENCY COMMAND</div>
        <h2>Enterprise Operations</h2>
        <p className="muted">
          Oversee trainers across branches, audit client compliance logs, matching algorithms, and auto-generate agency marketing updates.
        </p>
      </div>

      {loading ? (
        <div className="typing" style={{ margin: "40px auto" }}><span /><span /><span /></div>
      ) : error ? (
        <div className="alert error">{error}</div>
      ) : (
        <div className="grid cols-1" style={{ gap: "24px" }}>
          
          {/* Coach Performance Table */}
          <div className="card creator-card">
            <h3 className="creator-card-title">📊 Trainer Performance & Metrics</h3>
            <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "16px" }}>
              Live aggregate statistics of client adherence and active blueprints managed by each trainer.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: 0.8 }}>
                    <th style={{ padding: "10px 8px" }}>Trainer Name</th>
                    <th style={{ padding: "10px 8px" }}>Brand Sub-Branch</th>
                    <th style={{ padding: "10px 8px", textAlign: "center" }}>Roster Size</th>
                    <th style={{ padding: "10px 8px", textAlign: "center" }}>Active Plans</th>
                    <th style={{ padding: "10px 8px", textAlign: "center" }}>Avg Adherence</th>
                  </tr>
                </thead>
                <tbody>
                  {coaches.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px 8px", fontWeight: "700" }}>{c.name}</td>
                      <td style={{ padding: "12px 8px", color: "var(--muted)" }}>{c.brand_name}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{c.total_clients}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{c.active_plans}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{ 
                          color: c.adherence_rate >= 90 ? "#10b981" : c.adherence_rate >= 80 ? "#f59e0b" : "#f43f5e",
                          fontWeight: "bold"
                        }}>
                          {c.adherence_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Core Features Row */}
          <div className="grid cols-2" style={{ gap: "20px", alignItems: "start" }}>
            
            {/* Matching Tool */}
            <div className="card creator-card">
              <h3 className="creator-card-title">🤝 Intelligent Client-Coach Matching</h3>
              <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                Input client goals, personality traits, or medical conditions, and let the AI scan coach prompts to match.
              </p>
              <form onSubmit={handleFindMatch}>
                <div className="field">
                  <label>Client Demographics & Desires</label>
                  <textarea
                    value={clientDesc}
                    onChange={(e) => setClientDesc(e.target.value)}
                    rows={3}
                    placeholder="e.g. High-stress executive looking for insulin sensitivity advice. Prefers a coach who is empathetic and scientific."
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <button type="submit" disabled={matching} style={{ width: "100%", marginTop: "8px" }}>
                  {matching ? "Analyzing Coach Personas..." : "⚡ Run Match Query"}
                </button>
              </form>

              {matchResult && (
                <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <div style={{ fontWeight: "700", color: "#10b981", fontSize: "0.95rem" }}>
                    ⭐ Best Match: {matchResult.matched_coach_name} (ID: {matchResult.matched_coach_id})
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", lineHeight: "1.4", color: "var(--fg)" }}>
                    {matchResult.reasoning}
                  </p>
                </div>
              )}
            </div>

            {/* Social Media Generator */}
            <div className="card creator-card">
              <h3 className="creator-card-title">📢 AI Lead Generation & Proof Writer</h3>
              <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                Generate social media marketing drafts from the latest compliance updates and exercise logs.
              </p>
              <button 
                type="button" 
                onClick={handleGeneratePost} 
                disabled={generatingPost} 
                style={{ width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {generatingPost ? "Analyzing Logs & Drafting..." : "✨ Draft Transformation Post"}
              </button>

              {postDraft && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px" }}>Copy Draft:</span>
                    <button 
                      type="button"
                      className="secondary"
                      style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                      onClick={() => {
                        navigator.clipboard.writeText(postDraft);
                        alert("Marketing draft copied!");
                      }}
                    >
                      📋 Copy text
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={postDraft}
                    rows={8}
                    style={{ 
                      fontSize: "0.8rem", 
                      fontFamily: "monospace", 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.06)",
                      lineHeight: "1.4"
                    }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
