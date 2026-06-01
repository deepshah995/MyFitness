import React, { useMemo, useState } from "react";
import { apiFetch } from "../api.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

export default function LogForms() {
  const [journal, setJournal] = useState({
    date: todayISO(),
    sleep_hours: "",
    sleep_quality_1_5: "",
    stress_1_5: "",
    hunger_1_5: "",
    steps: "",
    fasting_glucose_mg_dl: "",
    post_meal_glucose_mg_dl: "",
    hbA1c_percent: "",
    notes: "",
  });

  const [body, setBody] = useState({
    date: todayISO(),
    weight_kg: "",
    waist_cm: "",
    notes: "",
  });

  const [run, setRun] = useState({
    date: todayISO(),
    distance_km: "",
    duration_min: "",
    avg_pace_sec_km: "",
    rpe_1_10: "",
    zone: "",
    notes: "",
  });

  const [strengthSession, setStrengthSession] = useState({
    date: todayISO(),
    program_week: "",
    session_type: "",
    total_volume_score: "",
    rpe_1_10: "",
    notes: "",
  });
  const [strengthExercise, setStrengthExercise] = useState({
    strength_session_entry_id: "",
    exercise_name: "",
    sets: 3,
    reps: 8,
    weight_kg: "",
    rpe_1_10: "",
    notes: "",
  });

  const [status, setStatus] = useState("");

  const parsedJournal = useMemo(() => {
    const out = { ...journal };
    for (const key of [
      "sleep_hours",
      "sleep_quality_1_5",
      "stress_1_5",
      "hunger_1_5",
      "steps",
      "fasting_glucose_mg_dl",
      "post_meal_glucose_mg_dl",
      "hbA1c_percent",
    ]) {
      if (out[key] === "") out[key] = null;
      else out[key] = Number(out[key]);
    }
    return out;
  }, [journal]);

  async function submitJournal(e) {
    e.preventDefault();
    setStatus("");
    await apiFetch("/api/journal/entry", { method: "POST", body: parsedJournal });
    setStatus("Journal saved.");
  }

  async function submitBody(e) {
    e.preventDefault();
    setStatus("");
    const payload = {
      ...body,
      weight_kg: Number(body.weight_kg),
      waist_cm: Number(body.waist_cm),
    };
    await apiFetch("/api/journal/body", { method: "POST", body: payload });
    setStatus("Body stat saved.");
  }

  async function submitRun(e) {
    e.preventDefault();
    setStatus("");
    const payload = {
      ...run,
      distance_km: Number(run.distance_km),
      duration_min: Number(run.duration_min),
      avg_pace_sec_km: run.avg_pace_sec_km === "" ? null : Number(run.avg_pace_sec_km),
      rpe_1_10: run.rpe_1_10 === "" ? null : Number(run.rpe_1_10),
      zone: run.zone || null,
      notes: run.notes || null,
    };
    await apiFetch("/api/logs/run", { method: "POST", body: payload });
    setStatus("Run log saved.");
  }

  async function submitStrengthSession(e) {
    e.preventDefault();
    setStatus("");
    const payload = {
      ...strengthSession,
      program_week: strengthSession.program_week === "" ? null : Number(strengthSession.program_week),
      total_volume_score:
        strengthSession.total_volume_score === "" ? null : Number(strengthSession.total_volume_score),
      rpe_1_10: strengthSession.rpe_1_10 === "" ? null : Number(strengthSession.rpe_1_10),
      session_type: strengthSession.session_type.trim(),
      notes: strengthSession.notes || null,
    };
    const res = await apiFetch("/api/logs/strength-session", { method: "POST", body: payload });
    setStrengthExercise((s) => ({ ...s, strength_session_entry_id: res.entry_id }));
    setStatus(`Strength session saved (entry_id: ${res.entry_id}). Now add exercises.`);
  }

  async function submitStrengthExercise(e) {
    e.preventDefault();
    setStatus("");
    const payload = {
      ...strengthExercise,
      sets: Number(strengthExercise.sets),
      reps: Number(strengthExercise.reps),
      weight_kg: strengthExercise.weight_kg === "" ? null : Number(strengthExercise.weight_kg),
      rpe_1_10: strengthExercise.rpe_1_10 === "" ? null : Number(strengthExercise.rpe_1_10),
      notes: strengthExercise.notes || null,
      strength_session_entry_id: strengthExercise.strength_session_entry_id,
      exercise_name: strengthExercise.exercise_name.trim(),
    };
    await apiFetch("/api/logs/strength-exercise", { method: "POST", body: payload });
    setStatus("Strength exercise saved.");
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <h2>Log</h2>
      {status ? <div style={{ marginBottom: 12, color: "#0f766e" }}>{status}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
        <form onSubmit={submitJournal}>
          <h3 style={{ marginTop: 0 }}>Journal</h3>
          <Field label="Date">
            <input type="date" value={journal.date} onChange={(e) => setJournal({ ...journal, date: e.target.value })} />
          </Field>
          <Field label="Sleep hours (e.g., 7.5)">
            <input value={journal.sleep_hours} onChange={(e) => setJournal({ ...journal, sleep_hours: e.target.value })} />
          </Field>
          <Field label="Sleep quality (1-5)">
            <input value={journal.sleep_quality_1_5} onChange={(e) => setJournal({ ...journal, sleep_quality_1_5: e.target.value })} />
          </Field>
          <Field label="Stress (1-5)">
            <input value={journal.stress_1_5} onChange={(e) => setJournal({ ...journal, stress_1_5: e.target.value })} />
          </Field>
          <Field label="Hunger/cravings (1-5)">
            <input value={journal.hunger_1_5} onChange={(e) => setJournal({ ...journal, hunger_1_5: e.target.value })} />
          </Field>
          <Field label="Steps">
            <input value={journal.steps} onChange={(e) => setJournal({ ...journal, steps: e.target.value })} />
          </Field>
          <Field label="Fasting glucose (mg/dL)">
            <input value={journal.fasting_glucose_mg_dl} onChange={(e) => setJournal({ ...journal, fasting_glucose_mg_dl: e.target.value })} />
          </Field>
          <Field label="Post-meal glucose (mg/dL)">
            <input value={journal.post_meal_glucose_mg_dl} onChange={(e) => setJournal({ ...journal, post_meal_glucose_mg_dl: e.target.value })} />
          </Field>
          <Field label="HbA1c (%)">
            <input value={journal.hbA1c_percent} onChange={(e) => setJournal({ ...journal, hbA1c_percent: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea value={journal.notes} onChange={(e) => setJournal({ ...journal, notes: e.target.value })} rows={3} style={{ width: "100%" }} />
          </Field>
          <button type="submit">Save Journal</button>
        </form>

        <form onSubmit={submitBody}>
          <h3 style={{ marginTop: 0 }}>Body</h3>
          <Field label="Date">
            <input type="date" value={body.date} onChange={(e) => setBody({ ...body, date: e.target.value })} />
          </Field>
          <Field label="Weight (kg)">
            <input value={body.weight_kg} onChange={(e) => setBody({ ...body, weight_kg: e.target.value })} />
          </Field>
          <Field label="Waist (cm)">
            <input value={body.waist_cm} onChange={(e) => setBody({ ...body, waist_cm: e.target.value })} />
          </Field>
          <Field label="Notes">
            <input value={body.notes} onChange={(e) => setBody({ ...body, notes: e.target.value })} />
          </Field>
          <button type="submit">Save Body</button>
        </form>

        <form onSubmit={submitRun} style={{ gridColumn: "1 / span 1" }}>
          <h3 style={{ marginTop: 0 }}>Run</h3>
          <Field label="Date">
            <input type="date" value={run.date} onChange={(e) => setRun({ ...run, date: e.target.value })} />
          </Field>
          <Field label="Distance (km)">
            <input value={run.distance_km} onChange={(e) => setRun({ ...run, distance_km: e.target.value })} />
          </Field>
          <Field label="Duration (min)">
            <input value={run.duration_min} onChange={(e) => setRun({ ...run, duration_min: e.target.value })} />
          </Field>
          <Field label="Avg pace (sec/km)">
            <input value={run.avg_pace_sec_km} onChange={(e) => setRun({ ...run, avg_pace_sec_km: e.target.value })} />
          </Field>
          <Field label="RPE (1-10)">
            <input value={run.rpe_1_10} onChange={(e) => setRun({ ...run, rpe_1_10: e.target.value })} />
          </Field>
          <Field label="Zone (text)">
            <input value={run.zone} onChange={(e) => setRun({ ...run, zone: e.target.value })} placeholder="e.g., Z2" />
          </Field>
          <Field label="Notes">
            <input value={run.notes} onChange={(e) => setRun({ ...run, notes: e.target.value })} />
          </Field>
          <button type="submit">Save Run</button>
        </form>

        <form onSubmit={submitStrengthSession} style={{ gridColumn: "2 / span 1" }}>
          <h3 style={{ marginTop: 0 }}>Strength session</h3>
          <Field label="Date">
            <input
              type="date"
              value={strengthSession.date}
              onChange={(e) => setStrengthSession({ ...strengthSession, date: e.target.value })}
            />
          </Field>
          <Field label="Program week (optional)">
            <input
              value={strengthSession.program_week}
              onChange={(e) => setStrengthSession({ ...strengthSession, program_week: e.target.value })}
              placeholder="e.g., 3"
            />
          </Field>
          <Field label="Session type (required)">
            <input
              value={strengthSession.session_type}
              onChange={(e) => setStrengthSession({ ...strengthSession, session_type: e.target.value })}
              placeholder="e.g., Upper (Arms Priority)"
              required
            />
          </Field>
          <Field label="Total volume score (optional)">
            <input
              value={strengthSession.total_volume_score}
              onChange={(e) =>
                setStrengthSession({ ...strengthSession, total_volume_score: e.target.value })
              }
            />
          </Field>
          <Field label="RPE (optional)">
            <input value={strengthSession.rpe_1_10} onChange={(e) => setStrengthSession({ ...strengthSession, rpe_1_10: e.target.value })} />
          </Field>
          <Field label="Notes">
            <input value={strengthSession.notes} onChange={(e) => setStrengthSession({ ...strengthSession, notes: e.target.value })} />
          </Field>
          <button type="submit">Save Strength Session</button>
        </form>

        <form onSubmit={submitStrengthExercise} style={{ gridColumn: "1 / span 2" }}>
          <h3 style={{ marginTop: 0 }}>Strength exercise (add one)</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Strength session entry_id">
              <input
                value={strengthExercise.strength_session_entry_id}
                onChange={(e) =>
                  setStrengthExercise({ ...strengthExercise, strength_session_entry_id: e.target.value })
                }
                placeholder="Paste from previous save"
                style={{ width: 360 }}
                required
              />
            </Field>
            <Field label="Exercise name">
              <input
                value={strengthExercise.exercise_name}
                onChange={(e) =>
                  setStrengthExercise({ ...strengthExercise, exercise_name: e.target.value })
                }
                placeholder="e.g., Incline Dumbbell Curl"
                style={{ width: 360 }}
                required
              />
            </Field>
            <Field label="Sets">
              <input
                type="number"
                value={strengthExercise.sets}
                onChange={(e) => setStrengthExercise({ ...strengthExercise, sets: e.target.value })}
                style={{ width: 120 }}
              />
            </Field>
            <Field label="Reps">
              <input
                type="number"
                value={strengthExercise.reps}
                onChange={(e) => setStrengthExercise({ ...strengthExercise, reps: e.target.value })}
                style={{ width: 120 }}
              />
            </Field>
            <Field label="Weight kg (optional)">
              <input
                value={strengthExercise.weight_kg}
                onChange={(e) => setStrengthExercise({ ...strengthExercise, weight_kg: e.target.value })}
                style={{ width: 140 }}
              />
            </Field>
            <Field label="RPE (optional)">
              <input
                value={strengthExercise.rpe_1_10}
                onChange={(e) => setStrengthExercise({ ...strengthExercise, rpe_1_10: e.target.value })}
                style={{ width: 120 }}
              />
            </Field>
            <Field label="Notes (optional)">
              <input
                value={strengthExercise.notes}
                onChange={(e) => setStrengthExercise({ ...strengthExercise, notes: e.target.value })}
                style={{ width: 260 }}
              />
            </Field>
          </div>
          <button type="submit">Save Exercise</button>
        </form>
      </div>
    </div>
  );
}

