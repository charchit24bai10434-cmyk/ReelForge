import React, { useState } from "react";

export default function HookAnalyzer() {
  const [hook, setHook] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!hook) return alert("paste your hook first bro");
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("http://127.0.0.1:5000/analyze-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hook }),
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setResult("backend is sleeping, wake it up!");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">is your hook <span>fire or mid?</span> 🔥</div>
        <div className="page-sub">paste your hook and AI will rate it, roast it, and rewrite it better</div>
      </div>

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
            <i className="ti ti-loader"></i>
            AI is judging your hook rn...
          </div>
        )}
      </div>

      {result && (
        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
            <div className="card-title">hook analysis 📊</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(result)}>
              <i className="ti ti-copy"></i> copy
            </button>
          </div>
          <div className="result-box">{result}</div>
        </div>
      )}
    </div>
  );
}