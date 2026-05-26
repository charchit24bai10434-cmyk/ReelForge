import React, { useState } from "react";
import { api } from "../api";

export default function HookAnalyzer() {
  const [hook, setHook] = useState("");
  const [result, setResult] = useState(null);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedHook, setCopiedHook] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!hook.trim()) return setError("paste your hook first!");
    setLoading(true);
    setResult(null);
    setRawResult("");
    setError("");
    try {
      const data = await api.analyzeHook(hook);
      if (data.raw) {
        setRawResult(data.result);
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running?");
    }
    setLoading(false);
  };

  const copyHook = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(i);
    setTimeout(() => setCopiedHook(null), 2000);
  };

  const scoreColor = (score) => {
    if (score >= 75) return "#4ade80";
    if (score >= 50) return "#D4A843";
    return "#f87171";
  };

  const scoreLabel = (score) => {
    if (score >= 80) return "🔥 fire";
    if (score >= 60) return "👍 decent";
    if (score >= 40) return "😐 mid";
    return "💀 needs work";
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">is your hook <span>fire or mid?</span> 🔥</div>
        <div className="page-sub">paste your hook and AI will rate it, roast it, and rewrite it better</div>
      </div>

      {error && (
        <div style={{
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "12px",
          color: "#f87171", fontSize: "14px", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          {error}
          <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setError("")}>✕</span>
        </div>
      )}

      <div className="card">
        <div className="card-title">drop your hook here</div>
        <textarea
          placeholder='e.g. "I tried waking up at 5am for 30 days and here is what happened..."'
          value={hook}
          onChange={e => setHook(e.target.value)}
          rows={4}
        />
        <button className="btn" onClick={analyze} disabled={loading}>
          {loading ? "analyzing your hook..." : "analyze my hook 🎯"}
        </button>
        {loading && (
          <div className="loading">
            <i className="ti ti-loader"></i> AI is judging your hook rn...
          </div>
        )}
      </div>

      {result && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: "20px" }}>hook analysis 📊</div>

          {/* Score + verdict */}
          <div style={{
            display: "flex", alignItems: "center", gap: "20px",
            marginBottom: "20px", padding: "16px",
            background: "#0a0a0a", borderRadius: "12px", border: "1px solid #1a1a1a"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "42px", fontWeight: "800", color: scoreColor(result.score), lineHeight: 1 }}>
                {result.score}
              </div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>/ 100</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "6px" }}>
                {scoreLabel(result.score)}
              </div>
              <div style={{ fontSize: "14px", color: "#888" }}>{result.verdict}</div>
            </div>
          </div>

          {/* What works / fails */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {result.what_works && (
              <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <div style={{ fontSize: "11px", color: "#4ade80", fontWeight: "700", marginBottom: "8px", letterSpacing: "1px" }}>WHAT WORKS</div>
                <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>{result.what_works}</div>
              </div>
            )}
            <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <div style={{ fontSize: "11px", color: "#f87171", fontWeight: "700", marginBottom: "8px", letterSpacing: "1px" }}>WHAT FAILS</div>
              <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>{result.what_fails}</div>
            </div>
          </div>

          {/* Scroll reason */}
          {result.scroll_reason && (
            <div style={{ padding: "14px", borderRadius: "10px", background: "#0a0a0a", border: "1px solid #1a1a1a", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: "700", marginBottom: "6px", letterSpacing: "1px" }}>WHY PEOPLE SCROLL PAST</div>
              <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6" }}>{result.scroll_reason}</div>
            </div>
          )}

          {/* Better hooks */}
          {result.better_hooks && result.better_hooks.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#D4A843", fontWeight: "700", marginBottom: "12px", letterSpacing: "1px" }}>3 BETTER HOOKS</div>
              {result.better_hooks.map((h, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", marginBottom: "8px",
                  background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "10px"
                }}>
                  <div style={{ fontSize: "14px", color: "#fff", flex: 1, lineHeight: "1.5" }}>{h}</div>
                  <button
                    className="btn-outline"
                    style={{ fontSize: "11px", padding: "4px 12px", marginLeft: "12px", flexShrink: 0 }}
                    onClick={() => copyHook(h, i)}
                  >
                    {copiedHook === i ? "✓" : "use"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pro tip */}
          {result.pro_tip && (
            <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.15)" }}>
              <div style={{ fontSize: "11px", color: "#D4A843", fontWeight: "700", marginBottom: "6px", letterSpacing: "1px" }}>PRO TIP</div>
              <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6" }}>{result.pro_tip}</div>
            </div>
          )}
        </div>
      )}

      {rawResult && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="card-title">hook analysis 📊</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(rawResult)}>
              <i className="ti ti-copy"></i> copy
            </button>
          </div>
          <div className="result-box">{rawResult}</div>
        </div>
      )}
    </div>
  );
}