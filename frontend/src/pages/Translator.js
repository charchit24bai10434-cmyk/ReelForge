import React, { useState } from "react";

export default function Translator() {
  const [script, setScript] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!script) return alert("paste your script first!");
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("http://127.0.0.1:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, language }),
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
        <div className="page-title">go <span>global</span> with your content 🌍</div>
        <div className="page-sub">translate your script to any language while keeping the viral energy intact</div>
      </div>
      <div className="card">
        <div className="card-title">paste your script</div>
        <textarea placeholder="paste your reel script here..." value={script} onChange={e => setScript(e.target.value)} rows={6} />
        <div className="card-title">translate to</div>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="Hindi">Hindi</option>
          <option value="Hinglish">Hinglish</option>
          <option value="German">German</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Japanese">Japanese</option>
          <option value="Arabic">Arabic</option>
        </select>
        <button className="btn" onClick={translate} disabled={loading}>
          {loading ? "translating..." : "translate my script 🌍"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> translating while keeping the vibe...</div>}
      </div>
      {result && (
        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
            <div className="card-title">translated script ✅</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(result)}><i className="ti ti-copy"></i> copy</button>
          </div>
          <div className="result-box">{result}</div>
        </div>
      )}
    </div>
  );
}