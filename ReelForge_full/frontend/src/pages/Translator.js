import React, { useState } from "react";
import { api } from "../api";

export default function Translator() {
  const [script, setScript] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { value: "Hindi",      flag: "🇮🇳" },
    { value: "Hinglish",   flag: "🇮🇳" },
    { value: "German",     flag: "🇩🇪" },
    { value: "Spanish",    flag: "🇪🇸" },
    { value: "French",     flag: "🇫🇷" },
    { value: "Portuguese", flag: "🇧🇷" },
    { value: "Japanese",   flag: "🇯🇵" },
    { value: "Arabic",     flag: "🇸🇦" },
  ];

  const translate = async () => {
    if (!script.trim()) return setError("paste your script first!");
    setLoading(true);
    setResult("");
    setError("");
    try {
      const data = await api.translate(script, language);
      setResult(data.result);
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running?");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">go <span>global</span> with your content 🌍</div>
        <div className="page-sub">translate your script to any language while keeping the viral energy intact</div>
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
        <div className="card-title">paste your script</div>
        <textarea
          placeholder="paste your reel script here..."
          value={script}
          onChange={e => setScript(e.target.value)}
          rows={6}
        />

        <div className="card-title" style={{ marginTop: "16px" }}>translate to</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {languages.map(l => (
            <div
              key={l.value}
              onClick={() => setLanguage(l.value)}
              style={{
                padding: "8px 16px", borderRadius: "20px", cursor: "pointer",
                background: language === l.value ? "#D4A843" : "#0e0e0e",
                color: language === l.value ? "#080808" : "#555",
                border: language === l.value ? "1px solid #D4A843" : "1px solid #1e1e1e",
                fontWeight: language === l.value ? "700" : "400",
                fontSize: "13px"
              }}
            >
              {l.flag} {l.value}
            </div>
          ))}
        </div>

        <button className="btn" onClick={translate} disabled={loading}>
          {loading ? "translating..." : "translate my script 🌍"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> translating while keeping the vibe...</div>}
      </div>

      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="card-title">translated script ✅</div>
            <button className="btn-outline" onClick={copy}>
              {copied ? "✓ copied!" : <><i className="ti ti-copy"></i> copy</>}
            </button>
          </div>
          <div className="result-box" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>{result}</div>
        </div>
      )}
    </div>
  );
}