import React, { useState, useEffect } from "react";

export default function Calendar() {
  const [niche, setNiche] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState({});
  const [selected, setSelected] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [calendarNiche, setCalendarNiche] = useState("");

  useEffect(() => {
    localStorage.setItem("reelforge_completed", JSON.stringify(completed));
  }, [completed]);

  const streak = Object.values(completed).filter(Boolean).length;

  const generate = async () => {
    setLoading(true);
    setDays([]);
    setSelected(null);
    setCompleted({});
    try {
      const res = await fetch("http://127.0.0.1:5000/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      const lines = data.result.split("\n").filter(l => l.trim() && l.toLowerCase().includes("day"));
      const parsed = [];
      for (let i = 0; i < 30; i++) {
        const line = lines[i] || "";
        const clean = line.replace(/^[0-9]+\.\s*/, "").replace(/Day\s*\d+[,:]?\s*/i, "").trim();
        const parts = clean.split(",");
        const idea = parts[0] ? parts[0].replace(/Content Idea:?/i,"").trim() : "Content idea " + (i+1);
        const time = parts[1] ? parts[1].replace(/Posting Time:?/i,"").trim() : "12:00 PM";
        const tags = parts.slice(2).join(" ").trim();
        parsed.push({ day: i+1, idea, time, tags });
      }
      setDays(parsed);
      setCalendarNiche(niche);
      setGenerated(true);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const toggleComplete = (day) => {
    setCompleted(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const colors = ["#D4A843","#60a5fa","#22c55e","#f97316","#a78bfa","#f43f5e","#06b6d4"];
  const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">your 30-day <span>content challenge</span></div>
        <div className="page-sub">generate your plan, track your progress, build your streak</div>
      </div>

      {generated && (
        <div className="stats-row" style={{marginBottom:"16px"}}>
          <div className="stat-card">
            <div className="stat-val" style={{color:"#22c55e"}}>{streak}</div>
            <div className="stat-label">days completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{30 - streak}</div>
            <div className="stat-label">days remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:"#D4A843"}}>{Math.round((streak/30)*100)}%</div>
            <div className="stat-label">challenge complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:"#a78bfa"}}>🔥</div>
            <div className="stat-label">{streak > 0 ? streak + " day streak!" : "start your streak"}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">what do you want to post about for 30 days?</div>
        <textarea
          placeholder='e.g. "I want to document my fitness journey" or "I want to teach AI to beginners" or "I want to share my student life honestly"'
          value={niche}
          onChange={e => setNiche(e.target.value)}
          rows={3}
        />
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? "generating your 30-day plan..." : generated ? "regenerate plan" : "generate my 30-day plan"}
        </button>
        {loading && <div className="loading"><i className="ti ti-loader"></i> building your content challenge...</div>}
      </div>

      {days.length > 0 && calendarNiche && (
        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
            <div className="card-title">your 30-day challenge — tap to mark complete</div>
            <div style={{fontSize:"12px", color:"#555"}}>{streak}/30 done</div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginBottom:"8px"}}>
            {weekdays.map(d => (
              <div key={d} style={{textAlign:"center", fontSize:"9px", fontWeight:"700", color:"#2a2a2a", padding:"4px 0", letterSpacing:"1px"}}>{d}</div>
            ))}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"6px", marginBottom:"20px"}}>
            {days.map((day, i) => (
              <div key={i}
                onClick={() => { toggleComplete(day.day); setSelected(selected === i ? null : i); }}
                style={{
                  background: completed[day.day] ? "rgba(34,197,94,0.1)" : "#080808",
                  border: completed[day.day] ? "1px solid #22c55e" : selected === i ? "1px solid #D4A843" : "1px solid #1a1a1a",
                  borderRadius:"10px", padding:"8px 6px", cursor:"pointer", transition:"all 0.2s", minHeight:"72px",
                  position:"relative"
                }}>
                {completed[day.day] && (
                  <div style={{position:"absolute", top:"4px", right:"4px", fontSize:"10px"}}>✅</div>
                )}
                <div style={{fontSize:"12px", fontWeight:"700", color: completed[day.day] ? "#22c55e" : colors[i % colors.length], marginBottom:"4px"}}>{day.day}</div>
                <div style={{fontSize:"8px", color: completed[day.day] ? "#22c55e" : "#333", lineHeight:"1.3", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical"}}>{day.idea}</div>
              </div>
            ))}
          </div>

          {selected !== null && days[selected] && (
            <div style={{background:"#080808", border:"1px solid #D4A843", borderRadius:"12px", padding:"20px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px"}}>
                <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                  <div style={{width:"36px", height:"36px", borderRadius:"10px", background:"rgba(212,168,67,0.1)", border:"1px solid rgba(212,168,67,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", color:"#D4A843", fontSize:"14px"}}>{selected+1}</div>
                  <div style={{fontSize:"15px", fontWeight:"600", color:"#fff"}}>Day {selected+1}</div>
                </div>
                <button
                  onClick={() => toggleComplete(days[selected].day)}
                  style={{fontSize:"12px", padding:"6px 14px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:"600", fontFamily:"inherit",
                    background: completed[days[selected].day] ? "rgba(34,197,94,0.1)" : "#D4A843",
                    color: completed[days[selected].day] ? "#22c55e" : "#080808"
                  }}>
                  {completed[days[selected].day] ? "✅ completed!" : "mark as done"}
                </button>
              </div>
              <div style={{fontSize:"14px", color:"#ccc", marginBottom:"8px", lineHeight:"1.6"}}>{days[selected].idea}</div>
              <div style={{fontSize:"12px", color:"#D4A843", marginBottom:"6px"}}>best time to post: {days[selected].time}</div>
              <div style={{fontSize:"12px", color:"#555", marginBottom:"14px"}}>{days[selected].tags}</div>
              <button className="btn" style={{fontSize:"12px", padding:"8px 16px"}}
                onClick={() => window.dispatchEvent(new CustomEvent('useIdea', {detail: days[selected].idea}))}>
                generate script for this
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}