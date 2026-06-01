import React, { useState } from "react";
import { apiFetch } from "../api.js";

const modes = [
  { id: "general", label: "General" },
  { id: "training", label: "Training" },
  { id: "diet", label: "Diet" },
  { id: "supplements", label: "Supplements" },
  { id: "journal", label: "Journal" },
];

export default function CoachChat() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("general");
  const [applyUpdates, setApplyUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  async function onSend(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setError("");
    const userMsg = question.trim();
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setQuestion("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: { question: userMsg, mode, apply_updates: applyUpdates },
      });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply +
            (data.applied_writes
              ? `\n\n[Saved ${data.applied_writes} update(s) to Google Sheets]`
              : ""),
        },
      ]);
    } catch (err) {
      setError(err?.message || String(err));
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err?.message || String(err)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <h2>AI Coach</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label>
          Mode:{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            {modes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={applyUpdates}
            onChange={(e) => setApplyUpdates(e.target.checked)}
          />{" "}
          Apply updates to Sheets
        </label>
      </div>

      <form onSubmit={onSend} style={{ display: "flex", gap: 10 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Ask your coach… e.g., “Adjust my carbs for my next 10K session and save the meal plan.”"
          style={{ width: "100%", resize: "vertical" }}
        />
        <button disabled={loading} type="submit">
          {loading ? "Sending…" : "Send"}
        </button>
      </form>

      {error ? (
        <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 10,
              whiteSpace: "pre-wrap",
              padding: 10,
              borderRadius: 8,
              background: m.role === "user" ? "#f3f4f6" : "#ecfeff",
            }}
          >
            <b>{m.role === "user" ? "You" : "Coach"}:</b> {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}

