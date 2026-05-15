import React, { useState } from "react";

export default function HashtagTool() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return alert("type a topic first!");
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("http://127.0.0.1:5000/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
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
        <div className="page-title">hashtags that <span>actually work</span> #️⃣</div>
        <div className="page-sub">get 50 hashtags sorted by reach — mega, macro, micro and niche</div>
      </div>
      <div className="card">
        <div className="card-title">what is your content about?</div>
        <input placeholder='e.g. "fitness motivation" or "AI tools"' value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} />
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? "finding hashtags..." : "get my hashtags 🚀"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> finding the best hashtags for you...</div>}
      </div>
      {result && (
        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
            <div className="card-title">your hashtag kit 🎯</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(result)}><i className="ti ti-copy"></i> copy all</button>
          </div>
          <div className="result-box">{result}</div>
        </div>
      )}
    </div>
  );
}