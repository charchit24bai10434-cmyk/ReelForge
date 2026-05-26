import React, { useState, useEffect } from "react";
import { api } from "../api";

const FORMAT_CONFIG = {
  "Storytime":    { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", emoji: "📖" },
  "Opinion":      { color: "#f97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  emoji: "💬" },
  "Tutorial":     { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  emoji: "🎓" },
  "Trend":        { color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.3)",   emoji: "🔥" },
  "BTS":          { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)",   emoji: "🎬" },
  "Challenge":    { color: "#D4A843", bg: "rgba(212,168,67,0.12)",  border: "rgba(212,168,67,0.3)",  emoji: "⚡" },
  "Day-in-Life":  { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)",   emoji: "☀️" },
  "Hot Take":     { color: "#e879f9", bg: "rgba(232,121,249,0.12)", border: "rgba(232,121,249,0.3)", emoji: "🌶️" },
  "default":      { color: "#D4A843", bg: "rgba(212,168,67,0.12)",  border: "rgba(212,168,67,0.3)",  emoji: "✨" },
};

function getFormat(idea) {
  const upper = idea.toUpperCase();
  for (const fmt of Object.keys(FORMAT_CONFIG)) {
    if (fmt !== "default" && upper.includes(fmt.toUpperCase())) return fmt;
  }
  if (upper.includes("BTS") || upper.includes("BEHIND")) return "BTS";
  if (upper.includes("DAY")) return "Day-in-Life";
  return "default";
}

function ProgressRing({ streak }) {
  const pct = streak / 30;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={streak === 0 ? "#2a2a2a" : streak === 30 ? "#22c55e" : "#D4A843"}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: "28px", fontWeight: "800", color: streak === 30 ? "#22c55e" : "#fff", lineHeight: 1 }}>
          {streak}
        </div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>/ 30 days</div>
        {streak > 0 && (
          <div style={{ fontSize: "16px", marginTop: "4px" }}>
            {streak === 30 ? "🏆" : "🔥"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const [niche, setNiche] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState({});
  const [selected, setSelected] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [activeWeek, setActiveWeek] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("reelforge_completed");
    if (saved) { try { setCompleted(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("reelforge_completed", JSON.stringify(completed));
  }, [completed]);

  const streak = Object.values(completed).filter(Boolean).length;

  const parseDay = (line, i) => {
    const clean = line.replace(/^Day\s*\d+[:\-—]?\s*/i, "").replace(/^\d+\.\s*/, "").trim();
    const dashIdx = clean.indexOf("—");
    const colonIdx = clean.indexOf(":");
    let format = "default";
    let idea = clean;

    if (dashIdx > 0) {
      const before = clean.slice(0, dashIdx).trim();
      const after = clean.slice(dashIdx + 1).trim();
      // check if before is a format tag like [Tutorial]
      const fmtMatch = before.match(/\[?([A-Za-z\-]+)\]?/);
      if (fmtMatch) format = fmtMatch[1];
      idea = after || before;
    } else if (colonIdx > 0 && colonIdx < 20) {
      idea = clean.slice(colonIdx + 1).trim();
    }

    format = getFormat(idea) !== "default" ? getFormat(idea) : format;
    return { day: i + 1, idea: idea || `Content idea ${i + 1}`, format };
  };

  const generate = async () => {
    if (!niche.trim()) return setError("tell us what you want to post about!");
    setLoading(true);
    setDays([]);
    setSelected(null);
    setCompleted({});
    setError("");
    setGenerated(false);

    try {
      const data = await api.calendar(niche);
      const lines = data.result
        .split("\n")
        .map(l => l.trim())
        .filter(l => l && /day\s*\d+/i.test(l));

      const parsed = [];
      for (let i = 0; i < 30; i++) {
        parsed.push(parseDay(lines[i] || `Day ${i+1}: Content idea ${i+1}`, i));
      }
      setDays(parsed);
      setGenerated(true);
      setActiveWeek(null);
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running?");
    }
    setLoading(false);
  };

  const toggleComplete = (e, dayNum) => {
    e.stopPropagation();
    setCompleted(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const weeks = [
    { label: "Week 1", subtitle: "Foundation", days: days.slice(0, 7) },
    { label: "Week 2", subtitle: "Momentum",   days: days.slice(7, 14) },
    { label: "Week 3", subtitle: "Growth",      days: days.slice(14, 21) },
    { label: "Week 4", subtitle: "Mastery",     days: days.slice(21, 30) },
  ];

  const selectedDay = selected !== null ? days[selected] : null;
  const fmt = selectedDay ? (FORMAT_CONFIG[selectedDay.format] || FORMAT_CONFIG.default) : null;

  return (
    <div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .day-card { transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
        .day-card:hover { transform: translateY(-2px); }
        .week-section { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="page-title">your 30-day <span>content challenge</span></div>
        <div className="page-sub">generate your plan, track your progress, build your streak</div>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px", color: "#f87171", fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setError("")}>✕</span>
        </div>
      )}

      {/* Progress + input card */}
      <div className="card" style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <ProgressRing streak={streak} />

        <div style={{ flex: 1, minWidth: "240px" }}>
          {generated && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#22c55e" }}>{streak}</div>
                <div style={{ fontSize: "11px", color: "#555" }}>completed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>{30 - streak}</div>
                <div style={{ fontSize: "11px", color: "#555" }}>remaining</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#D4A843" }}>{Math.round((streak / 30) * 100)}%</div>
                <div style={{ fontSize: "11px", color: "#555" }}>done</div>
              </div>
              {streak > 0 && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#f97316" }}>🔥{streak}</div>
                  <div style={{ fontSize: "11px", color: "#555" }}>day streak</div>
                </div>
              )}
            </div>
          )}

          <div className="card-title" style={{ marginBottom: "8px" }}>what do you want to post about?</div>
          <textarea
            placeholder='e.g. "fitness journey" or "student life content" or "teaching AI to beginners"'
            value={niche}
            onChange={e => setNiche(e.target.value)}
            rows={2}
            style={{ marginBottom: "10px" }}
          />
          <button className="btn" onClick={generate} disabled={loading}>
            {loading ? "building your challenge..." : generated ? "regenerate plan" : "generate my 30-day plan"}
          </button>
          {loading && <div style={{ marginTop: "8px", fontSize: "12px", color: "#555", animation: "pulse 1s infinite" }}>⚡ AI is planning your 30 days...</div>}
        </div>
      </div>

      {/* Format legend */}
      {generated && days.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {Object.entries(FORMAT_CONFIG).filter(([k]) => k !== "default").map(([fmt, cfg]) => (
            <div key={fmt} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, display: "flex", alignItems: "center", gap: "4px" }}>
              <span>{cfg.emoji}</span> {fmt}
            </div>
          ))}
        </div>
      )}

      {/* Weekly sections */}
      {generated && days.length > 0 && weeks.map((week, wi) => {
        const weekCompleted = week.days.filter(d => completed[d.day]).length;
        const isOpen = activeWeek === null || activeWeek === wi;

        return (
          <div key={wi} className="week-section" style={{ marginBottom: "12px" }}>
            {/* Week header */}
            <div
              onClick={() => setActiveWeek(activeWeek === wi ? null : wi)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", background: "#0f0f0f",
                border: "1px solid #1e1e1e", borderRadius: isOpen ? "12px 12px 0 0" : "12px",
                cursor: "pointer", marginBottom: isOpen ? "0" : "0"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#D4A843" }}>
                  W{wi + 1}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{week.label} — {week.subtitle}</div>
                  <div style={{ fontSize: "11px", color: "#555" }}>Days {wi * 7 + 1}–{Math.min((wi + 1) * 7, 30)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Mini progress bar */}
                <div style={{ width: "80px" }}>
                  <div style={{ background: "#1a1a1a", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${(weekCompleted / week.days.length) * 100}%`, height: "100%", background: weekCompleted === week.days.length ? "#22c55e" : "#D4A843", borderRadius: "4px", transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ fontSize: "10px", color: "#444", marginTop: "3px", textAlign: "right" }}>{weekCompleted}/{week.days.length}</div>
                </div>
                <span style={{ color: "#444", fontSize: "14px" }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Day cards */}
            {isOpen && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: "6px", padding: "10px",
                background: "#0a0a0a", border: "1px solid #1e1e1e",
                borderTop: "none", borderRadius: "0 0 12px 12px"
              }}>
                {week.days.map((day, di) => {
                  const fmtCfg = FORMAT_CONFIG[day.format] || FORMAT_CONFIG.default;
                  const isDone = completed[day.day];
                  const isSelected = selected === (wi * 7 + di);

                  return (
                    <div
                      key={di}
                      className="day-card"
                      onClick={() => setSelected(isSelected ? null : wi * 7 + di)}
                      style={{
                        background: isDone ? "rgba(34,197,94,0.08)" : isSelected ? fmtCfg.bg : "#111",
                        border: isDone ? "1px solid rgba(34,197,94,0.4)" : isSelected ? `1px solid ${fmtCfg.color}` : "1px solid #1e1e1e",
                        borderRadius: "10px", padding: "10px 8px",
                        cursor: "pointer", minHeight: "110px",
                        position: "relative", display: "flex", flexDirection: "column",
                        boxShadow: isSelected ? `0 0 12px ${fmtCfg.color}33` : "none"
                      }}
                    >
                      {/* Day number + check */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: isDone ? "#22c55e" : fmtCfg.color }}>
                          {day.day}
                        </div>
                        <div
                          onClick={(e) => toggleComplete(e, day.day)}
                          style={{
                            width: "18px", height: "18px", borderRadius: "50%",
                            border: isDone ? "none" : "1px solid #333",
                            background: isDone ? "#22c55e" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", cursor: "pointer", flexShrink: 0,
                            transition: "all 0.2s ease"
                          }}
                        >
                          {isDone ? "✓" : ""}
                        </div>
                      </div>

                      {/* Format badge */}
                      <div style={{
                        fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px",
                        color: isDone ? "#22c55e" : fmtCfg.color,
                        marginBottom: "5px", display: "flex", alignItems: "center", gap: "3px"
                      }}>
                        <span>{fmtCfg.emoji}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {day.format === "default" ? "Content" : day.format}
                        </span>
                      </div>

                      {/* Idea text */}
                      <div style={{
                        fontSize: "9px", color: isDone ? "#22c55e" : "#666",
                        lineHeight: "1.4", flex: 1,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 4, WebkitBoxOrient: "vertical"
                      }}>
                        {day.idea}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Selected day detail panel */}
      {selectedDay && fmt && (
        <div style={{
          background: "#0d0d0d", border: `1px solid ${fmt.color}`,
          borderRadius: "16px", padding: "24px", marginTop: "8px",
          animation: "fadeIn 0.2s ease",
          boxShadow: `0 0 30px ${fmt.color}22`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: fmt.bg, border: `1px solid ${fmt.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px"
              }}>
                {fmt.emoji}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: fmt.color, fontWeight: "700", letterSpacing: "1px", marginBottom: "2px" }}>
                  DAY {selectedDay.day} — {selectedDay.format.toUpperCase()}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", lineHeight: "1.4" }}>
                  {selectedDay.idea}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "18px", padding: "4px" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={(e) => toggleComplete(e, selectedDay.day)}
              style={{
                padding: "10px 20px", borderRadius: "10px", border: "none",
                cursor: "pointer", fontWeight: "700", fontSize: "13px", fontFamily: "inherit",
                background: completed[selectedDay.day] ? "rgba(34,197,94,0.15)" : fmt.color === "#D4A843" ? "#D4A843" : fmt.bg,
                color: completed[selectedDay.day] ? "#22c55e" : fmt.color === "#D4A843" ? "#080808" : fmt.color,
                border: completed[selectedDay.day] ? "1px solid rgba(34,197,94,0.4)" : `1px solid ${fmt.border}`,
                transition: "all 0.2s ease"
              }}
            >
              {completed[selectedDay.day] ? "✅ marked complete!" : "mark as done"}
            </button>

            <button
              className="btn"
              style={{ fontSize: "13px", padding: "10px 20px" }}
              onClick={() => window.dispatchEvent(new CustomEvent('useIdea', { detail: selectedDay.idea }))}
            >
              generate script for this 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}