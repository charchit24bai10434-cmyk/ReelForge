import React, { useState, useEffect } from "react";

export default function ScriptGenerator({ prefilledTopic }) {
const [topic, setTopic] = useState(prefilledTopic || "");
const [tone, setTone] = useState("");
const [duration, setDuration] = useState("30");
const [language, setLanguage] = useState("English");
const [platform, setPlatform] = useState("Instagram Reels");
const [result, setResult] = useState("");
const [loading, setLoading] = useState(false);
const [loadingText, setLoadingText] = useState("");
const [step, setStep] = useState(1);
const [clarifyQuestions, setClarifyQuestions] = useState([]);
const [clarifyAnswers, setClarifyAnswers] = useState([]);
const [isClarifying, setIsClarifying] = useState(false);
const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefilledTopic) {
      setTopic(prefilledTopic);
      setStep(2);
    }
  }, [prefilledTopic]);

  const tones = [
    { id: "cinematic", label: "Cinematic", emoji: "🎬", desc: "dramatic & powerful" },
    { id: "funny", label: "Funny", emoji: "😂", desc: "make them laugh" },
    { id: "raw", label: "Raw & Real", emoji: "💯", desc: "honest & unfiltered" },
    { id: "educational", label: "Educational", emoji: "🧠", desc: "teach & inform" },
    { id: "energetic", label: "Energetic", emoji: "⚡", desc: "high energy hype" },
    { id: "emotional", label: "Emotional", emoji: "❤️", desc: "touch their heart" },
    { id: "chill", label: "Chill", emoji: "😎", desc: "relaxed & casual" },
    { id: "inspirational", label: "Inspirational", emoji: "🌟", desc: "move people" },
  ];

  const examplePrompts = [
    "I failed and bounced back",
    "my honest daily routine",
    "things nobody tells you about",
    "I tried this for 30 days",
    "unpopular opinion about"
  ];

  const loadingMessages = [
    "Analyzing your idea...",
    "Finding viral angle...",
    "Crafting hooks...",
    "Writing final script..."
  ];

  const saveToHistory = (scriptText) => {
    try {
      const existing = JSON.parse(localStorage.getItem("reelforge_history") || "[]");

      const newEntry = {
        id: Date.now(),
        topic: topic || "Untitled Script",
        script: scriptText,
        createdAt: new Date().toLocaleString()
      };

      const updated = [newEntry, ...existing].slice(0, 20);

      localStorage.setItem("reelforge_history", JSON.stringify(updated));
    } catch (err) {
      console.error("History save failed:", err);
    }
  };

const parseResult = (text) => {
  if (!text) return null;

  // New JSON response support
  if (typeof text === "object") {
    return {
      hook: text.hook || "",
      script: text.script || "",
      cta: text.cta || "",
      caption: text.caption || "",
      hashtags: text.hashtags || ""
    };
  }

  // Legacy text parsing fallback
  const lines = text.split("\n");

  let current = "";
  const parsed = {
    hook: "",
    script: "",
    cta: "",
    caption: "",
    hashtags: ""
  };

  lines.forEach((line) => {
    const clean = line.trim();

    if (clean.startsWith("HOOK:")) {
      current = "hook";
      return;
    }

    if (clean.startsWith("SCRIPT:")) {
      current = "script";
      return;
    }

    if (clean.startsWith("CTA:")) {
      current = "cta";
      return;
    }

    if (clean.startsWith("CAPTION:")) {
      current = "caption";
      return;
    }

    if (clean.startsWith("HASHTAGS:")) {
      current = "hashtags";
      return;
    }

    if (current && clean) {
      parsed[current] += clean + " ";
    }
  });

  return parsed;
};
  const generate = async () => {
    if (!topic.trim()) return alert("tell us what your video is about first!");
    if (!tone) return alert("pick your tone!");

    setLoading(true);
    setResult("");

    let idx = 0;

    const interval = setInterval(() => {
      setLoadingText(loadingMessages[idx % loadingMessages.length]);
      idx++;
    }, 1200);

    try {
      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          duration,
          language,
          platform
        })
      });

      const data = await res.json();
      if (!res.ok) {
      console.log(data);
      throw new Error("backend failed");
      }
      if (data.type === "clarify") {
        setClarifyQuestions(data.questions);
        setClarifyAnswers(new Array(data.questions.length).fill(""));
        setIsClarifying(true);
        setStep(3);
      } else {
        setIsClarifying(false);
        setResult(data.result);
        saveToHistory(data.result);
        setStep(4);
      }
    } catch {
      setResult("⚠️ AI hiccuped. Retry in a sec.");
      setStep(4);
    }

    clearInterval(interval);
    setLoading(false);
    setLoadingText("");
  };

  const continueGeneration = async () => {
    if (clarifyAnswers.some((a) => !a.trim())) {
      return alert("please answer all clarification questions");
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          duration,
          language,
          platform,
          clarifications: clarifyAnswers
        })
      });

      const data = await res.json();

      setIsClarifying(false);
      setResult(data.result);
      saveToHistory(data.result);
      setStep(4);
    } catch {
      setResult("⚠️ AI hiccuped. Retry in a sec.");
    }

    setLoading(false);
  };

  const sections = result ? parseResult(result) : {};
  const regenerate = async (modifier) => {
  setLoading(true);
  setLoadingText(`AI is ${modifier.toLowerCase()}...`);

  try {
    const res = await fetch("http://127.0.0.1:5000/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: result,
        modifier,
        tone,
        duration,
        language,
        platform
      })
    });

    const data = await res.json();

if (!res.ok) {
  throw new Error(data.error || "backend failed");
}

     setResult(data.result);
     saveToHistory(data.result);
  } 
  catch (err) {
  console.error(err);
  alert("regeneration failed - check backend terminal");
}

  setLoading(false);
  setLoadingText("");
};

  return (
    <div>
      <div className="page-header">
        <div className="hero-badge">AI Script Studio</div>
        <div className="page-title">
          Turn your <span>idea</span> into a viral reel script
        </div>
        <div className="page-sub">
          hooks • script • CTA • captions • hashtags
        </div>
      </div>

      <div className="card">
        <div className="card-title">step 1 — what is your video about?</div>

        <textarea
          placeholder="Describe your video idea..."
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (e.target.value.length > 5) setStep(2);
          }}
          rows={3}
        />

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "10px"
        }}>
          {examplePrompts.map((ex, i) => (
            <div
              key={i}
              onClick={() => {
                setTopic(ex + " ");
                setStep(2);
              }}
              style={{
                fontSize: "12px",
                padding: "5px 12px",
                background: "#0e0e0e",
                border: "1px solid #1e1e1e",
                borderRadius: "20px",
                color: "#555",
                cursor: "pointer"
              }}
            >
              {ex}
            </div>
          ))}
        </div>
      </div>

      {step >= 2 && (
        <div className="card">
          <div className="card-title">step 2 — what vibe do you want?</div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))",
            gap: "8px",
            marginBottom: "16px"
          }}>
            {tones.map((t) => (
              <div
                key={t.id}
                onClick={() => setTone(t.id)}
                style={{
                  background: tone === t.id ? "rgba(212,168,67,0.1)" : "#080808",
                  border: tone === t.id ? "1px solid #D4A843" : "1px solid #1a1a1a",
                  borderRadius: "10px",
                  padding: "12px",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "22px" }}>{t.emoji}</div>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: tone === t.id ? "#D4A843" : "#fff"
                }}>
                  {t.label}
                </div>
                <div style={{ fontSize: "10px", color: "#444" }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="card-title">how long?</div>

          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            {["15", "30", "60", "90"].map((d) => (
              <div
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  borderRadius: "10px",
                  background: duration === d ? "rgba(212,168,67,0.1)" : "#080808",
                  border: duration === d ? "1px solid #D4A843" : "1px solid #1a1a1a"
                }}
              >
                {d} sec
              </div>
            ))}
          </div>

          <div className="card-title">language</div>

          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            {["English", "Hindi", "Hinglish", "German", "Spanish"].map((l) => (
              <div
                key={l}
                onClick={() => setLanguage(l)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  background: language === l ? "#D4A843" : "#0e0e0e",
                  color: language === l ? "#080808" : "#555"
                }}
              >
                {l}
              </div>
            ))}
          </div>

          <div className="card-title">platform</div>

          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            {["Instagram Reels", "TikTok", "YouTube Shorts", "LinkedIn"].map((p) => (
              <div
                key={p}
                onClick={() => setPlatform(p)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  background: platform === p ? "#D4A843" : "#0e0e0e",
                  color: platform === p ? "#080808" : "#555"
                }}
              >
                {p}
              </div>
            ))}
          </div>

          <button className="btn" onClick={generate} disabled={loading}>
            {loading ? loadingText : "generate my script 🚀"}
          </button>
        </div>
      )}

      {isClarifying && (
        <div className="card">
          <div className="card-title">help AI understand your idea better ✨</div>

          {clarifyQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ marginBottom: "8px", color: "#fff" }}>{q}</div>

              <textarea
                rows={2}
                value={clarifyAnswers[i]}
                onChange={(e) => {
                  const updated = [...clarifyAnswers];
                  updated[i] = e.target.value;
                  setClarifyAnswers(updated);
                }}
              />
            </div>
          ))}

          <button className="btn" onClick={continueGeneration} disabled={loading}>
            {loading ? "generating..." : "continue generating 🚀"}
          </button>

        </div>
      )}

      {result && !isClarifying && (
        <div className="card">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px"
          }}>
            <div className="card-title">your script is ready 🔥</div>

           <button
  className={`btn-outline ${copied ? "copied-btn" : ""}`}
  onClick={() => {
    const formatted = `
HOOK:
${result.hook || ""}

SCRIPT:
${result.script || ""}

CTA:
${result.cta || ""}

CAPTION:
${result.caption || ""}

HASHTAGS:
${result.hashtags || ""}
    `.trim();

    navigator.clipboard.writeText(formatted);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }}
>
  {copied ? "✓ copied!" : "copy all"}
</button>
          </div>
<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "16px"
}}>
  <button
    className="btn-outline"
    onClick={() => regenerate("Make it funnier")}
  >
    😂 Funnier
  </button>

  <button
    className="btn-outline"
    onClick={() => regenerate("Make it more cinematic")}
  >
    🎬 Cinematic
  </button>

  <button
    className="btn-outline"
    onClick={() => regenerate("Make it more emotional")}
  >
    ❤️ Emotional
  </button>

  <button
    className="btn-outline"
    onClick={() => regenerate("Make it more viral")}
  >
    🚀 Viral
  </button>

  <button
    className="btn-outline"
    onClick={() => regenerate("Make it shorter")}
  >
    ⚡ Shorter
  </button>

  <button
    className="btn-outline"
    onClick={() => regenerate("Rewrite only the hook")}
  >
    🔥 Hook
  </button>
</div>
          {Object.entries(sections).map(([title, content]) =>
            content ? (
              <div
                key={title}
                style={{
                  marginBottom: "16px",
                  padding: "14px",
                  border: "1px solid #1a1a1a",
                  borderRadius: "12px",
                  background: "#0b0b0b"
                }}
              >
                <div style={{
                  color: "#D4A843",
                  fontWeight: 700,
                  marginBottom: "8px"
                }}>
                  {title}
                </div>

                <div style={{
                  whiteSpace: "pre-wrap",
                  color: "#fff"
                }}>
                  {content}
                </div>
              </div>
            ) : null
          )}

          <button
            className="btn"
            style={{ marginTop: "12px", width: "100%" }}
            onClick={() => {
              setResult("");
              setTopic("");
              setTone("");
              setDuration("30");
              setLanguage("English");
              setPlatform("Instagram Reels");
              setClarifyAnswers([]);
              setClarifyQuestions([]);
              setIsClarifying(false);
              setStep(1);
            }}
          >
            make another script
          </button>
        </div>
      )}
    </div>
  );
}