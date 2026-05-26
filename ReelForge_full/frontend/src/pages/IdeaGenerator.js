import React, { useState } from "react";
import { api } from "../api";

export default function IdeaGenerator({ prefilledIdea }) {
  const [input, setInput] = useState(prefilledIdea || "");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [expanding, setExpanding] = useState(false);
  const [detail, setDetail] = useState({});
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (prefilledIdea) setInput(prefilledIdea);
  }, [prefilledIdea]);

  const examples = [
    "I want to make a video about my morning routine but make it interesting",
    "I am a student and want to make study motivation content",
    "I love cooking and want to go viral on Instagram",
    "I want to make tech content but dont know where to start",
    "I want to share my fitness journey in a real and raw way",
  ];

  const generate = async () => {
    if (!input.trim()) return setError("tell us what you want to make first!");
    setLoading(true);
    setIdeas([]);
    setExpanded(null);
    setDetail({});
    setError("");
    try {
      const data = await api.ideasSmart(input);
      setIdeas(data.ideas || []);
      if (!data.ideas?.length) setError("No ideas returned — try rephrasing your input.");
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running?");
    }
    setLoading(false);
  };

  const expand = async (idea, index) => {
    if (expanded === index) { setExpanded(null); return; }
    setExpanded(index);
    if (detail[index]) return;
    setExpanding(true);
    try {
      const data = await api.expandIdea(idea.title);
      setDetail(prev => ({ ...prev, [index]: data.result }));
    } catch (err) {
      setDetail(prev => ({ ...prev, [index]: "Could not expand — try again." }));
    }
    setExpanding(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">what do you <span>want to make?</span></div>
        <div className="page-sub">describe your idea in your own words — AI will turn it into viral content ideas</div>
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
        <div className="card-title">tell AI what you have in mind</div>
        <textarea
          placeholder="e.g. I want to make a video about how I failed my exam and what happened next, or I love coffee and want to make aesthetic content about my morning..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={4}
          style={{ marginBottom: "12px" }}
        />
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "#333", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>or try an example</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {examples.map((ex, i) => (
              <div key={i} onClick={() => setInput(ex)}
                style={{ fontSize: "12px", padding: "6px 12px", background: "#0e0e0e", border: "1px solid #1e1e1e", borderRadius: "20px", color: "#555", cursor: "pointer" }}>
                {ex}
              </div>
            ))}
          </div>
        </div>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? "analyzing your idea..." : "get my content ideas"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> AI is analyzing your idea and finding viral angles...</div>}
      </div>

      {ideas.length > 0 && (
        <div className="card">
          <div className="card-title">{ideas.length} ideas based on what you said — click any to expand</div>
          {ideas.map((idea, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div onClick={() => expand(idea, i)}
                style={{ background: "#080808", border: expanded === i ? "1px solid #D4A843" : "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4A843", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>{idea.title}</div>
                    <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>{idea.why}</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(212,168,67,0.08)", color: "#D4A843", border: "1px solid rgba(212,168,67,0.15)" }}>{idea.format}</span>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: idea.viral === "High" ? "rgba(34,197,94,0.08)" : "rgba(212,168,67,0.08)", color: idea.viral === "High" ? "#22c55e" : "#D4A843", border: "1px solid rgba(34,197,94,0.15)" }}>{idea.viral} viral potential</span>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.15)" }}>{idea.trend}</span>
                    </div>
                  </div>
                  <i className={"ti " + (expanded === i ? "ti-chevron-up" : "ti-chevron-down")} style={{ color: "#333", fontSize: "16px", flexShrink: 0 }}></i>
                </div>
              </div>

              {expanded === i && (
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderTopLeftRadius: "0", borderTopRightRadius: "0", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", padding: "16px", borderTop: "none" }}>
                  {expanding && !detail[i] ? (
                    <div className="loading"><i className="ti ti-loader"></i> expanding this idea...</div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.8", whiteSpace: "pre-wrap", marginBottom: "14px" }}>{detail[i]}</div>
                      <button className="btn" onClick={() => {
                        window.dispatchEvent(new CustomEvent('useIdea', { detail: idea.title }));
                      }} style={{ fontSize: "12px", padding: "8px 16px" }}>
                        use this idea in script generator
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}