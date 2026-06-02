import React, { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

function Section({ title, children, className = "" }) {
  return (
    <div className={`card section-card ${className}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch("/api/dashboard/overview");
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="title">Dashboard</h2>
        <p className="muted">Loading your latest metrics…</p>
        <div className="skeleton-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  if (error) return <div className="alert error">Error: {error}</div>;
  if (!data) return <div className="muted">No data yet. Log your first entry to see insights here.</div>;

  const journal = data.recent?.journal_entries || [];
  const configEntries = Object.entries(data.config || {});

  return (
    <div>
      <h2 className="title">Dashboard</h2>
      <p className="muted">Your consistency, body composition, and glucose-relevant signals at a glance.</p>

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="kpi stat-journal">
          <div className="stat-label">Journal</div>
          <div className="stat-value">{journal.length}</div>
        </div>
        <div className="kpi stat-body">
          <div className="stat-label">Body stats</div>
          <div className="stat-value">{data.recent?.body_stats?.length || 0}</div>
        </div>
        <div className="kpi stat-run">
          <div className="stat-label">Runs</div>
          <div className="stat-value">{data.recent?.run_logs?.length || 0}</div>
        </div>
        <div className="kpi stat-strength">
          <div className="stat-label">Strength</div>
          <div className="stat-value">{data.recent?.strength_sessions?.length || 0}</div>
        </div>
      </div>

      {configEntries.length > 0 ? (
        <Section title="Profile config">
          <div className="config-grid">
            {configEntries.map(([k, v]) => (
              <div key={k} className="config-row">
                <span>{k}</span>
                <span>{v || "—"}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Latest journal entries">
        {journal.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No journal entries in the last ~14 days. Head to Log to add sleep, stress, and glucose data.
          </p>
        ) : (
          journal
            .slice(-5)
            .reverse()
            .map((r, idx) => (
              <div key={idx} className="kpi journal-entry" style={{ marginBottom: 10 }}>
                <b>{r.date}</b>
                <div className="meta">
                  Sleep {r.sleep_hours ?? "—"}h · Stress {r.stress_1_5 ?? "—"}/5 · Hunger {r.hunger_1_5 ?? "—"}/5
                  <br />
                  Fasting glucose {r.fasting_glucose_mg_dl ?? "—"} mg/dL · Post-meal {r.post_meal_glucose_mg_dl ?? "—"} mg/dL
                  {r.notes ? (
                    <>
                      <br />
                      Notes: {r.notes}
                    </>
                  ) : null}
                </div>
              </div>
            ))
        )}
      </Section>
    </div>
  );
}
