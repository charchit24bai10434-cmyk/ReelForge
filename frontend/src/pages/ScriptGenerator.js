import React, { useState, useEffect } from "react";

export default function ScriptGenerator({ prefilledTopic }) {
  const [topic, setTopic] = useState(prefilledTopic || "");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("");
  const [duration, setDuration] = useState("30");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => { if (prefilledTopic) { setTopic(prefilledTopic); setStep(2); } }, [prefilledTopic]);

  const niches = [
    { id:"motivation", label:"Motivation", emoji:"💪", desc:"inspire people" },
    { id:"tech", label:"Tech & AI", emoji:"🤖", desc:"tech content" },
    { id:"travel", label:"Travel", emoji:"✈️", desc:"explore the world" },
    { id:"food", label:"Food", emoji:"🍕", desc:"food content" },
    { id:"fitness", label:"Fitness", emoji:"🏋️", desc:"health & body" },
    { id:"comedy", label:"Comedy", emoji:"😂", desc:"make people laugh" },
    { id:"fashion", label:"Fashion", emoji:"👗", desc:"style content" },
    { id:"education", label:"Education", emoji:"📚", desc:"teach something" },
    { id:"finance", label:"Finance", emoji:"💰", desc:"money tips" },
    { id:"gaming", label:"Gaming", emoji:"🎮", desc:"gaming content" },
  ];

  const tones = [
    { id:"cinematic", label:"Cinematic", emoji:"🎬", desc:"dramatic & powerful" },
    { id:"funny", label:"Funny", emoji:"😂", desc:"make them laugh" },
    { id:"raw", label:"Raw & Real", emoji:"💯", desc:"honest & unfiltered" },
    { id:"educational", label:"Educational", emoji:"🧠", desc:"teach & inform" },
    { id:"energetic", label:"Energetic", emoji:"⚡", desc:"high energy hype" },
    { id:"emotional", label:"Emotional", emoji:"❤️", desc:"touch their heart" },
    { id:"chill", label:"Chill", emoji:"😎", desc:"relaxed & casual" },
    { id:"inspirational", label:"Inspirational", emoji:"🌟", desc:"move people" },
  ];

  const durations = [
    { id:"15", label:"15 sec", desc:"quick & punchy" },
    { id:"30", label:"30 sec", desc:"sweet spot" },
    { id:"60", label:"60 sec", desc:"full story" },
    { id:"90", label:"90 sec", desc:"deep dive" },
  ];

  const generate = async () => {
    if (!topic) return alert("tell us what your video is about first!");
    if (!niche) return alert("pick your niche!");
    if (!tone) return alert("pick your tone!");
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche, tone, duration, language }),
      });
      const data = await res.json();
      setResult(data.result);
      setStep(4);
    } catch (err) {
      setResult("backend is sleeping, wake it up!");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">drop your <span>idea</span>, we cook the script</div>
        <div className="page-sub">hook, storyboard, hashtags, viral score — all in one click</div>
      </div>

      <div className="card">
        <div className="card-title">step 1 — what is your video about?</div>
        <textarea
          placeholder={'tell us anything — e.g. "I failed my exam 3 times and what I did next" or "my honest morning routine as a broke student" or "5 AI tools that changed my life"'}
          value={topic}
          onChange={e => { setTopic(e.target.value); if(e.target.value.length > 5) setStep(2); }}
          rows={3}
          style={{marginBottom:"8px"}}
        />
        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {["I failed and bounced back", "my honest daily routine", "things nobody tells you about", "I tried this for 30 days", "unpopular opinion about"].map((ex,i) => (
            <div key={i} onClick={() => { setTopic(ex + " "); setStep(2); }}
              style={{fontSize:"12px", padding:"5px 12px", background:"#0e0e0e", border:"1px solid #1e1e1e", borderRadius:"20px", color:"#555", cursor:"pointer", transition:"all 0.2s"}}
              onMouseOver={e => e.currentTarget.style.borderColor="#D4A843"}
              onMouseOut={e => e.currentTarget.style.borderColor="#1e1e1e"}
            >{ex}</div>
          ))}
        </div>
      </div>

      {step >= 2 && (
        <div className="card">
          <div className="card-title">step 2 — what is your niche?</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px,1fr))", gap:"8px"}}>
            {niches.map(n => (
              <div key={n.id} onClick={() => { setNiche(n.id); setStep(3); }}
                style={{background: niche===n.id ? "rgba(212,168,67,0.1)" : "#080808", border: niche===n.id ? "1px solid #D4A843" : "1px solid #1a1a1a", borderRadius:"10px", padding:"12px", cursor:"pointer", transition:"all 0.2s", textAlign:"center"}}>
                <div style={{fontSize:"22px", marginBottom:"4px"}}>{n.emoji}</div>
                <div style={{fontSize:"13px", fontWeight:"600", color: niche===n.id ? "#D4A843" : "#fff"}}>{n.label}</div>
                <div style={{fontSize:"10px", color:"#444", marginTop:"2px"}}>{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className="card">
          <div className="card-title">step 3 — what vibe do you want?</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px,1fr))", gap:"8px", marginBottom:"16px"}}>
            {tones.map(t => (
              <div key={t.id} onClick={() => setTone(t.id)}
                style={{background: tone===t.id ? "rgba(212,168,67,0.1)" : "#080808", border: tone===t.id ? "1px solid #D4A843" : "1px solid #1a1a1a", borderRadius:"10px", padding:"12px", cursor:"pointer", transition:"all 0.2s", textAlign:"center"}}>
                <div style={{fontSize:"22px", marginBottom:"4px"}}>{t.emoji}</div>
                <div style={{fontSize:"13px", fontWeight:"600", color: tone===t.id ? "#D4A843" : "#fff"}}>{t.label}</div>
                <div style={{fontSize:"10px", color:"#444", marginTop:"2px"}}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div className="card-title">how long?</div>
          <div style={{display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap"}}>
            {durations.map(d => (
              <div key={d.id} onClick={() => setDuration(d.id)}
                style={{background: duration===d.id ? "rgba(212,168,67,0.1)" : "#080808", border: duration===d.id ? "1px solid #D4A843" : "1px solid #1a1a1a", borderRadius:"10px", padding:"10px 20px", cursor:"pointer", transition:"all 0.2s", textAlign:"center"}}>
                <div style={{fontSize:"14px", fontWeight:"700", color: duration===d.id ? "#D4A843" : "#fff"}}>{d.label}</div>
                <div style={{fontSize:"10px", color:"#444"}}>{d.desc}</div>
              </div>
            ))}
          </div>

          <div className="card-title">language</div>
          <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px"}}>
            {["English","Hindi","Hinglish","German","Spanish"].map(l => (
              <div key={l} onClick={() => setLanguage(l)}
                style={{fontSize:"13px", padding:"7px 16px", borderRadius:"20px", cursor:"pointer", transition:"all 0.2s", background: language===l ? "#D4A843" : "#0e0e0e", color: language===l ? "#080808" : "#555", border: language===l ? "1px solid #D4A843" : "1px solid #1e1e1e", fontWeight: language===l ? "700" : "400"}}>{l}</div>
            ))}
          </div>

          <button className="btn" onClick={generate} disabled={loading} style={{width:"100%", padding:"16px", fontSize:"16px"}}>
            {loading ? "cooking your script..." : "generate my script 🚀"}
          </button>
          {loading && <div className="loading"><i className="ti ti-loader"></i> AI is writing your viral script...</div>}
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
            <div className="card-title">your script is ready 🔥</div>
            <button className="btn-outline" onClick={() => navigator.clipboard.writeText(result)}>
              <i className="ti ti-copy"></i> copy all
            </button>
          </div>
          <div className="result-box">{result}</div>
          <button className="btn" style={{marginTop:"12px", width:"100%"}} onClick={() => { setResult(""); setStep(1); setTopic(""); setNiche(""); setTone(""); }}>
            make another script
          </button>
        </div>
      )}
    </div>
  );
}