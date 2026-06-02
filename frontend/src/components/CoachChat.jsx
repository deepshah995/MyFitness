import React, { useState } from "react";
import { apiFetch } from "../api.js";

const modes = [
  { id: "general", label: "General" },
  { id: "training", label: "Training" },
  { id: "diet", label: "Diet" },
  { id: "supplements", label: "Supplements" },
  { id: "journal", label: "Journal" },
];

const suggestions = [
  "Adjust my weekly training for arm hypertrophy",
  "Create a 7-day low-GI eggetarian meal plan and save it",
  "How should I fuel before tomorrow's run?",
];

export default function CoachChat() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("general");
  const [applyUpdates, setApplyUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setError("");
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
              ? `\n\n✓ Saved ${data.applied_writes} update(s) to Google Sheets`
              : ""),
        },
      ]);
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${msg}`, isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  async function onSend(e) {
    e.preventDefault();
    await sendMessage(question);
  }

  return (
    <div>
      <h2 className="title">AI Coach</h2>
      <p className="muted">Ask for plan updates, meal tweaks, or training adjustments. Toggle Sheets sync to persist changes.</p>
      <div className="controls">
        <label className="control">
          <span>Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            {modes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="control inline">
          <input
            type="checkbox"
            checked={applyUpdates}
            onChange={(e) => setApplyUpdates(e.target.checked)}
          />
          <span>Save updates to Google Sheets</span>
        </label>
      </div>

      <form onSubmit={onSend} className="chat-layout">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Ask your coach anything…"
        />
        <button disabled={loading} type="submit">
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="chat-log">
        {messages.length === 0 && !loading ? (
          <div className="empty-chat">
            <strong>Start a coaching session</strong>
            <p>Get personalized training, nutrition, and recovery advice based on your goals.</p>
            <div className="chips">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setQuestion(s);
                    sendMessage(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`bubble ${m.role === "user" ? "user" : "assistant"}${m.isError ? " error-bubble" : ""}`}
          >
            <span className="label">{m.role === "user" ? "You" : "Coach"}</span>
            {m.content}
          </div>
        ))}

        {loading ? (
          <div className="bubble assistant">
            <span className="label">Coach</span>
            <div className="typing" aria-label="Loading">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
