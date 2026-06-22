import React, { useState, useEffect, useRef } from "react";
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

export default function CoachChat({ user, preloadedPrompt, clearPreloadedPrompt }) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("general");
  const [applyUpdates, setApplyUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  // Voice States
  const [isListening, setIsListening] = useState(false);
  
  // Multimodal States
  const [uploading, setUploading] = useState(false);

  // Client Selection States for Coach
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(user?.client_id || 1);

  // Load clients if user is a coach
  useEffect(() => {
    if (user && (user.role === "coach" || user.role === "agency")) {
      const coachId = user.coach_id || 1;
      apiFetch(`/api/db/coaches/${coachId}/clients`)
        .then(data => {
          setClients(data);
          if (data && data.length > 0) {
            setSelectedClientId(data[0].id);
          }
        })
        .catch(err => console.error("Failed to load clients in CoachChat", err));
    }
  }, [user]);

  // Handle setting/clearing messages on selectedClientId or mount
  useEffect(() => {
    if (user && (user.role === "coach" || user.role === "agency") && clients.length > 0) {
      const currentClient = clients.find(c => c.id === Number(selectedClientId));
      if (currentClient) {
        setMessages([
          {
            role: "assistant",
            content: `### 🛠️ Client Plan Management: **${currentClient.name}**\n\nYou are chatting as their coach. You can ask me to update their plan parameters directly. For example:\n* *"Set daily calories to 2000 and diet to Vegan for this customer."*\n* *"Change goal to Arm Hypertrophy and target weight to 82 kg."*\n\nAny updates will be parsed and saved straight to the client's profile.`
          }
        ]);
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content: "### ✦ Hello! I am Arti, your AI Coach.\n\nHow can I help you progress towards your training, nutrition, or weight targets today? Speak to me or upload photos of your meals for form checks."
        }
      ]);
    }
  }, [selectedClientId, clients, user]);

  const recognitionRef = useRef(null);

  // Initialize Speech setting on mount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported by your current browser/device. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    recognitionRef.current = recognition;
    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setQuestion(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessages((m) => [...m, { role: "user", content: `📷 Uploading ${file.name} for AI analysis...` }]);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch("/api/multimodal/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            file_base64: base64Data,
            mime_type: file.type,
            client_id: selectedClientId
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `File analysis failed (${res.status})`);
        }

        const data = await res.json();
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      } catch (err) {
        const msg = err?.message || String(err);
        setError(msg);
        setMessages((m) => [...m, { role: "assistant", content: `Upload Error: ${msg}`, isError: true }]);
      } finally {
        setUploading(false);
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read file.");
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
    e.target.value = null; // Clear file input
  }

  async function sendMessage(text) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setError("");
    if (question === userMsg) {
      setQuestion("");
    }
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: { 
          question: userMsg, 
          mode, 
          apply_updates: applyUpdates, 
          client_id: selectedClientId 
        },
      });
      
      const responseContent = data.reply + (data.applied_writes ? `\n\n✓ Saved ${data.applied_writes} update(s) to Database` : "");

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: responseContent,
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
      <h2 className="title">Arti (AI Coach)</h2>
      <p className="muted">Ask for plan updates, meal tweaks, or training adjustments. Talk directly or upload photos of your meals and exercise videos for live critique.</p>
      
      {user && (user.role === "coach" || user.role === "agency") && clients.length > 0 && (
        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          padding: "12px 16px", 
          borderRadius: "12px", 
          border: "1px solid rgba(255,255,255,0.08)", 
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          animation: "fadeIn 0.3s ease"
        }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
            👤 Manage Client Workspace:
          </span>
          <select 
            value={selectedClientId} 
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            style={{ 
              width: "auto", 
              padding: "6px 12px", 
              background: "var(--bg-elevated)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--primary)"
            }}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.goal.split("(")[0].trim()})</option>
            ))}
          </select>
        </div>
      )}
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
          <span>Save updates to Database</span>
        </label>

      </div>

      <form onSubmit={onSend} className="chat-layout" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Ask your coach anything or click talk..."
          style={{ flex: 1 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
          <button disabled={loading || uploading} type="submit" style={{ width: "100%" }}>
            {loading ? "Thinking..." : "Send"}
          </button>
          
          <button 
            type="button" 
            onClick={startSpeechRecognition} 
            className={`secondary ${isListening ? "active" : ""}`}
            style={{ 
              width: "100%", 
              background: isListening ? "#f43f5e" : "rgba(255,255,255,0.06)",
              borderColor: isListening ? "#f43f5e" : "rgba(255,255,255,0.1)",
              color: isListening ? "#fff" : "var(--fg)"
            }}
          >
            {isListening ? "🎙️ Listening..." : "🎙️ Talk to Coach"}
          </button>

          <input 
            type="file" 
            accept="image/*,video/*" 
            onChange={handleFileUpload} 
            id="multimodal-upload" 
            style={{ display: "none" }} 
            disabled={uploading}
          />
          <label 
            htmlFor="multimodal-upload" 
            className="secondary" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              textAlign: "center", 
              padding: "8px", 
              borderRadius: "4px",
              fontSize: "0.82rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            {uploading ? "Analyzing..." : "📷 Upload Log"}
          </label>
        </div>
      </form>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="chat-log" style={{ marginTop: "20px" }}>
        {messages.length === 0 && !loading && !uploading ? (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", opacity: 0.85 }}>
              <span className="label" style={{ fontWeight: "700" }}>{m.role === "user" ? "You" : "Coach"}</span>
              {m.role === "assistant" && !m.isError && (
                <button 
                  type="button" 
                  onClick={() => speakText(m.content)} 
                  style={{ background: "none", border: "none", fontSize: "0.95rem", cursor: "pointer", padding: "0 4px" }}
                  title="Speak Response"
                >
                  🔊
                </button>
              )}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}

        {(loading || uploading) ? (
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
