import React, { useMemo, useState } from "react";
import { apiFetch } from "../api.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function LogForms({ onSaveSuccess, sheetsConnected }) {
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
  const [error, setError] = useState("");

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

  async function handleResponse(message, apiCall) {
    setStatus("");
    setError("");
    try {
      await apiCall();
      setStatus(message);
      if (onSaveSuccess) onSaveSuccess();
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  async function submitJournal(e) {
    e.preventDefault();
    await handleResponse("Journal entry saved successfully.", () =>
      apiFetch("/api/journal/entry", { method: "POST", body: parsedJournal })
    );
  }

  async function submitBody(e) {
    e.preventDefault();
    const payload = {
      ...body,
      weight_kg: Number(body.weight_kg),
      waist_cm: Number(body.waist_cm),
    };
    await handleResponse("Body statistics saved successfully.", () =>
      apiFetch("/api/journal/body", { method: "POST", body: payload })
    );
  }

  async function submitRun(e) {
    e.preventDefault();
    const payload = {
      ...run,
      distance_km: Number(run.distance_km),
      duration_min: Number(run.duration_min),
      avg_pace_sec_km: run.avg_pace_sec_km === "" ? null : Number(run.avg_pace_sec_km),
      rpe_1_10: run.rpe_1_10 === "" ? null : Number(run.rpe_1_10),
      zone: run.zone || null,
      notes: run.notes || null,
    };
    await handleResponse("Cardio run log saved successfully.", () =>
      apiFetch("/api/logs/run", { method: "POST", body: payload })
    );
  }

  async function submitStrengthSession(e) {
    e.preventDefault();
    const payload = {
      ...strengthSession,
      program_week: strengthSession.program_week === "" ? null : Number(strengthSession.program_week),
      total_volume_score:
        strengthSession.total_volume_score === "" ? null : Number(strengthSession.total_volume_score),
      rpe_1_10: strengthSession.rpe_1_10 === "" ? null : Number(strengthSession.rpe_1_10),
      session_type: strengthSession.session_type.trim(),
      notes: strengthSession.notes || null,
    };
    
    setStatus("");
    setError("");
    try {
      const res = await apiFetch("/api/logs/strength-session", { method: "POST", body: payload });
      setStrengthExercise((s) => ({ ...s, strength_session_entry_id: res.entry_id }));
      setStatus(`Strength session saved. Session ID: ${res.entry_id}. Please record exercises below.`);
      if (onSaveSuccess) onSaveSuccess();
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  async function submitStrengthExercise(e) {
    e.preventDefault();
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
    await handleResponse("Strength exercise recorded successfully.", () =>
      apiFetch("/api/logs/strength-exercise", { method: "POST", body: payload })
    );
  }

  return (
    <div>
      <div className="panel-title-row">
        <div>
          <h2 className="panel-title">Capture Daily Logs</h2>
          <p className="panel-subtitle">Log physical data to calibrate your personalized AI Coaching feedback loop.</p>
        </div>
      </div>

      {!sheetsConnected ? (
        <div className="alert warning" style={{ marginBottom: "20px" }}>
          <span>⚠️ <b>Offline Mode Active:</b> Log updates will execute on the local mock environment and won't write to Google Drive.</span>
        </div>
      ) : null}

      {status ? <div className="alert success">{status}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {/* Grid Layout containing Forms */}
      <div className="grid cols-2">
        {/* Journal Log Form */}
        <form onSubmit={submitJournal} className="card card-accent-journal">
          <h3 style={{ color: "var(--stat-journal)" }}>🌙 Daily Sleep & Glycemia Log</h3>
          <div className="form-section-title">Essential Bio-Signals</div>
          
          <div className="field-group">
            <Field label="Record Date">
              <input type="date" value={journal.date} onChange={(e) => setJournal({ ...journal, date: e.target.value })} required />
            </Field>
            <Field label="Sleep Hours">
              <input type="number" step="0.1" value={journal.sleep_hours} onChange={(e) => setJournal({ ...journal, sleep_hours: e.target.value })} placeholder="e.g. 7.5" />
            </Field>
          </div>

          <div className="field-group">
            <Field label="Sleep Quality (1-5)">
              <input type="number" min="1" max="5" value={journal.sleep_quality_1_5} onChange={(e) => setJournal({ ...journal, sleep_quality_1_5: e.target.value })} placeholder="1 = poor, 5 = deep" />
            </Field>
            <Field label="Stress Index (1-5)">
              <input type="number" min="1" max="5" value={journal.stress_1_5} onChange={(e) => setJournal({ ...journal, stress_1_5: e.target.value })} placeholder="1 = calm, 5 = high" />
            </Field>
          </div>

          <div className="field-group">
            <Field label="Hunger Index (1-5)">
              <input type="number" min="1" max="5" value={journal.hunger_1_5} onChange={(e) => setJournal({ ...journal, hunger_1_5: e.target.value })} placeholder="1 = full, 5 = cravings" />
            </Field>
            <Field label="Daily Steps Count">
              <input type="number" value={journal.steps} onChange={(e) => setJournal({ ...journal, steps: e.target.value })} placeholder="e.g. 10000" />
            </Field>
          </div>

          <div className="form-section-title" style={{ marginTop: "18px" }}>Glucose Metrics</div>
          <div className="field-group">
            <Field label="Fasting Glucose (mg/dL)">
              <input type="number" value={journal.fasting_glucose_mg_dl} onChange={(e) => setJournal({ ...journal, fasting_glucose_mg_dl: e.target.value })} placeholder="Optimal <100" />
            </Field>
            <Field label="Post-Meal Glucose (mg/dL)">
              <input type="number" value={journal.post_meal_glucose_mg_dl} onChange={(e) => setJournal({ ...journal, post_meal_glucose_mg_dl: e.target.value })} placeholder="Optimal <140" />
            </Field>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <Field label="HbA1c (%)">
              <input type="number" step="0.01" value={journal.hbA1c_percent} onChange={(e) => setJournal({ ...journal, hbA1c_percent: e.target.value })} placeholder="e.g. 5.4" />
            </Field>
          </div>

          <Field label="Journal Notes">
            <textarea value={journal.notes} onChange={(e) => setJournal({ ...journal, notes: e.target.value })} placeholder="Describe physical feelings, symptoms, muscle soreness or dietary exceptions..." />
          </Field>

          <button className="primary" style={{ marginTop: "16px", width: "100%" }} type="submit">
            Save Daily Journal
          </button>
        </form>

        {/* Right Columns: Body Stats and Cardio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Body stats form */}
          <form onSubmit={submitBody} className="card card-accent-body">
            <h3 style={{ color: "var(--stat-body)" }}>📏 Body Composition Metrics</h3>
            <div className="field-group">
              <Field label="Record Date">
                <input type="date" value={body.date} onChange={(e) => setBody({ ...body, date: e.target.value })} required />
              </Field>
              <Field label="Weight (kg)">
                <input type="number" step="0.01" value={body.weight_kg} onChange={(e) => setBody({ ...body, weight_kg: e.target.value })} placeholder="e.g. 78.5" required />
              </Field>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Field label="Waist Circumference (cm)">
                <input type="number" step="0.1" value={body.waist_cm} onChange={(e) => setBody({ ...body, waist_cm: e.target.value })} placeholder="e.g. 84.0" required />
              </Field>
            </div>
            <Field label="Body Notes">
              <input value={body.notes} onChange={(e) => setBody({ ...body, notes: e.target.value })} placeholder="Fasting morning weight, post-workout waist, etc." />
            </Field>
            <button className="primary" style={{ marginTop: "16px", width: "100%" }} type="submit">
              Save Body Metrics
            </button>
          </form>

          {/* Cardio run log form */}
          <form onSubmit={submitRun} className="card card-accent-run">
            <h3 style={{ color: "var(--stat-run)" }}>🏃 Aerobic Run Log</h3>
            <div className="field-group">
              <Field label="Record Date">
                <input type="date" value={run.date} onChange={(e) => setRun({ ...run, date: e.target.value })} required />
              </Field>
              <Field label="Distance (km)">
                <input type="number" step="0.01" value={run.distance_km} onChange={(e) => setRun({ ...run, distance_km: e.target.value })} placeholder="e.g. 5.2" required />
              </Field>
            </div>
            <div className="field-group">
              <Field label="Duration (minutes)">
                <input type="number" step="0.1" value={run.duration_min} onChange={(e) => setRun({ ...run, duration_min: e.target.value })} placeholder="e.g. 30" required />
              </Field>
              <Field label="Pace (seconds/km)">
                <input type="number" value={run.avg_pace_sec_km} onChange={(e) => setRun({ ...run, avg_pace_sec_km: e.target.value })} placeholder="e.g. 340 (5:40/km)" />
              </Field>
            </div>
            <div className="field-group">
              <Field label="RPE Effort (1-10)">
                <input type="number" min="1" max="10" value={run.rpe_1_10} onChange={(e) => setRun({ ...run, rpe_1_10: e.target.value })} placeholder="1 = easy, 10 = max" />
              </Field>
              <Field label="Heart Rate Zone">
                <input value={run.zone} onChange={(e) => setRun({ ...run, zone: e.target.value })} placeholder="e.g. Z2 Aerobic" />
              </Field>
            </div>
            <Field label="Run Notes">
              <input value={run.notes} onChange={(e) => setRun({ ...run, notes: e.target.value })} placeholder="Trail run, breathing rates, fast finish, etc." />
            </Field>
            <button className="primary" style={{ marginTop: "16px", width: "100%" }} type="submit">
              Save Run Log
            </button>
          </form>
        </div>
      </div>

      {/* Strength Training Workout Session Block */}
      <div className="grid cols-1" style={{ marginTop: "24px" }}>
        <div className="card card-accent-strength">
          <h3 style={{ color: "var(--stat-strength)" }}>💪 Strength Training Session & Exercises</h3>
          
          <div className="grid cols-2" style={{ gap: "24px" }}>
            {/* Session logging */}
            <form onSubmit={submitStrengthSession}>
              <div className="form-section-title">1. Create Workout Session</div>
              
              <div className="field-group">
                <Field label="Record Date">
                  <input type="date" value={strengthSession.date} onChange={(e) => setStrengthSession({ ...strengthSession, date: e.target.value })} required />
                </Field>
                <Field label="Program Week">
                  <input type="number" value={strengthSession.program_week} onChange={(e) => setStrengthSession({ ...strengthSession, program_week: e.target.value })} placeholder="e.g. Week 3" />
                </Field>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Field label="Session Split (Split Name)">
                  <input value={strengthSession.session_type} onChange={(e) => setStrengthSession({ ...strengthSession, session_type: e.target.value })} placeholder="e.g. Upper Split (Arms Hypertrophy)" required />
                </Field>
              </div>

              <div className="field-group">
                <Field label="Total Volume Score">
                  <input type="number" value={strengthSession.total_volume_score} onChange={(e) => setStrengthSession({ ...strengthSession, total_volume_score: e.target.value })} placeholder="Total kg loaded" />
                </Field>
                <Field label="RPE Effort (1-10)">
                  <input type="number" min="1" max="10" value={strengthSession.rpe_1_10} onChange={(e) => setStrengthSession({ ...strengthSession, rpe_1_10: e.target.value })} placeholder="Overall RPE" />
                </Field>
              </div>

              <div style={{ marginTop: "12px", marginBottom: "16px" }}>
                <Field label="Workout Notes">
                  <input value={strengthSession.notes} onChange={(e) => setStrengthSession({ ...strengthSession, notes: e.target.value })} placeholder="Felt strong, progressive overload target met, etc." />
                </Field>
              </div>

              <button className="primary" style={{ width: "100%" }} type="submit">
                Initialize Session
              </button>
            </form>

            {/* Exercise logging */}
            <form onSubmit={submitStrengthExercise}>
              <div className="form-section-title">2. Add Exercises to Session</div>
              
              <div className="field-group">
                <Field label="Strength Session ID">
                  <input value={strengthExercise.strength_session_entry_id} onChange={(e) => setStrengthExercise({ ...strengthExercise, strength_session_entry_id: e.target.value })} placeholder="Auto-populated on session save" required />
                </Field>
                <Field label="Exercise Movement Name">
                  <input value={strengthExercise.exercise_name} onChange={(e) => setStrengthExercise({ ...strengthExercise, exercise_name: e.target.value })} placeholder="e.g. Dumbbell Incline Bicep Curl" required />
                </Field>
              </div>

              <div className="field-group">
                <Field label="Sets Performed">
                  <input type="number" value={strengthExercise.sets} onChange={(e) => setStrengthExercise({ ...strengthExercise, sets: e.target.value })} required />
                </Field>
                <Field label="Reps Performed">
                  <input type="number" value={strengthExercise.reps} onChange={(e) => setStrengthExercise({ ...strengthExercise, reps: e.target.value })} required />
                </Field>
              </div>

              <div className="field-group">
                <Field label="Weight Loaded (kg)">
                  <input type="number" step="0.01" value={strengthExercise.weight_kg} onChange={(e) => setStrengthExercise({ ...strengthExercise, weight_kg: e.target.value })} placeholder="e.g. 15" />
                </Field>
                <Field label="Exercise RPE Effort (1-10)">
                  <input type="number" min="1" max="10" value={strengthExercise.rpe_1_10} onChange={(e) => setStrengthExercise({ ...strengthExercise, rpe_1_10: e.target.value })} placeholder="Individual movement RPE" />
                </Field>
              </div>

              <div style={{ marginTop: "12px", marginBottom: "16px" }}>
                <Field label="Exercise Notes">
                  <input value={strengthExercise.notes} onChange={(e) => setStrengthExercise({ ...strengthExercise, notes: e.target.value })} placeholder="Double progression targets, contraction peak notes, etc." />
                </Field>
              </div>

              <button className="primary" style={{ width: "100%" }} type="submit" disabled={!strengthExercise.strength_session_entry_id}>
                Record Exercise Log
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
