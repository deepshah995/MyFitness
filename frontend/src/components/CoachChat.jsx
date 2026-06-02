import React, { useState, useEffect } from "react";
import { apiFetch } from "../api.js";

const modes = [
  { id: "general", label: "General Coach" },
  { id: "training", label: "Training Coach" },
  { id: "diet", label: "Nutritionist Coach" },
  { id: "supplements", label: "Supplements Coach" },
  { id: "journal", label: "Bio-log Coach" },
];

const suggestions = [
  "Adjust my weekly training for arm hypertrophy",
  "Create a 7-day low-GI eggetarian meal plan and save it",
  "How should I fuel before tomorrow's run?",
];

export default function CoachChat({ preloadedPrompt, clearPreloadedPrompt, sheetsConnected }) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("general");
  const [applyUpdates, setApplyUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const userMsg = text.trim();
    if (!userMsg) return;

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
              ? `\n\n✓ Persisted ${data.applied_writes} structural database update(s) to Google Sheets`
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

  // Preloaded Prompt listener for cross-tab routing
  useEffect(() => {
    if (preloadedPrompt) {
      sendMessage(preloadedPrompt);
      clearPreloadedPrompt();
    }
  }, [preloadedPrompt]);

  async function onSend(e) {
    e.preventDefault();
    if (loading) return;
    await sendMessage(question);
  }

  return (
    <div className="chat-window">
      <div>
        <h2 className="panel-title">AI Fitness Coach</h2>
        <p className="panel-subtitle">Ask for training adjustments, diet planning, or health analysis. persiting directly to sheets.</p>
      </div>

      {/* Modernized chat selector controls */}
      <div className="chat-controls">
        <div className="chat-controls-left">
          <label className="chat-select-wrapper">
            <span>Focus Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={applyUpdates}
              disabled={!sheetsConnected}
              onChange={(e) => setApplyUpdates(e.target.checked)}
            />
            <span>
              {sheetsConnected 
                ? "Auto-persist changes to Google Sheets" 
                : "Sheets disconnected (Read-only coaching)"
              }
            </span>
          </label>
        </div>
      </div>

      {/* Chat History bubble block */}
      <div className="chat-history">
        {messages.length === 0 && !loading ? (
          <div className="chat-welcome">
            <strong>Welcome to your AI Gym & Health Lab</strong>
            <p>Get immediate, scientific routines tailored to your metabolism and sheets logs.</p>
            <div className="chips-row">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  onClick={() => sendMessage(s)}
                >
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}${m.isError ? " error-bubble" : ""}`}
          >
            <span className="chat-bubble-label">{m.role === "user" ? "You" : "Coach"}</span>
            <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
          </div>
        ))}

        {loading ? (
          <div className="chat-bubble assistant">
            <span className="chat-bubble-label">Coach</span>
            <div className="typing-dots" aria-label="Loading">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Form layout */}
      <form onSubmit={onSend} className="chat-form" style={{ marginTop: "10px" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
          placeholder="Ask your coach anything (e.g. 'Optimize my cardio zone 2 goals')..."
        />
        <button disabled={loading || !question.trim()} className="primary" type="submit">
          {loading ? "Analyzing..." : "Send Prompt"}
        </button>
      </form>
      
      {error ? <div className="alert error" style={{ marginTop: "10px" }}>Error: {error}</div> : null}
    </div>
  );
}
