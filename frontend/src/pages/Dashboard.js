import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("reelforge_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("reelforge_history", JSON.stringify(updated));
  };

  const copyScript = (script) => {
    navigator.clipboard.writeText(script);
    alert("Script copied 🚀");
  };

  const tools = [
    {
      name: "Script Generator",
      desc: "full script with hook, storyboard and viral score",
      icon: "ti-sparkles"
    },
    {
      name: "Idea Generator",
      desc: "10 viral content ideas for your niche",
      icon: "ti-bulb"
    },
    {
      name: "AI Voiceover",
      desc: "convert script to MP3 with AI voices",
      icon: "ti-microphone"
    },
    {
      name: "Hook Analyzer",
      desc: "rate, roast and rewrite your hook",
      icon: "ti-flame"
    },
    {
      name: "30-Day Calendar",
      desc: "plan a full month of content",
      icon: "ti-calendar"
    },
    {
      name: "Hashtag Research",
      desc: "50 hashtags sorted by reach",
      icon: "ti-hash"
    },
    {
      name: "Script Translator",
      desc: "translate scripts to 8 languages",
      icon: "ti-language"
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          hey Charchit, <span>let us cook</span>
        </div>

        <div className="page-sub">
          your creator studio has 7 tools ready to make you go viral
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">7</div>
          <div className="stat-label">AI tools</div>
        </div>

        <div className="stat-card">
          <div className="stat-val">8</div>
          <div className="stat-label">languages</div>
        </div>

        <div className="stat-card">
          <div className="stat-val">100</div>
          <div className="stat-label">max viral score</div>
        </div>

        <div className="stat-card">
          <div className="stat-val">{history.length}</div>
          <div className="stat-label">saved scripts</div>
        </div>
      </div>

      {/* HISTORY */}
      <div className="card">
        <div className="card-title">recent script history</div>

        {history.length === 0 ? (
          <div style={{ color: "#666", padding: "10px" }}>
            no scripts generated yet 👀
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #1f1f1f",
                  borderRadius: "14px",
                  padding: "16px"
                }}
              >
                <div
                  style={{
                    color: "#D4A843",
                    fontWeight: "700",
                    marginBottom: "8px"
                  }}
                >
                  {item.topic}
                </div>

                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    marginBottom: "10px"
                  }}
                >
                  {item.createdAt}
                </div>

                <div
                  style={{
                    color: "#ddd",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    maxHeight: "120px",
                    overflow: "hidden"
                  }}
                >
                  {item.script}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "14px"
                  }}
                >
                  <button
                    className="btn"
                    onClick={() => copyScript(item.script)}
                  >
                    Copy
                  </button>

                  <button
                    className="btn-outline"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOOLS */}
      <div className="card">
        <div className="card-title">all your tools</div>

        <div className="tools-grid">
          {tools.map((tool) => (
            <div className="tool-card" key={tool.name}>
              <div className="tool-icon">
                <i className={"ti " + tool.icon}></i>
              </div>

              <div className="tool-name">{tool.name}</div>
              <div className="tool-desc">{tool.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BUILT BY */}
      <div className="card">
        <div className="card-title">built by</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "700",
              color: "#D4A843"
            }}
          >
            CB
          </div>

          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#fff"
              }}
            >
              Charchit Bari
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#444",
                marginTop: "2px"
              }}
            >
              B.Tech AIML · VIT Bhopal · 2nd Year
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}