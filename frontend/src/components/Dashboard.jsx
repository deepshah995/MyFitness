import React, { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
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

  if (loading) return <div>Loading dashboard…</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div style={{ maxWidth: 860 }}>
      <h2>Dashboard</h2>
      <Section title="Config">
        <div style={{ fontFamily: "monospace", fontSize: 13 }}>
          {Object.entries(data.config || {}).map(([k, v]) => (
            <div key={k}>
              {k}: {v}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recent (last ~14 days)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <div>
            <b>Journal entries</b>: {data.recent?.journal_entries?.length || 0}
          </div>
          <div>
            <b>Body stats</b>: {data.recent?.body_stats?.length || 0}
          </div>
          <div>
            <b>Run logs</b>: {data.recent?.run_logs?.length || 0}
          </div>
          <div>
            <b>Strength sessions</b>: {data.recent?.strength_sessions?.length || 0}
          </div>
        </div>
      </Section>

      <Section title="Latest journal entries">
        {(data.recent?.journal_entries || []).slice(-5).reverse().map((r, idx) => (
          <div key={idx} style={{ marginBottom: 10, padding: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <b>{r.date}</b>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Sleep: {r.sleep_hours ?? ""}h, Stress: {r.stress_1_5 ?? ""}/5, Hunger: {r.hunger_1_5 ?? ""}/5
            </div>
            <div style={{ fontSize: 13 }}>Fasting glucose: {r.fasting_glucose_mg_dl ?? ""}</div>
            <div style={{ fontSize: 13 }}>Post-meal glucose: {r.post_meal_glucose_mg_dl ?? ""}</div>
            {r.notes ? <div style={{ fontSize: 13, marginTop: 4 }}>Notes: {r.notes}</div> : null}
          </div>
        ))}
      </Section>
    </div>
  );
}

