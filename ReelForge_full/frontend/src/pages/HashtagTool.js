import React, { useState } from "react";
import { api } from "../api";

export default function HashtagTool() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedTag, setCopiedTag] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!topic.trim()) return setError("type a topic first!");
    setLoading(true);
    setResult(null);
    setRawResult("");
    setError("");
    try {
      const data = await api.hashtags(topic);
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

  const copyTag = (tag) => {
    navigator.clipboard.writeText("#" + tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copyAllTags = () => {
    if (!result) return;
    const all = [
      ...(result.mega || []),
      ...(result.macro || []),
      ...(result.micro || []),
      ...(result.niche || [])
    ].map(t => "#" + t).join(" ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyBestCombo = () => {
    if (!result?.best_combo) return;
    navigator.clipboard.writeText(result.best_combo.map(t => "#" + t).join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const tiers = [
    { key: "mega",  label: "Mega",  desc: "1M+ posts",       color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
    { key: "macro", label: "Macro", desc: "100K–1M posts",   color: "#D4A843", bg: "rgba(212,168,67,0.08)",  border: "rgba(212,168,67,0.2)"  },
    { key: "micro", label: "Micro", desc: "10K–100K posts",  color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)"  },
    { key: "niche", label: "Niche", desc: "Under 10K posts", color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">hashtags that <span>actually work</span> #️⃣</div>
        <div className="page-sub">get hashtags sorted by reach — mega, macro, micro and niche</div>
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
        <div className="card-title">what is your content about?</div>
        <input
          placeholder='e.g. "fitness motivation" or "AI tools for students"'
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
        />
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? "finding hashtags..." : "get my hashtags 🚀"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> finding the best hashtags for you...</div>}
      </div>

      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div className="card-title">your hashtag kit 🎯</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-outline" style={{ fontSize: "12px" }} onClick={copyBestCombo}>copy best combo</button>
              <button className="btn-outline" style={{ fontSize: "12px" }} onClick={copyAllTags}>
                {copiedAll ? "✓ copied!" : "copy all"}
              </button>
            </div>
          </div>

          {result.strategy && (
            <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.15)", marginBottom: "16px", fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>
              💡 {result.strategy}
            </div>
          )}

          {result.best_combo && result.best_combo.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#D4A843", fontWeight: "700", marginBottom: "10px", letterSpacing: "1px" }}>BEST COMBO FOR ONE POST</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.best_combo.map((tag, i) => (
                  <div key={i} onClick={() => copyTag(tag)} style={{
                    padding: "5px 12px", borderRadius: "20px",
                    background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.25)",
                    color: "#D4A843", fontSize: "12px", cursor: "pointer", fontWeight: "600"
                  }}>
                    #{copiedTag === tag ? "✓" : tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tiers.map(tier => {
            const tags = result[tier.key];
            if (!tags || tags.length === 0) return null;
            return (
              <div key={tier.key} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "11px", color: tier.color, fontWeight: "700", letterSpacing: "1px" }}>{tier.label.toUpperCase()}</div>
                  <div style={{ fontSize: "11px", color: "#444" }}>{tier.desc}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {tags.map((tag, i) => (
                    <div key={i} onClick={() => copyTag(tag)} style={{
                      padding: "5px 12px", borderRadius: "20px",
                      background: tier.bg, border: `1px solid ${tier.border}`,
                      color: tier.color, fontSize: "12px", cursor: "pointer"
                    }}>
                      #{copiedTag === tag ? "✓ copied" : tag}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rawResult && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="card-title">your hashtag kit 🎯</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(rawResult)}>
              <i className="ti ti-copy"></i> copy all
            </button>
          </div>
          <div className="result-box">{rawResult}</div>
        </div>
      )}
    </div>
  );
}