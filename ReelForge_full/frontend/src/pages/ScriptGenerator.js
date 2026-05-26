import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function ScriptGenerator({ prefilledTopic, onTopicConsumed }) {
  const [topic, setTopic] = useState(prefilledTopic || "");
  const [tone, setTone] = useState("");
  const [duration, setDuration] = useState("30");
  const [language, setLanguage] = useState("English");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [step, setStep] = useState(1);
  const [clarifyQuestions, setClarifyQuestions] = useState([]);
  const [clarifyAnswers, setClarifyAnswers] = useState([]);
  const [isClarifying, setIsClarifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefilledTopic) {
      setTopic(prefilledTopic);
      setStep(2);
      if (onTopicConsumed) onTopicConsumed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledTopic]);

  const tones = [
    { id: "cinematic",     label: "Cinematic",    emoji: "🎬", desc: "dramatic & powerful" },
    { id: "funny",         label: "Funny",         emoji: "😂", desc: "make them laugh" },
    { id: "raw",           label: "Raw & Real",    emoji: "💯", desc: "honest & unfiltered" },
    { id: "educational",   label: "Educational",   emoji: "🧠", desc: "teach & inform" },
    { id: "energetic",     label: "Energetic",     emoji: "⚡", desc: "high energy hype" },
    { id: "emotional",     label: "Emotional",     emoji: "❤️", desc: "touch their heart" },
    { id: "chill",         label: "Chill",         emoji: "😎", desc: "relaxed & casual" },
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
    "Reading your story...",
    "Finding the viral angle...",
    "Writing your hook...",
    "Crafting the script...",
    "Quality check in progress...",
  ];

  const estimateReadTime = (text) => {
    if (!text) return null;
    const words = text.trim().split(/\s+/).length;
    const seconds = Math.round(words / 2.5);
    return { words, seconds };
  };

  const saveToHistory = (scriptObj) => {
    try {
      const existing = JSON.parse(localStorage.getItem("reelforge_history") || "[]");
      const newEntry = {
        id: Date.now(),
        topic: topic || "Untitled",
        script: scriptObj,
        createdAt: new Date().toLocaleString()
      };
      localStorage.setItem("reelforge_history", JSON.stringify([newEntry, ...existing].slice(0, 20)));
    } catch (e) { console.error("History save failed:", e); }
  };

  const parseResult = (data) => {
    if (!data) return null;
    if (typeof data === "object" && data !== null) {
      return {
        hook: data.hook || "",
        script: data.script || "",
        cta: data.cta || "",
        caption: data.caption || "",
        hashtags: data.hashtags || ""
      };
    }
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return {
          hook: parsed.hook || "",
          script: parsed.script || "",
          cta: parsed.cta || "",
          caption: parsed.caption || "",
          hashtags: parsed.hashtags || ""
        };
      } catch (e) {}
    }
    const lines = String(data).split("\n");
    let current = "";
    const parsed = { hook: "", script: "", cta: "", caption: "", hashtags: "" };
    lines.forEach((line) => {
      const clean = line.trim();
      if (clean.startsWith("HOOK:"))     { current = "hook";     return; }
      if (clean.startsWith("SCRIPT:"))   { current = "script";   return; }
      if (clean.startsWith("CTA:"))      { current = "cta";      return; }
      if (clean.startsWith("CAPTION:"))  { current = "caption";  return; }
      if (clean.startsWith("HASHTAGS:")) { current = "hashtags"; return; }
      if (current && clean) parsed[current] += clean + " ";
    });
    return parsed;
  };

  const hasContent = (parsed) =>
    parsed && Object.values(parsed).some(v => v && v.trim().length > 0);

  const startLoadingCycle = () => {
    let idx = 0;
    setLoadingText(loadingMessages[0]);
    const interval = setInterval(() => {
      idx++;
      setLoadingText(loadingMessages[idx % loadingMessages.length]);
    }, 1400);
    return interval;
  };

  const generate = async () => {
    if (!topic.trim()) return setError("tell us what your video is about first!");
    if (!tone) return setError("pick your tone!");

    setError("");
    setResult(null);
    setIsClarifying(false);
    setClarifyQuestions([]);
    setClarifyAnswers([]);
    setLoading(true);
    const interval = startLoadingCycle();

    try {
      const data = await api.generate({ topic, tone, duration, language, platform });

      if (data.type === "clarify" && data.questions?.length > 0) {
        // Show max 2 questions — keeps it fast and prompt small
        setClarifyQuestions(data.questions.slice(0, 2));
        setClarifyAnswers(new Array(Math.min(data.questions.length, 2)).fill(""));
        setIsClarifying(true);
        setStep(3);
      } else {
        const parsed = parseResult(data.result);
        if (!hasContent(parsed)) {
          setError("AI returned empty. Please try again.");
          setStep(2);
        } else {
          setResult(parsed);
          saveToHistory(parsed);
          setStep(4);
        }
      }
    } catch (err) {
      setError(err.message || "Generation failed. Check your backend terminal.");
      setStep(2);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingText("");
    }
  };

  // Called when user clicks "generate" or "skip" on clarify screen
  // skipAnswers = true means ignore whatever they typed, just generate
  const continueGeneration = async (skipAnswers = false) => {
    setError("");
    setLoading(true);
    const interval = startLoadingCycle();

    try {
      const filledAnswers = skipAnswers
        ? []
        : clarifyAnswers.filter(a => a.trim()).map(a => a.slice(0, 100));

      const data = await api.generate({
        topic, tone, duration, language, platform,
        clarifications: filledAnswers.length > 0 ? filledAnswers : ["skip"]
      });

      // LOOP PROTECTION: if backend asks clarify again — ignore, generate anyway
      // This can never loop because we always send clarifications the second time
      const parsed = parseResult(
        data.type === "clarify" ? null : data.result
      );

      if (!hasContent(parsed)) {
        setError("AI returned empty. Please try again.");
      } else {
        setIsClarifying(false);
        setResult(parsed);
        saveToHistory(parsed);
        setStep(4);
      }
    } catch (err) {
      setError(err.message || "Generation failed. Try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingText("");
    }
  };

  const regenerate = async (modifier) => {
    setError("");
    setLoading(true);
    setLoadingText("Reworking your script...");
    try {
      const data = await api.regenerate({
        script: result, modifier, tone, duration,
        language, platform, original_topic: topic
      });
      const parsed = parseResult(data.result);
      if (hasContent(parsed)) { setResult(parsed); saveToHistory(parsed); }
      else setError("Remix returned empty. Try again.");
    } catch (err) {
      setError(err.message || "Regeneration failed.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const copySection = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const formatted = [
      result.hook     && `HOOK:\n${result.hook}`,
      result.script   && `\nSCRIPT:\n${result.script}`,
      result.cta      && `\nCTA:\n${result.cta}`,
      result.caption  && `\nCAPTION:\n${result.caption}`,
      result.hashtags && `\nHASHTAGS:\n${result.hashtags}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setResult(null); setTopic(""); setTone(""); setDuration("30");
    setLanguage("English"); setPlatform("Instagram Reels");
    setClarifyAnswers([]); setClarifyQuestions([]);
    setIsClarifying(false); setError(""); setStep(1);
  };

  const scriptReadTime = result?.script ? estimateReadTime(result.script) : null;

  const sectionMeta = {
    hook:     { label: "hook",     color: "#D4A843" },
    script:   { label: "script",   color: "#D4A843" },
    cta:      { label: "cta",      color: "#60a5fa" },
    caption:  { label: "caption",  color: "#a78bfa" },
    hashtags: { label: "hashtags", color: "#4ade80" },
  };

  const remixButtons = [
    { label: "😂 Funnier",   modifier: "Make it funnier" },
    { label: "🎬 Cinematic", modifier: "Make it more cinematic" },
    { label: "❤️ Emotional", modifier: "Make it more emotional" },
    { label: "🚀 Viral",     modifier: "Make it more viral" },
    { label: "⚡ Shorter",   modifier: "Make it shorter" },
    { label: "🔥 New Hook",  modifier: "Rewrite only the hook" },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="hero-badge">AI Script Studio</div>
        <div className="page-title">Turn your <span>idea</span> into a viral reel script</div>
        <div className="page-sub">hooks • script • CTA • captions • hashtags</div>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px", color: "#f87171", fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setError("")}>✕</span>
        </div>
      )}

      {/* STEP 1 */}
      <div className="card">
        <div className="card-title">step 1 — what is your video about?</div>
        <textarea
          placeholder="Describe your idea in detail — real events, real people, timeline, what happened. The more specific, the better the script."
          value={topic}
          onChange={(e) => { setTopic(e.target.value); if (e.target.value.length > 5) setStep(2); }}
          rows={4}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
          {examplePrompts.map((ex, i) => (
            <div key={i} onClick={() => { setTopic(ex + " "); setStep(2); }}
              style={{ fontSize: "12px", padding: "5px 12px", background: "#0e0e0e", border: "1px solid #1e1e1e", borderRadius: "20px", color: "#555", cursor: "pointer" }}>
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 2 */}
      {step >= 2 && (
        <div className="card">
          <div className="card-title">step 2 — what vibe do you want?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "8px", marginBottom: "16px" }}>
            {tones.map((t) => (
              <div key={t.id} onClick={() => setTone(t.id)} style={{
                background: tone === t.id ? "rgba(212,168,67,0.1)" : "#080808",
                border: tone === t.id ? "1px solid #D4A843" : "1px solid #1a1a1a",
                borderRadius: "10px", padding: "12px", cursor: "pointer", textAlign: "center"
              }}>
                <div style={{ fontSize: "22px" }}>{t.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: tone === t.id ? "#D4A843" : "#fff" }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: "#444" }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div className="card-title">how long?</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {["15", "30", "60", "90"].map((d) => (
              <div key={d} onClick={() => setDuration(d)} style={{
                padding: "10px 20px", cursor: "pointer", borderRadius: "10px",
                background: duration === d ? "rgba(212,168,67,0.1)" : "#080808",
                border: duration === d ? "1px solid #D4A843" : "1px solid #1a1a1a",
                color: duration === d ? "#D4A843" : "#fff"
              }}>{d} sec</div>
            ))}
          </div>

          <div className="card-title">language</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {["English", "Hindi", "Hinglish", "German", "Spanish"].map((l) => (
              <div key={l} onClick={() => setLanguage(l)} style={{
                padding: "7px 16px", borderRadius: "20px", cursor: "pointer",
                background: language === l ? "#D4A843" : "#0e0e0e",
                color: language === l ? "#080808" : "#555",
                fontWeight: language === l ? "700" : "400"
              }}>{l}</div>
            ))}
          </div>

          <div className="card-title">platform</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {["Instagram Reels", "TikTok", "YouTube Shorts", "LinkedIn"].map((p) => (
              <div key={p} onClick={() => setPlatform(p)} style={{
                padding: "7px 16px", borderRadius: "20px", cursor: "pointer",
                background: platform === p ? "#D4A843" : "#0e0e0e",
                color: platform === p ? "#080808" : "#555",
                fontWeight: platform === p ? "700" : "400"
              }}>{p}</div>
            ))}
          </div>

          <button className="btn" onClick={generate} disabled={loading}>
            {loading ? loadingText || "generating..." : "generate my script 🚀"}
          </button>
        </div>
      )}

      {/* CLARIFICATION — safe version */}
      {isClarifying && !result && (
        <div className="card">
          <div className="card-title">one sec — help AI nail this ✨</div>
          <p style={{ color: "#555", fontSize: "13px", marginBottom: "16px" }}>
            Quick answers = better script. Keep it short. You can skip if you want.
          </p>
          {clarifyQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ marginBottom: "6px", color: "#ccc", fontSize: "14px" }}>{q}</div>
              <input
                type="text"
                maxLength={100}
                placeholder="short answer (optional)..."
                value={clarifyAnswers[i] || ""}
                onChange={(e) => {
                  const updated = [...clarifyAnswers];
                  updated[i] = e.target.value;
                  setClarifyAnswers(updated);
                }}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0e0e0e", border: "1px solid #2a2a2a",
                  borderRadius: "8px", color: "#fff", fontSize: "14px",
                  fontFamily: "inherit", boxSizing: "border-box", outline: "none"
                }}
              />
              <div style={{ fontSize: "11px", color: "#333", marginTop: "3px", textAlign: "right" }}>
                {(clarifyAnswers[i] || "").length}/100
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn" onClick={() => continueGeneration(false)} disabled={loading} style={{ flex: 1 }}>
              {loading ? loadingText || "generating..." : "generate my script 🚀"}
            </button>
            <button
              className="btn-outline"
              onClick={() => continueGeneration(true)}
              disabled={loading}
              style={{ flexShrink: 0 }}
            >
              skip
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="card-title">your script is ready 🔥</div>
            <button className={`btn-outline ${copied ? "copied-btn" : ""}`} onClick={copyAll}>
              {copied ? "✓ copied!" : "copy all"}
            </button>
          </div>

          {scriptReadTime && (
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "14px", padding: "6px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <span>~{scriptReadTime.words} words</span>
              <span style={{ color: "#333" }}>·</span>
              <span>~{scriptReadTime.seconds}s spoken</span>
              {scriptReadTime.seconds > parseInt(duration) + 12 && <span style={{ color: "#f97316" }}>⚠️ may run long</span>}
              {scriptReadTime.seconds < parseInt(duration) - 12 && parseInt(duration) > 15 && <span style={{ color: "#f97316" }}>⚠️ may be too short</span>}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {remixButtons.map((btn) => (
              <button key={btn.modifier} className="btn-outline" onClick={() => regenerate(btn.modifier)} disabled={loading}>
                {loading ? "..." : btn.label}
              </button>
            ))}
          </div>

          {Object.entries(sectionMeta).map(([key, meta]) => {
            const content = result[key];
            if (!content || !content.trim()) return null;
            return (
              <div key={key} style={{ marginBottom: "12px", padding: "14px", border: "1px solid #1a1a1a", borderRadius: "12px", background: "#0b0b0b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ color: meta.color, fontWeight: 700, fontSize: "13px", letterSpacing: "1px" }}>{meta.label}</div>
                  <button className="btn-outline" style={{ fontSize: "11px", padding: "3px 10px" }} onClick={() => copySection(key, content)}>
                    {copiedSection === key ? "✓" : "copy"}
                  </button>
                </div>
                <div style={{ whiteSpace: "pre-wrap", color: "#fff", lineHeight: "1.75", fontSize: "14px" }}>{content}</div>
              </div>
            );
          })}

          <button className="btn" style={{ marginTop: "12px", width: "100%" }} onClick={resetAll}>
            make another script
          </button>
        </div>
      )}
    </div>
  );
}