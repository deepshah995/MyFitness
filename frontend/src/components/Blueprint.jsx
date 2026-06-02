import React, { useState, useRef } from "react";

/* ─────────────────────────── PROFILE ─────────────────────────── */
const PROFILE = {
  weight: 75.5, height: 173, age: 31, bmi: (75.5 / (1.73 * 1.73)).toFixed(1),
  calories: 2150, protein: 145, carbs: 180, fat: 65,
};

/* ────────────────────────── WEEK DATA ───────────────────────── */
const WEEK = [
  {
    day: "Mon", label: "Monday", theme: "arms", emoji: "💪",
    badge: "Arms Blast", badgeColor: "#a5b4fc",
    summary: "Dedicated arm hypertrophy + glucose clearance",
    schedule: [
      {
        time: "07:30", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Morning Stack",
        items: [
          { name: "Vitamin D3", dose: "5000 IU", note: "Take with food · insulin sensitivity" },
          { name: "Omega-3 (EPA/DHA)", dose: "2000 mg", note: "Anti-inflammatory · heart health" },
          { name: "Water", dose: "500 ml", note: "Rehydrate immediately on waking" },
        ],
      },
      {
        time: "08:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "High-Protein Breakfast",
        macros: { cal: 480, protein: 42, carbs: 28, fat: 18 },
        items: [
          { name: "Egg White Omelette", dose: "6 whites + 1 whole", note: "~38g protein · zero fat base" },
          { name: "Sautéed Spinach", dose: "100g", note: "Fiber-first · low GI" },
          { name: "Greek Yogurt", dose: "150g full-fat", note: "Casein protein + probiotics" },
          { name: "Berries", dose: "80g mixed", note: "Low-GI antioxidants" },
        ],
      },
      {
        time: "13:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Pre-Workout Fuel",
        macros: { cal: 560, protein: 38, carbs: 55, fat: 16 },
        items: [
          { name: "Paneer (grilled)", dose: "150g", note: "Casein source · slow-digesting" },
          { name: "Quinoa", dose: "80g dry weight", note: "Complete amino acid profile" },
          { name: "Broccoli + Bell Peppers", dose: "200g mix", note: "Fiber-first · eat these first" },
          { name: "Olive Oil", dose: "1 tbsp", note: "Healthy fat · slow gastric emptying" },
        ],
      },
      {
        time: "17:30", phase: "Workout", icon: "💪", type: "workout",
        title: "Arm Hypertrophy Session (60 min)",
        exercises: [
          { name: "DB Bicep Curl (Supinated)", sets: "4 × 8–10", rest: "60s", cue: "3s eccentric, squeeze at peak" },
          { name: "Overhead Triceps Extension", sets: "4 × 8–10", rest: "60s", cue: "Full long-head stretch, elbows tucked" },
          { name: "Hammer Curl (Neutral)", sets: "3 × 10–12", rest: "60s", cue: "Brachioradialis blast, no swing" },
          { name: "Cable Triceps Pushdown", sets: "3 × 12–15", rest: "60s", cue: "Pronate at lockout, flare ropes" },
          { name: "Reverse Grip Barbell Curl", sets: "3 × 12", rest: "60s", cue: "Brachialis focus, wrist stable" },
          { name: "Close-Grip Push-Ups", sets: "3 × failure", rest: "60s", cue: "Chest proud, pump finisher" },
        ],
      },
      {
        time: "19:00", phase: "Post-Workout", icon: "🥤", type: "supplement",
        title: "Recovery Stack",
        items: [
          { name: "Whey Isolate", dose: "1.5 scoops (35g protein)", note: "Within 30 min of finishing · protein synthesis" },
          { name: "Water", dose: "500 ml", note: "Rehydrate post-sweat" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍚", type: "meal",
        title: "Glycemic Recovery Dinner",
        macros: { cal: 550, protein: 40, carbs: 55, fat: 14 },
        items: [
          { name: "Brown Rice", dose: "80g dry", note: "Complex carbs for glycogen refill" },
          { name: "Lentils (Dal)", dose: "150g cooked", note: "High fiber · protein + carb combo" },
          { name: "Steamed Broccoli", dose: "150g", note: "Glucose clearance veggie" },
          { name: "Cottage Cheese", dose: "100g", note: "Casein bedtime protein" },
        ],
      },
      {
        time: "20:00", phase: "Walk", icon: "🚶", type: "cardio",
        title: "Post-Meal Walk (15 min)",
        items: [{ name: "Brisk outdoor walk", dose: "15 min", note: "Non-insulin glucose clearance · reduces post-meal spike" }],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Sleep & Recovery Stack",
        items: [
          { name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Cortisol suppressor · prevents liver glucose dump overnight" },
        ],
      },
    ],
  },
  {
    day: "Tue", label: "Tuesday", theme: "run", emoji: "🏃",
    badge: "Zone 2 Run", badgeColor: "#67e8f9",
    summary: "Aerobic base + insulin sensitivity",
    schedule: [
      {
        time: "07:00", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Morning Hydration",
        items: [
          { name: "Water + Electrolytes", dose: "500 ml", note: "Pre-run hydration essential" },
          { name: "Omega-3", dose: "2000 mg", note: "Anti-inflammatory for joints" },
        ],
      },
      {
        time: "07:30", phase: "Run", icon: "🏃", type: "workout",
        title: "Zone 2 Aerobic Run (35 min)",
        exercises: [
          { name: "Warm-up walk", sets: "5 min", rest: "—", cue: "Raise HR gradually" },
          { name: "Zone 2 Base Run", sets: "5.2 km", rest: "—", cue: "HR 130–138 bpm · nasal breathing only" },
          { name: "Cool-down walk", sets: "5 min", rest: "—", cue: "HR below 110 before stopping" },
          { name: "Calf + ankle mobility", sets: "10 min", rest: "—", cue: "Protect ankles, foam roll if available" },
        ],
      },
      {
        time: "09:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "Post-Run Protein Feast",
        macros: { cal: 520, protein: 45, carbs: 38, fat: 14 },
        items: [
          { name: "Greek Yogurt", dose: "200g", note: "Fast-digesting whey fraction" },
          { name: "Berries", dose: "100g", note: "Low-GI carb replenishment" },
          { name: "Boiled Eggs", dose: "2 whole", note: "Fat + protein satiety" },
          { name: "Vitamin D3", dose: "5000 IU", note: "Take with fat-containing meal" },
        ],
      },
      {
        time: "13:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Eggetarian Core Lunch",
        macros: { cal: 490, protein: 36, carbs: 42, fat: 14 },
        items: [
          { name: "Egg Salad Wrap", dose: "2 eggs + low-carb tortilla", note: "Portable · balanced macros" },
          { name: "Cucumber + Tomato", dose: "150g", note: "Fiber-first, eat before wrap" },
          { name: "Hummus", dose: "3 tbsp", note: "Healthy fat + plant protein" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🥡", type: "meal",
        title: "Light Glycemic Dinner",
        macros: { cal: 440, protein: 34, carbs: 32, fat: 14 },
        items: [
          { name: "Tofu Stir-Fry", dose: "200g tofu", note: "Complete amino acids · soy protein" },
          { name: "Mixed Vegetables", dose: "250g (bell peppers, mushrooms, asparagus)", note: "High-fiber · glucose sink" },
          { name: "Cauliflower Rice", dose: "150g", note: "Low-GI carb substitute" },
        ],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Cortisol Shield",
        items: [
          { name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Reduces morning liver glucose dump" },
        ],
      },
    ],
  },
  {
    day: "Wed", label: "Wednesday", theme: "legs", emoji: "🦵",
    badge: "Legs + Core", badgeColor: "#34d399",
    summary: "Largest caloric engine · glucose clearance",
    schedule: [
      {
        time: "07:30", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Morning Stack",
        items: [
          { name: "Vitamin D3", dose: "5000 IU", note: "With breakfast" },
          { name: "Omega-3", dose: "2000 mg", note: "Joint protection for leg day" },
          { name: "Water", dose: "500 ml", note: "Start hydrated" },
        ],
      },
      {
        time: "08:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "Pre-Leg Day Fuel",
        macros: { cal: 520, protein: 40, carbs: 48, fat: 14 },
        items: [
          { name: "Quinoa Salad Bowl", dose: "100g dry quinoa", note: "Complete amino profile + complex carbs" },
          { name: "Edamame", dose: "100g", note: "Plant protein + fiber" },
          { name: "Paneer Cubes", dose: "100g", note: "Casein protein for sustained fuel" },
          { name: "Leafy Greens", dose: "large handful", note: "Fiber-first — eat these first" },
        ],
      },
      {
        time: "17:30", phase: "Workout", icon: "🦵", type: "workout",
        title: "Legs & Glycemic Clearance (60 min)",
        exercises: [
          { name: "Goblet Squat (Heavy DB/KB)", sets: "4 × 8–10", rest: "90s", cue: "Full depth, posterior load · protect lower back" },
          { name: "Dumbbell Romanian Deadlift", sets: "4 × 10–12", rest: "90s", cue: "Hinge hips back, loaded hamstring stretch" },
          { name: "Bulgarian Split Squat", sets: "3 × 8–10 / leg", rest: "60s", cue: "Control knee tracking, drop vertically" },
          { name: "Single-Leg Calf Raise", sets: "3 × 12–15", rest: "45s", cue: "2s hold at top, slow eccentric" },
          { name: "Plank → Side-Plank Flow", sets: "3 × 45–60s", rest: "45s", cue: "Glutes squeezed, hips elevated continuously" },
          { name: "Deadbug Core Flow", sets: "3 × 10 / side", rest: "45s", cue: "Lower back glued to floor, breathe deep" },
        ],
      },
      {
        time: "19:00", phase: "Post-Workout", icon: "🥤", type: "supplement",
        title: "Recovery Shake",
        items: [
          { name: "Whey Isolate", dose: "1.5 scoops", note: "35g protein · limit catabolism" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍳", type: "meal",
        title: "Protein Rebuilding Dinner",
        macros: { cal: 510, protein: 42, carbs: 42, fat: 14 },
        items: [
          { name: "Egg White Omelette", dose: "6 whites + mushrooms + onion", note: "High-protein zero carb base" },
          { name: "Baked Sweet Potato", dose: "150g", note: "Complex carbs for post-workout glycogen" },
          { name: "Steamed Green Beans", dose: "150g", note: "Fiber + potassium" },
        ],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Sleep Stack",
        items: [
          { name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Cortisol reduction + growth hormone support" },
        ],
      },
    ],
  },
  {
    day: "Thu", label: "Thursday", theme: "rest", emoji: "♻️",
    badge: "Active Recovery", badgeColor: "#fbbf24",
    summary: "Insulin reset · zero high-intensity",
    schedule: [
      {
        time: "07:30", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Morning Gentle Stack",
        items: [
          { name: "Vitamin D3", dose: "5000 IU", note: "Consistency every day" },
          { name: "Omega-3", dose: "2000 mg", note: "Continued anti-inflammatory protocol" },
          { name: "Water", dose: "500 ml", note: "Hydrate slowly" },
        ],
      },
      {
        time: "08:30", phase: "Mobility", icon: "🧘", type: "workout",
        title: "Active Stretching Flow (20 min)",
        exercises: [
          { name: "Shoulder CARs (controlled articular rotations)", sets: "2 × 8 / arm", rest: "—", cue: "Full range, slow and deliberate" },
          { name: "Hip 90/90 Stretch", sets: "3 min / side", rest: "—", cue: "Sit upright, don't lean" },
          { name: "Ankle Circles + Calf Stretch", sets: "2 min / side", rest: "—", cue: "Protect knees on running days" },
          { name: "Dead Hang", sets: "3 × 30s", rest: "60s", cue: "Decompress spine, shoulder health" },
        ],
      },
      {
        time: "12:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Metabolic Lunch",
        macros: { cal: 480, protein: 38, carbs: 40, fat: 14 },
        items: [
          { name: "Mixed Vegetable Curry + Paneer", dose: "200g paneer", note: "High protein eggetarian base" },
          { name: "Lentil Soup (Dal)", dose: "250ml", note: "Fiber + protein combo" },
          { name: "Broccoli (steamed)", dose: "150g", note: "Eat this before the dal and rice" },
        ],
      },
      {
        time: "15:30", phase: "NEAT Walk", icon: "🚶", type: "cardio",
        title: "Outdoor NEAT Walk (30 min)",
        items: [
          { name: "Brisk outdoor walk", dose: "30 min", note: "No phone · 10,000 step baseline · zone 1 HR" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍽", type: "meal",
        title: "Protein-First Dinner",
        macros: { cal: 430, protein: 36, carbs: 26, fat: 16 },
        items: [
          { name: "Pan-Seared Tempeh Steak", dose: "200g", note: "Complete amino acids + isoflavones" },
          { name: "Asparagus (grilled)", dose: "150g", note: "Diuretic + blood sugar regulation" },
          { name: "Mixed Green Salad", dose: "large bowl", note: "Zero carb, high fiber satiety" },
        ],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Bedtime Cortisol Checklist",
        items: [
          { name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Cortisol suppression + insulin sensitivity overnight" },
          { name: "Zero blue light", dose: "30 min before bed", note: "Screen-off protocol" },
        ],
      },
    ],
  },
  {
    day: "Fri", label: "Friday", theme: "upper", emoji: "🏋️",
    badge: "Upper Body", badgeColor: "#f472b6",
    summary: "Compound press/pull + arm pump finisher",
    schedule: [
      {
        time: "07:30", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Morning Stack",
        items: [
          { name: "Vitamin D3", dose: "5000 IU", note: "Daily non-negotiable" },
          { name: "Omega-3", dose: "2000 mg", note: "Pre-workout anti-inflammatory" },
          { name: "Water", dose: "500 ml", note: "Morning rehydration" },
        ],
      },
      {
        time: "08:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "Eggetarian Fuel",
        macros: { cal: 490, protein: 40, carbs: 34, fat: 16 },
        items: [
          { name: "Chickpea Salad Bowl", dose: "100g chickpeas", note: "High fiber + plant protein" },
          { name: "Diced Cucumber + Tomato", dose: "150g", note: "Fiber-first — eat these first" },
          { name: "2 Boiled Eggs", dose: "whole eggs", note: "Complete amino acids + choline" },
        ],
      },
      {
        time: "13:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Pre-Workout Lunch",
        macros: { cal: 530, protein: 38, carbs: 50, fat: 14 },
        items: [
          { name: "Tofu + Quinoa Bowl", dose: "150g tofu, 80g quinoa", note: "Complete protein + complex carbs" },
          { name: "Steamed Broccoli + Spinach", dose: "200g", note: "Fiber first → carbs last" },
          { name: "Olive Oil drizzle", dose: "1 tbsp", note: "Slows gastric emptying" },
        ],
      },
      {
        time: "17:30", phase: "Workout", icon: "🏋️", type: "workout",
        title: "Upper Compound + Arm Pump Finisher (60 min)",
        exercises: [
          { name: "Dumbbell Overhead Press", sets: "3 × 8–10", rest: "90s", cue: "Braced core, complete vertical lockout" },
          { name: "Chest-Supported DB Row", sets: "3 × 10–12", rest: "90s", cue: "Retract scapula first, pull elbow to hip" },
          { name: "Incline DB Chest Press", sets: "3 × 10–12", rest: "90s", cue: "30° incline, stretch chest fibers" },
          { name: "Kettlebell Swings", sets: "3 × 15–20", rest: "60s", cue: "Hip hinge drive, explosive glute snap" },
          { name: "Renegade Rows", sets: "3 × 8 / side", rest: "60s", cue: "Plank base, no hip rotation" },
          { name: "Incline Curl / Kickback Superset", sets: "3 × 15 each", rest: "45s", cue: "Arm pump finisher · no rest between" },
        ],
      },
      {
        time: "19:00", phase: "Post-Workout", icon: "🥤", type: "supplement",
        title: "Recovery Shake",
        items: [
          { name: "Whey Isolate", dose: "1.5 scoops (35g)", note: "Immediate anabolic window" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍽", type: "meal",
        title: "Post-Workout Protein Dinner",
        macros: { cal: 520, protein: 44, carbs: 48, fat: 14 },
        items: [
          { name: "Lentil Pasta", dose: "80g dry", note: "High protein pasta + complex carbs" },
          { name: "Sugar-Free Marinara + Tofu", dose: "100g tofu crumbles", note: "Savory protein topping" },
          { name: "Side Caesar Salad (no croutons)", dose: "large bowl", note: "Fiber + healthy fat from dressing" },
        ],
      },
      {
        time: "20:00", phase: "Walk", icon: "🚶", type: "cardio",
        title: "Post-Dinner Walk (15 min)",
        items: [{ name: "Brisk walk", dose: "15 min", note: "Friday glucose clearance ritual" }],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Sleep Stack",
        items: [{ name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Pre-weekend cortisol buffer" }],
      },
    ],
  },
  {
    day: "Sat", label: "Saturday", theme: "longrun", emoji: "🏃",
    badge: "Long Run", badgeColor: "#22d3ee",
    summary: "10K endurance base · 15,000 steps target",
    schedule: [
      {
        time: "07:00", phase: "Pre-Run", icon: "🌅", type: "supplement",
        title: "Pre-Run Hydration",
        items: [
          { name: "Water + Electrolytes", dose: "500 ml", note: "Pre-run — 30 min before starting" },
          { name: "Omega-3", dose: "2000 mg", note: "Anti-inflammatory for long run joints" },
        ],
      },
      {
        time: "07:30", phase: "Long Run", icon: "🏃", type: "workout",
        title: "Long Run (6.5 km Zone 2)",
        exercises: [
          { name: "Easy warm-up walk", sets: "5 min", rest: "—", cue: "Ease into Zone 1 first" },
          { name: "Zone 2 Long Run", sets: "6.5 km", rest: "—", cue: "HR 130–138 bpm · maintain nasal breathing · continuous stride" },
          { name: "Cool-down jog → walk", sets: "10 min", rest: "—", cue: "Bring HR below 100 before stopping" },
          { name: "Post-run calf mobility", sets: "10 min", rest: "—", cue: "Foam roll + ankle circles" },
        ],
      },
      {
        time: "09:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "Post-Run Protein Feast",
        macros: { cal: 560, protein: 48, carbs: 42, fat: 16 },
        items: [
          { name: "Whey Protein Shake", dose: "1.5 scoops + almond milk", note: "Immediate post-run protein" },
          { name: "Peanut Butter", dose: "2 tbsp", note: "Healthy fats + protein" },
          { name: "Scrambled Eggs", dose: "3 whole eggs", note: "Complete amino acids + choline" },
          { name: "Vitamin D3", dose: "5000 IU", note: "With fat-containing breakfast" },
        ],
      },
      {
        time: "13:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Endurance Recovery Lunch",
        macros: { cal: 520, protein: 36, carbs: 52, fat: 16 },
        items: [
          { name: "Lentil Soup", dose: "300ml", note: "Fiber + plant protein" },
          { name: "Quinoa", dose: "80g dry", note: "Complete amino profile" },
          { name: "Avocado + Greens Bowl", dose: "half avocado + greens", note: "Healthy fats + anti-inflammatory" },
          { name: "Olive oil dressing", dose: "1 tbsp", note: "Monounsaturated fats" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍽", type: "meal",
        title: "Glycemic Stability Dinner",
        macros: { cal: 440, protein: 34, carbs: 30, fat: 16 },
        items: [
          { name: "Paneer Skewers (grilled)", dose: "150g", note: "Low-GI protein, zero carb" },
          { name: "Grilled Peppers", dose: "150g mixed", note: "Vitamin C + fiber" },
          { name: "Steamed Green Beans", dose: "150g", note: "Potassium + magnesium" },
        ],
      },
      {
        time: "22:00", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Post-Run Recovery",
        items: [{ name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "Reduces exercise cortisol spike" }],
      },
    ],
  },
  {
    day: "Sun", label: "Sunday", theme: "rest", emoji: "😴",
    badge: "Full Rest", badgeColor: "#a78bfa",
    summary: "Decompression, meal prep & sleep remission",
    schedule: [
      {
        time: "09:00", phase: "Wake Up", icon: "🌅", type: "supplement",
        title: "Slow Morning Hydration",
        items: [
          { name: "Water", dose: "500 ml", note: "Slow morning · no rush" },
          { name: "Vitamin D3 + Omega-3", dose: "Full stack", note: "Never skip supplements" },
        ],
      },
      {
        time: "10:00", phase: "Breakfast", icon: "🍳", type: "meal",
        title: "Lazy Sunday Protein",
        macros: { cal: 490, protein: 38, carbs: 34, fat: 18 },
        items: [
          { name: "Veggie Omelette", dose: "3 whole eggs + 3 whites", note: "Mixed protein" },
          { name: "Avocado Toast (whole grain)", dose: "1 slice + half avo", note: "Healthy fats, moderate carbs" },
          { name: "Berries + Greek Yogurt", dose: "100g + 150g", note: "Antioxidants + probiotics" },
        ],
      },
      {
        time: "13:00", phase: "Lunch", icon: "🥗", type: "meal",
        title: "Sunday Nutrition",
        macros: { cal: 480, protein: 34, carbs: 38, fat: 16 },
        items: [
          { name: "Heavy Vegetable Soup", dose: "large bowl", note: "High-fiber decompression meal" },
          { name: "Cottage Cheese Cubes", dose: "150g", note: "Casein protein + probiotics" },
          { name: "Mixed Seeds", dose: "2 tbsp (sunflower, pumpkin)", note: "Zinc + magnesium + healthy fat" },
        ],
      },
      {
        time: "16:00", phase: "Meal Prep", icon: "🥡", type: "cardio",
        title: "Weekly Meal Prep (60–90 min)",
        items: [
          { name: "Prep egg whites, paneer, tofu", dose: "Week supply", note: "Prevents mid-week dietary slips" },
          { name: "Wash + chop broccoli, greens", dose: "Week supply", note: "Reduces friction for healthy meals" },
          { name: "Cook brown rice in batches", dose: "500g dry", note: "Ready for Mon–Wed" },
        ],
      },
      {
        time: "19:30", phase: "Dinner", icon: "🍽", type: "meal",
        title: "Light Sunday Dinner",
        macros: { cal: 420, protein: 32, carbs: 28, fat: 14 },
        items: [
          { name: "Tofu + Stir-Fried Vegetables", dose: "200g tofu", note: "Light · easy digestion for sleep" },
          { name: "Cauliflower Rice", dose: "150g", note: "Low-GI carb substitute" },
        ],
      },
      {
        time: "21:30", phase: "Bedtime", icon: "🌙", type: "supplement",
        title: "Sleep Remission Protocol",
        items: [
          { name: "Ashwagandha (KSM-66)", dose: "600 mg", note: "8.5 hours sleep target · fasting glucose reset starts now" },
          { name: "Screen-off protocol", dose: "No screens after 9:30 PM", note: "Blue light suppresses melatonin" },
        ],
      },
    ],
  },
];

/* ─────────────────── THEME COLORS MAP ──────────────────── */
const TYPE_COLOR = {
  meal: { bg: "rgba(52, 211, 153, 0.1)", border: "#34d399", icon: "#34d399" },
  supplement: { bg: "rgba(167, 139, 250, 0.1)", border: "#a78bfa", icon: "#a78bfa" },
  workout: { bg: "rgba(244, 114, 182, 0.1)", border: "#f472b6", icon: "#f472b6" },
  cardio: { bg: "rgba(34, 211, 238, 0.1)", border: "#22d3ee", icon: "#22d3ee" },
};
const THEME_COLOR = {
  arms: "#a5b4fc", run: "#67e8f9", legs: "#34d399",
  rest: "#fbbf24", upper: "#f472b6", longrun: "#22d3ee",
};

/* ──────────────────── COMPONENT ──────────────────────── */
export default function Blueprint() {
  const [view, setView] = useState("week");   // "week" | "day"
  const [selectedDay, setSelectedDay] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const calendarRef = useRef(null);
  const touchStartX = useRef(null);

  const day = WEEK[selectedDay];

  function openDay(idx) { setSelectedDay(idx); setView("day"); setExpandedBlocks({}); }
  function goNext() { setSelectedDay(d => Math.min(d + 1, 6)); }
  function goPrev() { setSelectedDay(d => Math.max(d - 1, 0)); }
  function toggleBlock(i) { setExpandedBlocks(b => ({ ...b, [i]: !b[i] })); }

  // Touch/swipe support for day panning
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) goNext();
    else if (dx > 50) goPrev();
    touchStartX.current = null;
  }

  return (
    <div className="blueprint-container">
      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="title" style={{ margin: 0 }}>Metabolic Recomposition Blueprint</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            16-Week · Arm Hypertrophy + 10K + Insulin Remission · {PROFILE.weight} kg / {PROFILE.height} cm · BMI {PROFILE.bmi}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setView("week")}
            style={{
              padding: "8px 16px", fontSize: "0.82rem", borderRadius: "999px",
              background: view === "week" ? "linear-gradient(135deg,#4f46e5,#0891b2)" : "rgba(255,255,255,0.05)",
              color: "#fff", boxShadow: view === "week" ? "0 4px 14px rgba(79,70,229,0.4)" : "none",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            📅 Weekly View
          </button>
          <button
            type="button"
            onClick={() => setView("day")}
            style={{
              padding: "8px 16px", fontSize: "0.82rem", borderRadius: "999px",
              background: view === "day" ? "linear-gradient(135deg,#4f46e5,#0891b2)" : "rgba(255,255,255,0.05)",
              color: "#fff", boxShadow: view === "day" ? "0 4px 14px rgba(79,70,229,0.4)" : "none",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            🕐 Daily View
          </button>
        </div>
      </div>

      {/* ─── MACRO STRIP ─── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Daily Calories", val: `${PROFILE.calories} kcal`, color: "#a5b4fc" },
          { label: "Protein Target", val: `${PROFILE.protein}g`, color: "#34d399" },
          { label: "Carbs Max", val: `${PROFILE.carbs}g`, color: "#fbbf24" },
          { label: "Fat Target", val: `${PROFILE.fat}g`, color: "#f472b6" },
          { label: "Body Weight", val: `${PROFILE.weight} kg`, color: "#22d3ee" },
          { label: "BMI", val: PROFILE.bmi, color: "#a78bfa" },
        ].map(m => (
          <div key={m.label} style={{
            flex: "1 1 140px", background: "rgba(255,255,255,0.025)", border: `1px solid ${m.color}30`,
            borderTop: `3px solid ${m.color}`, borderRadius: "12px", padding: "12px 14px",
          }}>
            <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: m.color, marginTop: "4px" }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════ WEEKLY VIEW ═══════════════ */}
      {view === "week" && (
        <div ref={calendarRef} style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Weekly grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}>
            {WEEK.map((d, idx) => {
              const workoutBlock = d.schedule.find(s => s.type === "workout");
              const mealCount = d.schedule.filter(s => s.type === "meal").length;
              const themeColor = THEME_COLOR[d.theme] || "#a5b4fc";
              return (
                <div
                  key={d.day}
                  onClick={() => openDay(idx)}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${themeColor}30`,
                    borderTop: `4px solid ${themeColor}`,
                    borderRadius: "16px", padding: "14px 10px",
                    cursor: "pointer", transition: "all 0.2s",
                    minWidth: "120px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${themeColor}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Day header */}
                  <div style={{ fontSize: "1.6rem", marginBottom: "4px" }}>{d.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: themeColor }}>{d.day}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "10px" }}>{d.label}</div>

                  {/* Badge */}
                  <div style={{
                    display: "inline-block", padding: "3px 8px", borderRadius: "999px",
                    fontSize: "0.65rem", fontWeight: 700, background: `${themeColor}20`, color: themeColor,
                    marginBottom: "10px", letterSpacing: "0.04em",
                  }}>{d.badge}</div>

                  {/* Mini schedule */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {workoutBlock && (
                      <div style={{ fontSize: "0.7rem", color: "#f472b6", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>💪</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{workoutBlock.title}</span>
                      </div>
                    )}
                    <div style={{ fontSize: "0.7rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>🍽</span><span>{mealCount} meals planned</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#a78bfa", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>💊</span><span>Supplements</span>
                    </div>
                  </div>

                  {/* Open button */}
                  <div style={{
                    marginTop: "12px", textAlign: "center", fontSize: "0.72rem",
                    color: themeColor, fontWeight: 700, opacity: 0.8,
                  }}>
                    View Day →
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly overview legend */}
          <div style={{
            marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}>
            {[
              { label: "Workout Days", count: "3", desc: "Mon (Arms) · Wed (Legs) · Fri (Upper)", color: "#f472b6" },
              { label: "Run Days", count: "2", desc: "Tue (Zone 2 Base) · Sat (Long Run)", color: "#22d3ee" },
              { label: "Recovery Days", count: "2", desc: "Thu (Active Recovery) · Sun (Full Rest)", color: "#fbbf24" },
              { label: "Weekly Volume", count: "~22 km", desc: "Running + 3 strength sessions", color: "#a5b4fc" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}25`,
                borderLeft: `3px solid ${s.color}`, borderRadius: "10px", padding: "12px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.count}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)" }}>{s.label}</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ DAILY VIEW ═══════════════ */}
      {view === "day" && (
        <div
          style={{ animation: "fadeIn 0.3s ease" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Day navigator */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "20px", flexWrap: "wrap",
          }}>
            <button type="button" onClick={goPrev} disabled={selectedDay === 0}
              style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "0.85rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "none" }}>
              ← Prev
            </button>

            <div style={{ display: "flex", gap: "6px", flex: 1, overflowX: "auto", paddingBottom: "4px" }}>
              {WEEK.map((d, idx) => {
                const tc = THEME_COLOR[d.theme] || "#a5b4fc";
                return (
                  <button key={d.day} type="button" onClick={() => openDay(idx)}
                    style={{
                      padding: "6px 12px", borderRadius: "999px", fontSize: "0.78rem", whiteSpace: "nowrap",
                      background: selectedDay === idx ? `linear-gradient(135deg,${tc}cc,${tc}66)` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${tc}40`, color: selectedDay === idx ? "#fff" : tc,
                      fontWeight: 700, boxShadow: selectedDay === idx ? `0 4px 14px ${tc}40` : "none",
                      flexShrink: 0,
                    }}
                  >
                    {d.emoji} {d.day}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={goNext} disabled={selectedDay === 6}
              style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "0.85rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "none" }}>
              Next →
            </button>
          </div>

          {/* Day header card */}
          <div style={{
            background: `linear-gradient(135deg, ${THEME_COLOR[day.theme]}15, rgba(0,0,0,0.2))`,
            border: `1px solid ${THEME_COLOR[day.theme]}30`,
            borderLeft: `4px solid ${THEME_COLOR[day.theme]}`,
            borderRadius: "16px", padding: "18px 20px",
            marginBottom: "20px", display: "flex",
            alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
          }}>
            <div>
              <div style={{ fontSize: "2rem", marginBottom: "4px" }}>{day.emoji}</div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: THEME_COLOR[day.theme] }}>{day.label}</h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{day.summary}</p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { icon: "🍽", label: `${day.schedule.filter(s => s.type === "meal").length} Meals` },
                { icon: "💊", label: `${day.schedule.filter(s => s.type === "supplement").length} Supplement blocks` },
                { icon: "💪", label: `${day.schedule.filter(s => s.type === "workout").length} Workout` },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px", padding: "8px 12px", fontSize: "0.78rem", color: "var(--text)",
                }}>
                  {s.icon} {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: "20px" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: "6px", top: 0, bottom: 0,
              width: "2px", background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {day.schedule.map((block, bIdx) => {
                const tc = TYPE_COLOR[block.type] || TYPE_COLOR.meal;
                const isExpanded = !!expandedBlocks[bIdx];
                return (
                  <div key={bIdx} style={{ position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: "absolute", left: "-22px", top: "18px",
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: tc.icon, border: "2px solid var(--bg)",
                      boxShadow: `0 0 8px ${tc.icon}80`,
                    }} />

                    <div
                      onClick={() => toggleBlock(bIdx)}
                      style={{
                        background: tc.bg, border: `1px solid ${tc.border}40`,
                        borderRadius: "14px", padding: "14px 16px",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = tc.border; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${tc.border}40`; }}
                    >
                      {/* Block header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{block.icon}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.72rem", color: tc.icon, fontWeight: 700, background: `${tc.icon}15`, padding: "2px 8px", borderRadius: "999px" }}>
                                {block.time} · {block.phase}
                              </span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text)", marginTop: "2px" }}>{block.title}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)", flexShrink: 0 }}>
                          {isExpanded ? "▲" : "▼"}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ marginTop: "14px", borderTop: `1px solid ${tc.border}30`, paddingTop: "12px" }}>
                          {/* Macros */}
                          {block.macros && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                              {[
                                { k: "cal", label: "Calories", unit: "kcal", color: "#a5b4fc" },
                                { k: "protein", label: "Protein", unit: "g", color: "#34d399" },
                                { k: "carbs", label: "Carbs", unit: "g", color: "#fbbf24" },
                                { k: "fat", label: "Fat", unit: "g", color: "#f472b6" },
                              ].map(m => (
                                <div key={m.k} style={{
                                  flex: "1 1 80px", background: "rgba(0,0,0,0.2)", borderRadius: "8px",
                                  padding: "6px 10px", border: `1px solid ${m.color}25`,
                                }}>
                                  <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>{m.label}</div>
                                  <div style={{ fontSize: "1rem", fontWeight: 800, color: m.color }}>{block.macros[m.k]}<span style={{ fontSize: "0.65rem" }}> {m.unit}</span></div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Exercises */}
                          {block.exercises && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {block.exercises.map((ex, ei) => (
                                <div key={ei} style={{
                                  display: "grid", gridTemplateColumns: "1fr auto",
                                  gap: "8px", background: "rgba(0,0,0,0.2)",
                                  borderRadius: "10px", padding: "10px 12px",
                                  borderLeft: `3px solid ${tc.icon}`,
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>{ex.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>💡 {ex.cue}</div>
                                  </div>
                                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: tc.icon }}>{ex.sets}</div>
                                    {ex.rest !== "—" && <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>rest {ex.rest}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Supplement/Meal items */}
                          {block.items && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {block.items.map((item, ii) => (
                                <div key={ii} style={{
                                  display: "flex", alignItems: "flex-start", gap: "10px",
                                  background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px 12px",
                                }}>
                                  <div style={{
                                    width: "8px", height: "8px", borderRadius: "50%",
                                    background: tc.icon, flexShrink: 0, marginTop: "5px",
                                  }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>
                                      {item.name}
                                      <span style={{ fontWeight: 400, color: tc.icon, marginLeft: "8px", fontSize: "0.8rem" }}>{item.dose}</span>
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>↳ {item.note}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swipe hint on mobile */}
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.72rem", color: "var(--muted)", opacity: 0.6 }}>
            ← Swipe or use arrows to navigate days →
          </div>
        </div>
      )}
    </div>
  );
}
