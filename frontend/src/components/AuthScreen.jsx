import React, { useState } from "react";
import { apiFetch } from "../api.js";

export default function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client"); // 'client', 'coach', 'agency'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: { email, password }
        });
        // Success
        onLoginSuccess(data);
      } else {
        // Signup Flow
        if (!name) {
          setError("Name is required for sign up.");
          setLoading(false);
          return;
        }
        const data = await apiFetch("/api/auth/signup", {
          method: "POST",
          body: { email, password, role, name }
        });
        setSuccessMsg("Registration successful! Please login.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err?.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "radial-gradient(circle at center, #111827 0%, #030712 100%)",
      color: "var(--fg)",
      padding: "20px"
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "32px",
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)"
      }}>
        {/* Logo/Icon Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "3rem" }}>👑</span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "8px", background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            MyFitness AI
          </h2>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            {isLogin ? "Sign in to access your portal space" : "Create a new professional or client account"}
          </p>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: "16px", fontSize: "0.82rem" }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="alert success" style={{ marginBottom: "16px", fontSize: "0.82rem" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="field" style={{ marginBottom: "14px" }}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          )}

          <div className="field" style={{ marginBottom: "14px" }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>

          <div className="field" style={{ marginBottom: "16px" }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>

          {!isLogin && (
            <div className="field" style={{ marginBottom: "20px" }}>
              <label>Account Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <option value="client">💪 Client / Customer</option>
                <option value="coach">🏋️ Fitness Coach / Personal Trainer</option>
                <option value="agency">🏢 Fitness Agency / Gym Franchise</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "Verifying..." : isLogin ? "Sign In" : "Register Account"}
          </button>
        </form>

        {/* Switch links */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem" }}>
          {isLogin ? (
            <p className="muted">
              Don't have an account?{" "}
              <span 
                onClick={() => setIsLogin(false)} 
                style={{ color: "#6366f1", cursor: "pointer", fontWeight: "700" }}
              >
                Create Account
              </span>
            </p>
          ) : (
            <p className="muted">
              Already registered?{" "}
              <span 
                onClick={() => setIsLogin(true)} 
                style={{ color: "#6366f1", cursor: "pointer", fontWeight: "700" }}
              >
                Login here
              </span>
            </p>
          )}
        </div>

        {/* Hint Box */}
        {isLogin && (
          <div style={{ 
            marginTop: "20px", 
            padding: "10px", 
            borderRadius: "6px", 
            background: "rgba(255,255,255,0.02)", 
            border: "1px solid rgba(255,255,255,0.05)",
            fontSize: "0.75rem",
            color: "var(--muted)",
            textAlign: "center"
          }}>
            💡 Test Credentials:<br/>
            <strong>agency@test.com</strong> | <strong>coach@test.com</strong> | <strong>janedoe@test.com</strong><br/>
            (Password for all: <strong>password</strong>)
          </div>
        )}
      </div>
    </div>
  );
}
