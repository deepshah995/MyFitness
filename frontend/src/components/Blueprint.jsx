import React, { useState, useMemo } from "react";

// In-depth 7-day metabolic timeline data
const dailySchedules = {
  1: {
    name: "Monday (Dedicated Arms & Glycemic Sinks)",
    checklist: [
      { id: "m1", text: "Fasting blood glucose log (< 100 mg/dL target)" },
      { id: "m2", text: "Dedicated Arm Hypertrophy Workout (60 mins)" },
      { id: "m3", text: "Protein intake: 145g minimum target" },
      { id: "m4", text: "15-minute walk after lunch" },
      { id: "m5", text: "15-minute walk after dinner" },
      { id: "m6", text: "Fasting window: 12 hours completed" }
    ],
    timeline: [
      { time: "08:00 AM", title: "Fasting & Signal Check", desc: "Log fasting glucose and take morning supplement stack (Vitamin D3 + Omega-3)." },
      { time: "12:30 PM", title: "High-Protein Lunch (Fiber-First)", desc: "Eggetarian base: 3 scrambled egg whites + spinach and avocado salad. Carbs strictly last." },
      { time: "05:30 PM", title: "Monday Arms Blast Routine", desc: "4 sets DB curls, Overhead triceps extensions, Hammer curls. Focus on 3s eccentric descent." },
      { time: "07:00 PM", title: "Glycemic Recovery Dinner", desc: "Post-workout whey isolate shake, followed by brown rice, lentils, and steamed broccoli." },
      { time: "08:00 PM", title: "The 15-Min Walk & Fast Start", desc: "Brisk post-meal walk to clear blood sugar. Fasting window begins." }
    ]
  },
  2: {
    name: "Tuesday (Zone 2 Aerobic Base)",
    checklist: [
      { id: "t1", text: "Fasting blood glucose log" },
      { id: "t2", text: "35-minute Zone 2 Cardio Run (HR: 130-138 bpm)" },
      { id: "t3", text: "10,000 steps baseline completed" },
      { id: "t4", text: "Morning hydration: 1L water with electrolytes" },
      { id: "t5", text: "Ashwagandha protocol at bedtime" }
    ],
    timeline: [
      { time: "07:30 AM", title: "Zone 2 Base Run", desc: "Lace up and log a comfortable 5.2 km aerobic base run. Keep breathing strictly nasal if possible." },
      { time: "09:00 AM", title: "Post-Run Glycemic Hydration", desc: "Hydration flask with electrolytes, followed by Greek yogurt and berries." },
      { time: "01:00 PM", title: "Eggetarian Core Lunch", desc: "Egg salad wrap with low-carb high-fiber tortilla and cucumber slices." },
      { time: "07:30 PM", title: "Light Glycemic Dinner", desc: "Tofu stir-fry with mixed vegetables (bell peppers, mushrooms, asparagus) over cauliflower rice." },
      { time: "10:00 PM", title: "Cortisol Shield Bedtime", desc: "Take bedtime Ashwagandha dose to reduce morning liver glucose dumping." }
    ]
  },
  3: {
    name: "Wednesday (Metabolic Leg Clearance & Core)",
    checklist: [
      { id: "w1", text: "Goblet Squats & Leg Compound Session (60 mins)" },
      { id: "w2", text: "First-bite sequencing followed during lunch/dinner" },
      { id: "w3", text: "Plank & Core stability flows completed" },
      { id: "w4", text: "15-minute walk after legs workout" },
      { id: "w5", text: "8.0 hours of high-quality sleep completed" }
    ],
    timeline: [
      { time: "08:00 AM", title: "Morning Mobility Check", desc: "Log fasting weight and waist stats. Quick core activations." },
      { time: "12:30 PM", title: "Pre-Workout Lunch", desc: "Quinoa salad bowl with edamame, paneer cubes, and leafy greens." },
      { time: "05:30 PM", title: "Legs & Glycemic Sink Session", desc: "Goblet squats, Bulgarian split squats, Romanian deadlifts. High caloric burn to clear systemic sugar." },
      { time: "07:00 PM", title: "Protein Rebuilding Dinner", desc: "Egg white omelette with mushrooms and onions, plus a side of baked sweet potato." },
      { time: "09:00 PM", title: "Core & Sleep Preparation", desc: "Wind-down routine: dim lights, 10 mins deep diaphragmatic breathing." }
    ]
  },
  4: {
    name: "Thursday (Active Recovery & Insuln Reset)",
    checklist: [
      { id: "th1", text: "Active mobility / stretching flows (20 mins)" },
      { id: "th2", text: "10,000 steps continuous baseline completed" },
      { id: "th3", text: "Zero snacking between meals" },
      { id: "th4", text: " Bedtime cortisol checklist completed" }
    ],
    timeline: [
      { time: "08:30 AM", title: "Active Stretching Flow", desc: "Light mobility routine focusing on shoulder, hip, and ankle range of motion." },
      { time: "12:00 PM", title: "Metabolic Lunch", desc: "Mixed vegetable curry with paneer, high-protein lentil soup (dal), and broccoli." },
      { time: "03:30 PM", title: "Outdoor Walking NEAT", desc: "Brisk 30-minute outdoor walk to build step counts and oxygenate cells." },
      { time: "07:30 PM", title: "Protein-First Dinner", desc: "Pan-seared tempeh steak with asparagus and mixed green salad. Zero carb dessert." }
    ]
  },
  5: {
    name: "Friday (Upper Body Press & Arm Pump)",
    checklist: [
      { id: "f1", text: "Upper Body Compound Push/Pull Workout (60 mins)" },
      { id: "f2", text: "Arm Pump Finisher mechanical drop-sets completed" },
      { id: "f3", text: "Protein intake: 145g minimum target" },
      { id: "f4", text: "15-minute walk after dinner" }
    ],
    timeline: [
      { time: "08:00 AM", title: "Morning Supplements Stack", desc: "Log fasting glucose. Take morning D3 and Omega-3 capsules." },
      { time: "12:30 PM", title: "Eggetarian Fuel Lunch", desc: "Chickpea salad bowl with diced cucumber, tomatoes, and boiled eggs." },
      { time: "05:30 PM", title: "Friday Upper Compound Session", desc: "DB overhead press, chest-supported rows, incline presses, plus curl/kickback supersets." },
      { time: "07:30 PM", title: "Post-Workout Protein Dinner", desc: "Whey isolate shake followed by lentil pasta with sugar-free marinara and tofu." }
    ]
  },
  6: {
    name: "Saturday (Aerobic 10K Endurance Base)",
    checklist: [
      { id: "s1", text: "Fasting blood glucose log" },
      { id: "s2", text: "Long Endurance Run (6.5 km base Zone 2)" },
      { id: "s3", text: "15,000 total steps base target achieved" },
      { id: "s4", text: "Hydration checklist: 3L water logged" }
    ],
    timeline: [
      { time: "07:00 AM", title: "Long Run Cardio Base", desc: "Log a progressive 6.5 km Zone 2 cardio session. Maintain nasal pacing." },
      { time: "09:00 AM", title: "Post-Run Protein Feast", desc: "Protein shake with almond milk and peanut butter, followed by scrambled eggs." },
      { time: "01:00 PM", title: "Endurance Recovery Lunch", desc: "Lentil soup, quinoa, and avocado greens bowl with olive oil dressing." },
      { time: "08:00 PM", title: "Glycemic Stability Dinner", desc: "Paneer skewers, grilled peppers, and steamed green beans." }
    ]
  },
  7: {
    name: "Sunday (Full Rest, Prep & Sleep Remission)",
    checklist: [
      { id: "su1", text: "Bedtime Ashwagandha dose logged" },
      { id: "su2", text: "Meal prep completed for Mon-Wed" },
      { id: "su3", text: "Full day active recovery (no heavy lifting)" },
      { id: "su4", text: "8.5 hours deep sleep target achieved" }
    ],
    timeline: [
      { time: "09:00 AM", title: "Rest & Hydration Flow", desc: "Slow morning. Drink 500ml water and focus on physical decompression." },
      { time: "01:00 PM", title: "Sundays Nutrition", desc: "Heavy vegetable soup with cottage cheese cubes and mixed seeds." },
      { time: "04:00 PM", title: "Grocery & Meal Prep", desc: "Prep egg whites, paneer, tofu, broccoli, and greens to prevent mid-week dietary slips." },
      { time: "09:30 PM", title: "Sleep & Glucose Reset", desc: "bedtime ashwagandha protocol. 8.5 hours sleep target starts now." }
    ]
  }
};

const blueprintTabs = [
  { id: "overview", label: "📊 Strategy Dashboard" },
  { id: "daily", label: "📅 Daily Planner" },
  { id: "workouts", label: "🏋️‍♂️ Strength Routines" },
  { id: "running", label: "🏃‍♂️ 10K Run Matrix" },
  { id: "diet", label: "🥗 Eggetarian Diet" },
  { id: "supplements", label: "💊 Supplements Calendar" }
];

export default function Blueprint() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDay, setSelectedDay] = useState(1);
  const [checkedItems, setCheckedItems] = useState({});

  // Dynamic calculation of daily checklist completion
  const currentDayData = dailySchedules[selectedDay];
  const dayCompletion = useMemo(() => {
    const list = currentDayData.checklist;
    const completed = list.filter(item => checkedItems[item.id]).length;
    return Math.round((completed / list.length) * 100);
  }, [selectedDay, checkedItems, currentDayData]);

  function handleToggleCheck(id) {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  return (
    <div className="blueprint-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="title" style={{ margin: 0 }}>Metabolic Recomposition Blueprint</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>Your 16-Week Arm Hypertrophy, 10K Target & Insulin Remission Plan.</p>
        </div>
        <span className="badge brand" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
          Target: 31M | Prediabetic (HbA1c ~6.0)
        </span>
      </div>

      {/* Blueprint Sub-Navigation tabs */}
      <div className="tab-row" style={{ display: "flex", gap: "6px", marginBottom: "22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "4px", borderRadius: "12px", flexWrap: "wrap" }}>
        {blueprintTabs.map(t => (
          <button
            key={t.id}
            type="button"
            className={`pill ${activeTab === t.id ? "active" : ""}`}
            style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab Content mapping */}

      {/* 1. STRATEGY DASHBOARD */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card card-accent-journal" style={{ padding: "24px" }}>
            <h3 style={{ color: "var(--accent-journal)", marginTop: 0 }}>📉 The Insulin Remission & Glucose Sink Strategy</h3>
            <p className="panel-subtitle" style={{ fontSize: "0.92rem", lineHeight: "1.6", color: "var(--text)" }}>
              Your elevated HbA1c (~6.0) indicates early stage insulin resistance. To resolve this without severe caloric restriction, our training strategy focuses on turning your skeletal muscle fibers into highly efficient <b>glucose sinks</b>. 
              By increasing hypertrophic density in your upper body (arms) and stimulating your largest systemic engines (legs compound day), your muscles will clear blood glucose directly from your bloodstream without relying on heavy insulin secretion.
            </p>
            <div className="grid cols-2" style={{ gap: "16px", marginTop: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h4 style={{ margin: "0 0 8px", color: "var(--accent-journal)" }}>🍽 First-Bite Sequencing Rule</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                  Always ingest non-starchy green fiber first during meals, protein and healthy fats second, and reserve complex carbohydrates strictly for the end of the meal. This slows down gastric emptying and blunts glycemic spikes.
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h4 style={{ margin: "0 0 8px", color: "var(--accent-run)" }}>🚶 The 15-Minute Post-Meal Walk</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                  A brisk 15-minute outdoor walk taken immediately after your largest carbohydrate intake forces active muscles to clear circulating blood sugar directly via non-insulin-mediated pathways, lowering glycemic impact.
                </p>
              </div>
            </div>
          </div>

          <div className="grid cols-3" style={{ gap: "16px" }}>
            <div className="card" style={{ padding: "18px" }}>
              <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#a5b4fc", fontSize: "0.65rem", padding: "4px 8px" }}>Cortisol Control</span>
              <h4 style={{ margin: "8px 0", color: "var(--text)" }}>Stress & Gluconeogenesis</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                High stress and elevated cortisol signal the liver to undergo gluconeogenesis (dumping stored sugar into your blood). Controlling stress via Ashwagandha and recovery is critical to lowering fasting glucose.
              </p>
            </div>
            <div className="card" style={{ padding: "18px" }}>
              <span className="badge" style={{ background: "rgba(34, 211, 153, 0.1)", color: "#6ee7b7", fontSize: "0.65rem", padding: "4px 8px" }}>Arm Priority</span>
              <h4 style={{ margin: "8px 0", color: "var(--text)" }}>Arm Hypertrophy Focus</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                Moving your primary biceps, triceps, and forearm blast to Monday leverages maximum neural drive and muscle glycogen availability, boosting mechanical tension when your energy is highest.
              </p>
            </div>
            <div className="card" style={{ padding: "18px" }}>
              <span className="badge" style={{ background: "rgba(34, 209, 238, 0.1)", color: "#67e8f9", fontSize: "0.65rem", padding: "4px 8px" }}>Aerobic Base</span>
              <h4 style={{ margin: "8px 0", color: "var(--text)" }}>Zone 2 10K Blueprint</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                Building an endurance engine via comfortable Zone 2 nasal running (130-138 bpm) safely improves cardiac stroke volume, fat oxidation, and vascular density without causing recovery-destroying cortisol spikes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DAILY PLANNER */}
      {activeTab === "daily" && (
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Interactive 24-Hour Calendar</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0" }}>Check off targets dynamically to calculate your metabolic execution percentage.</p>
            </div>
            
            {/* Completion Ring Meter */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ position: "relative", width: "42px", height: "42px", display: "flex", alignItems: "center", justify: "center" }}>
                <svg width="42" height="42" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="21" cy="21" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                  <circle cx="21" cy="21" r="18" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray="113.1" strokeDashoffset={113.1 - (113.1 * dayCompletion) / 100} style={{ transition: "stroke-dashoffset 0.35s ease" }} />
                </svg>
                <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "0.7rem", fontWeight: "800", color: "#10b981" }}>{dayCompletion}%</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: "700" }}>Day Score</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#10b981" }}>{dayCompletion >= 80 ? "🔥 Excellent Sync" : "⚡ Keep Logged"}</span>
              </div>
            </div>
          </div>

          {/* Weekday Selector buttons */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
            {[
              { id: 1, label: "Mon (Arms)" },
              { id: 2, label: "Tue (Run Z2)" },
              { id: 3, label: "Wed (Legs)" },
              { id: 4, label: "Thu (Recovery)" },
              { id: 5, label: "Fri (Upper)" },
              { id: 6, label: "Sat (Long Run)" },
              { id: 7, label: "Sun (Rest)" }
            ].map(d => (
              <button
                key={d.id}
                type="button"
                className={`sheet-tab-mock ${selectedDay === d.id ? "active" : ""}`}
                style={{ fontSize: "0.78rem", padding: "8px 12px", whiteSpace: "nowrap" }}
                onClick={() => setSelectedDay(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="grid cols-3" style={{ gap: "20px", alignItems: "start" }}>
            {/* Checklist */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>🔑 Checklist</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {currentDayData.checklist.map(item => (
                  <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.82rem", cursor: "pointer", color: checkedItems[item.id] ? "var(--muted)" : "var(--text)" }}>
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => handleToggleCheck(item.id)}
                      style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "#10b981", cursor: "pointer" }}
                    />
                    <span style={{ textDecoration: checkedItems[item.id] ? "line-through" : "none" }}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="cols-2" style={{ gridColumn: "span 2", background: "rgba(255,255,255,0.01)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>🕒 Timeline Scheduler</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px dashed rgba(255,255,255,0.06)", paddingLeft: "16px", marginLeft: "8px" }}>
                {currentDayData.timeline.map((item, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-22px", top: "2px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--brand-2)", border: "2px solid var(--bg)" }} />
                    <span style={{ fontSize: "0.7rem", color: "var(--brand-2)", fontWeight: "700" }}>{item.time}</span>
                    <h5 style={{ margin: "2px 0 4px", fontSize: "0.85rem", color: "var(--text)" }}>{item.title}</h5>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STRENGTH ROUTINES */}
      {activeTab === "workouts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Workout A */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Workout A: Dedicated Arm Hypertrophy Day</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-journal)", fontWeight: "700" }}>Scheduled: Monday (60 mins)</span>
              </div>
              <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#a5b4fc", fontSize: "0.68rem", padding: "6px 12px", borderRadius: "999px" }}>Isolation Primary</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="sheet-table-mock" style={{ minWidth: "100%", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Exercise Name</th>
                    <th>Sets x Reps</th>
                    <th>Rest Period</th>
                    <th>Form Cue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>DB Bicep Curl (Supinated)</td>
                    <td>4 Sets x 8-10 reps</td>
                    <td>60 Secs</td>
                    <td>Squeeze at peak, 3s eccentric lowering</td>
                  </tr>
                  <tr>
                    <td>Overhead Dumbbell Extension</td>
                    <td>4 Sets x 8-10 reps</td>
                    <td>60 Secs</td>
                    <td>Keep elbows tucked, full long head stretch</td>
                  </tr>
                  <tr>
                    <td>Hammer Curl (Neutral Grip)</td>
                    <td>3 Sets x 10-12 reps</td>
                    <td>60 Secs</td>
                    <td>Elbows locked at ribs, brachioradialis blast</td>
                  </tr>
                  <tr>
                    <td>Cable/Band Triceps Pushdown</td>
                    <td>3 Sets x 12-15 reps</td>
                    <td>60 Secs</td>
                    <td>Pronated grip, flare ropes at bottom lockout</td>
                  </tr>
                  <tr>
                    <td>Reverse Grip Barbell Curl</td>
                    <td>3 Sets x 12-15 reps</td>
                    <td>60 Secs</td>
                    <td>Wrist stabilization, brachialis hypertrophy</td>
                  </tr>
                  <tr>
                    <td>Close Grip Push-Ups</td>
                    <td>3 Sets x Failure</td>
                    <td>60 Secs</td>
                    <td>Keep chest proud, triceps pump finisher</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Workout B */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Workout B: Lower Body & Glycemic Core</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-body)", fontWeight: "700" }}>Scheduled: Wednesday (60 mins)</span>
              </div>
              <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#34d399", fontSize: "0.68rem", padding: "6px 12px", borderRadius: "999px" }}>Caloric Engine</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="sheet-table-mock" style={{ minWidth: "100%", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Exercise Name</th>
                    <th>Sets x Reps</th>
                    <th>Rest Period</th>
                    <th>Form Cue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Goblet Squat (Heavy DB/KB)</td>
                    <td>4 Sets x 8-10 reps</td>
                    <td>90 Secs</td>
                    <td>Full depth, posterior load to protect lower back</td>
                  </tr>
                  <tr>
                    <td>Dumbbell Romanian Deadlift</td>
                    <td>4 Sets x 10-12 reps</td>
                    <td>90 Secs</td>
                    <td>Hinge hips backward, stretch hamstrings loaded</td>
                  </tr>
                  <tr>
                    <td>Bulgarian Split Squat</td>
                    <td>3 Sets x 8-10 reps</td>
                    <td>60 Secs</td>
                    <td>Control knee tracking, drop vertically</td>
                  </tr>
                  <tr>
                    <td>Calf Raise (Single Leg)</td>
                    <td>3 Sets x 12-15 reps</td>
                    <td>45 Secs</td>
                    <td>Hold contraction 2s, slow eccentric stretch</td>
                  </tr>
                  <tr>
                    <td>Plank to Side-Plank Flow</td>
                    <td>3 Sets x 45-60s hold</td>
                    <td>45 Secs</td>
                    <td>Glutes squeezed, hips elevated continuously</td>
                  </tr>
                  <tr>
                    <td>Deadbug Core Flow</td>
                    <td>3 Sets x 10 reps / side</td>
                    <td>45 Secs</td>
                    <td>Lower back glued to floor. Breathe deeply</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Workout C */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Workout C: Upper Body Press & Pull (Arm Pump Finisher)</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-run)", fontWeight: "700" }}>Scheduled: Friday (60 mins)</span>
              </div>
              <span className="badge" style={{ background: "rgba(34, 209, 238, 0.1)", color: "#22d3ee", fontSize: "0.68rem", padding: "6px 12px", borderRadius: "999px" }}>Compound Focus</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="sheet-table-mock" style={{ minWidth: "100%", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Exercise Name</th>
                    <th>Sets x Reps</th>
                    <th>Rest Period</th>
                    <th>Form Cue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Dumbbell Overhead Press</td>
                    <td>3 Sets x 8-10 reps</td>
                    <td>90 Secs</td>
                    <td>Braced core, complete vertical lockout</td>
                  </tr>
                  <tr>
                    <td>Chest-Supported DB Row</td>
                    <td>3 Sets x 10-12 reps</td>
                    <td>90 Secs</td>
                    <td>Retract scapula first, pull elbow to hip</td>
                  </tr>
                  <tr>
                    <td>Incline DB Chest Press</td>
                    <td>3 Sets x 10-12 reps</td>
                    <td>90 Secs</td>
                    <td>30-degree incline, stretch chest fibers</td>
                  </tr>
                  <tr>
                    <td>Kettlebell Swings</td>
                    <td>3 Sets x 15-20 reps</td>
                    <td>60 Secs</td>
                    <td>Hip hinge drive, explosive glute snap</td>
                  </tr>
                  <tr>
                    <td>Renegade Rows</td>
                    <td>3 Sets x 8 reps / side</td>
                    <td>60 Secs</td>
                    <td>Plank base, pull dumbbells without rocking hips</td>
                  </tr>
                  <tr>
                    <td>Incline DB Bicep Curl (Superset)</td>
                    <td>3 Sets x 15 reps each</td>
                    <td>45 Secs</td>
                    <td>Combined with DB Triceps Kickback for arm pump</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. 10K RUN MATRIX */}
      {activeTab === "running" && (
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Progressive 10K Run Matrix</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0" }}>Zone 2 heart-rate based volume progression for aerobic capacity without cortisol spike.</p>
            </div>
            <span className="badge" style={{ background: "rgba(34, 209, 238, 0.1)", color: "#22d3ee", padding: "6px 12px", height: "fit-content" }}>
              Zone 2 HR Target: 130 - 138 bpm
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="sheet-table-mock" style={{ minWidth: "100%", width: "100%" }}>
              <thead>
                <tr>
                  <th>Phase / Block</th>
                  <th>Tuesday (Tempo/Base)</th>
                  <th>Saturday (Long Run)</th>
                  <th>Weekly Volume Target</th>
                  <th>Focus / Recovery Cue</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td><b>Block 1 (Weeks 1-4)</b></td>
                  <td>4.0 km Base Run</td>
                  <td>5.5 km Long Run</td>
                  <td>9.5 km total</td>
                  <td>Nasal breathing base, develop continuous stride pacing</td>
                </tr>
                <tr>
                  <td><b>Block 2 (Weeks 5-8)</b></td>
                  <td>5.0 km Base Run</td>
                  <td>7.0 km Long Run</td>
                  <td>12.0 km total</td>
                  <td>Add light post-run calf mobility routines to protect ankles</td>
                </tr>
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td><b>Block 3 (Weeks 9-12)</b></td>
                  <td>5.5 km Base Run</td>
                  <td>8.5 km Long Run</td>
                  <td>14.0 km total</td>
                  <td>Incorporate continuous Zone 2 heart rate tracking (<140 bpm)</td>
                </tr>
                <tr>
                  <td><b>Block 4 (Weeks 13-16)</b></td>
                  <td>6.0 km Base Run</td>
                  <td>10.0 km Target Run</td>
                  <td>16.0 km total</td>
                  <td>10K Blueprint completion! Clear glycemic sugar base</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. EGGETARIAN DIET */}
      {activeTab === "diet" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px", color: "var(--accent-journal)" }}>🍳 Eggetarian High-Protein Core Diet Plan</h3>
            <p className="panel-subtitle" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
              To support hypertrophy and blood glucose remission, your calories are set to a slight recomp deficit of <b>2,150 kcal</b>. Protein is set to a strict minimum of <b>145g</b>, leveraging eggs, dairy, whey, tofu, paneer, and tempeh. 
              Carbohydrates must be restricted to <b>180g max</b> to prevent glycemic spikes, focusing on low-GI complex carbs.
            </p>

            <div className="grid cols-3" style={{ gap: "16px", marginTop: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h4 style={{ margin: "0 0 8px", color: "var(--text)" }}>🍳 Egg White Base</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                  Egg whites are the gold standard for egg-based recomp, providing 100% bioavailable L-leucine for hypertrophy with zero fats or carbs. Target 6-8 egg whites daily.
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h4 style={{ margin: "0 0 8px", color: "var(--text)" }}>🧀 Paneer, Tofu & Tempeh</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                  Soy proteins (Tofu/Tempeh) provide complete amino acid profiles while lowering cardiovascular markers. Low-fat cottage cheese and paneer serve as excellent casein bases.
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h4 style={{ margin: "0 0 8px", color: "var(--text)" }}>🥤 Whey Protein Isolate</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: "1.4" }}>
                  Whey Isolate has zero lactose, fats, or carbs. Taking 1.5 scoops immediately post-workout is excellent for blunting systemic muscle breakdown and locking in nitrogen balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUPPLEMENTS CALENDAR */}
      {activeTab === "supplements" && (
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>Daily Supplement Strategy Calendar</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0" }}>Chronobiological timing stack to lower cortisol, build muscle, and optimize sleep recovery.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="sheet-table-mock" style={{ minWidth: "100%", width: "100%" }}>
              <thead>
                <tr>
                  <th>Supplement Name</th>
                  <th>Recommended Dose</th>
                  <th>Best Time</th>
                  <th>Metabolic / Hypertrophy Mechanism</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td><b>Vitamin D3</b></td>
                  <td>5000 IU</td>
                  <td>With breakfast (Morning)</td>
                  <td>Supports cellular insulin sensitivity, natural testosterone, and immune recovery. Fat soluble.</td>
                </tr>
                <tr>
                  <td><b>Omega-3 Fish / Algae Oil</b></td>
                  <td>2000 mg (High EPA/DHA)</td>
                  <td>With breakfast (Morning)</td>
                  <td>Combats system-wide vascular inflammation, lowers triglycerides, and improves cell membrane plasticity.</td>
                </tr>
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td><b>Whey Protein Isolate</b></td>
                  <td>1.5 Scoops (35g protein)</td>
                  <td>Immediately Post-Workout</td>
                  <td>Fast-digesting amino acids to spike protein synthesis and limit post-workout catabolic states.</td>
                </tr>
                <tr>
                  <td><b>Ashwagandha (KSM-66)</b></td>
                  <td>600 mg</td>
                  <td> Bedtime (Night)</td>
                  <td>Powerful adaptogen proven to lower cortisol. Prevents high morning fasting blood sugar spikes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
