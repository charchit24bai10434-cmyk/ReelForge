import React, { useState, useEffect } from "react";

export default function Explore() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState("All");

  const niches = ["All","Motivation","Tech","Fitness","Food","Travel","Comedy","Fashion","Education"];

  const sampleReels = [
    {id:1,creator:"@techbro_india",niche:"Tech",title:"I built an AI app in 24 hours",hook:"What if I told you anyone can build AI in 24 hours...",views:"2.1M",likes:"180K",score:94,tags:["#AI","#Tech","#BuildInPublic"]},
    {id:2,creator:"@fitness.with.rahul",niche:"Fitness",title:"30 day transformation nobody talks about",hook:"Everyone shows the result. Nobody shows the struggle.",views:"1.8M",likes:"210K",score:91,tags:["#Fitness","#Transformation","#RealTalk"]},
    {id:3,creator:"@collegelife.real",niche:"Motivation",title:"Failed 3 exams and still made it",hook:"I failed. Then I failed again. Here is what changed.",views:"3.2M",likes:"290K",score:97,tags:["#StudentLife","#Motivation","#RealStory"]},
    {id:4,creator:"@cook.with.priya",niche:"Food",title:"5 minute meals that saved my semester",hook:"No time. No money. No problem.",views:"900K",likes:"95K",score:88,tags:["#Food","#StudentHacks","#QuickRecipes"]},
    {id:5,creator:"@wanderlust.vibes",niche:"Travel",title:"Solo trip on 5000 rupees changed my life",hook:"5000 rupees. 3 days. Life changing.",views:"1.5M",likes:"140K",score:92,tags:["#Travel","#BudgetTravel","#SoloTrip"]},
    {id:6,creator:"@aiml.charchit",niche:"Tech",title:"Day in life of AIML student at VIT",hook:"Nobody shows what AIML actually looks like. I will.",views:"750K",likes:"82K",score:89,tags:["#AIML","#VIT","#StudentLife"]},
    {id:7,creator:"@mindset.daily",niche:"Motivation",title:"Morning routine that 10x my productivity",hook:"I wasted 2 years before I found this routine.",views:"2.8M",likes:"245K",score:95,tags:["#MorningRoutine","#Productivity","#Mindset"]},
    {id:8,creator:"@fashion.minimal",niche:"Fashion",title:"5 outfits. 500 rupees. Look expensive.",hook:"You do not need money to look good. Proof:",views:"1.1M",likes:"130K",score:90,tags:["#Fashion","#BudgetFashion","#StyleTips"]},
    {id:9,creator:"@startup.diaries",niche:"Tech",title:"I quit college to build a startup. Here is what happened.",hook:"Everyone said I was crazy. Maybe they were right.",views:"4.1M",likes:"380K",score:98,tags:["#Startup","#Entrepreneurship","#College"]},
    {id:10,creator:"@study.with.neha",niche:"Education",title:"Study method that got me 95% in finals",hook:"I used to fail. Now I top my class. This changed everything.",views:"1.3M",likes:"115K",score:91,tags:["#StudyTips","#Exam","#Student"]},
    {id:11,creator:"@comedy.campus",niche:"Comedy",title:"Types of students in every exam season",hook:"Which one are you? Be honest.",views:"5.2M",likes:"490K",score:99,tags:["#Comedy","#College","#Relatable"]},
    {id:12,creator:"@budget.travels",niche:"Travel",title:"Goa in 3000 rupees complete guide",hook:"They said Goa is expensive. I proved them wrong.",views:"2.3M",likes:"198K",score:93,tags:["#Goa","#BudgetTravel","#India"]},
  ];

  useEffect(() => {
    setTimeout(() => { setReels(sampleReels); setLoading(false); }, 800);
  }, []);

  const searchReels = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/explore-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search }),
      });
      const data = await res.json();
      if (data.reels && data.reels.length > 0) setReels(data.reels);
    } catch (err) { console.log(err); }
    setSearching(false);
  };

  const filtered = filter === "All" ? reels : reels.filter(r => r.niche === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">explore what is <span>going viral</span></div>
        <div className="page-sub">get inspired by viral reels — make your own version in one click</div>
      </div>

      <div className="card">
        <div className="card-title">search by your idea</div>
        <div style={{display:"flex", gap:"10px"}}>
          <input placeholder='e.g. "student life" or "fitness journey"' value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchReels()} style={{marginBottom:0, flex:1}} />
          <button className="btn" onClick={searchReels} disabled={searching} style={{whiteSpace:"nowrap"}}>{searching ? "searching..." : "find reels"}</button>
        </div>
        <div style={{marginTop:"12px", display:"flex", gap:"6px", flexWrap:"wrap"}}>
          {niches.map(n => (
            <div key={n} onClick={() => setFilter(n)} style={{fontSize:"12px", padding:"5px 14px", borderRadius:"20px", cursor:"pointer", transition:"all 0.2s", background: filter===n ? "#D4A843" : "#0e0e0e", color: filter===n ? "#080808" : "#555", border: filter===n ? "1px solid #D4A843" : "1px solid #1e1e1e", fontWeight: filter===n ? "700" : "400"}}>{n}</div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading" style={{justifyContent:"center", padding:"40px"}}><i className="ti ti-loader"></i> loading viral reels...</div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"14px"}}>
          {filtered.map(reel => (
            <div key={reel.id} className="card" style={{cursor:"pointer", position:"relative"}}>
              <div style={{position:"absolute", top:"16px", right:"16px", background:"rgba(212,168,67,0.1)", border:"1px solid rgba(212,168,67,0.2)", borderRadius:"20px", padding:"3px 10px", fontSize:"11px", fontWeight:"700", color:"#D4A843"}}>{reel.score}/100</div>
              <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
                <div style={{width:"36px", height:"36px", borderRadius:"50%", background:"rgba(212,168,67,0.1)", border:"1px solid rgba(212,168,67,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:"#D4A843"}}>{reel.creator[1].toUpperCase()}</div>
                <div>
                  <div style={{fontSize:"13px", fontWeight:"600", color:"#fff"}}>{reel.creator}</div>
                  <div style={{fontSize:"11px", color:"#444"}}>{reel.niche}</div>
                </div>
              </div>
              <div style={{fontSize:"15px", fontWeight:"600", color:"#fff", marginBottom:"6px", lineHeight:"1.4"}}>{reel.title}</div>
              <div style={{fontSize:"13px", color:"#555", marginBottom:"12px", fontStyle:"italic"}}>"{reel.hook}"</div>
              <div style={{display:"flex", gap:"16px", marginBottom:"12px"}}>
                <div style={{fontSize:"12px", color:"#444"}}><i className="ti ti-eye" style={{marginRight:"4px"}}></i>{reel.views}</div>
                <div style={{fontSize:"12px", color:"#444"}}><i className="ti ti-heart" style={{marginRight:"4px"}}></i>{reel.likes}</div>
              </div>
              <div style={{display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"14px"}}>
                {reel.tags && reel.tags.map((tag,i) => (<span key={i} style={{fontSize:"11px", padding:"2px 8px", borderRadius:"20px", background:"rgba(96,165,250,0.08)", color:"#60a5fa", border:"1px solid rgba(96,165,250,0.1)"}}>{tag}</span>))}
              </div>
              <div style={{display:"flex", gap:"8px"}}>
                <button className="btn" style={{fontSize:"12px", padding:"7px 14px", flex:1}} onClick={() => window.dispatchEvent(new CustomEvent('useIdea', {detail: reel.title}))}>make similar script</button>
                <button className="btn-outline" style={{fontSize:"12px", padding:"7px 14px"}} onClick={() => window.dispatchEvent(new CustomEvent('goToIdeas', {detail: reel.title}))}>get similar ideas</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}