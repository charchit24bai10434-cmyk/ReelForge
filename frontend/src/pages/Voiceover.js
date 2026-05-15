import React, { useState } from "react";

export default function Voiceover() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("Google UK English Male");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const voices = [
    { id: "Google UK English Male", name: "Alex", desc: "deep and cinematic, perfect for dramatic reels" },
    { id: "Google UK English Female", name: "Nova", desc: "energetic and youthful, great for Gen-Z content" },
    { id: "Google US English", name: "Echo", desc: "neutral and clear, great for educational content" },
    { id: "Google hindi", name: "Priya", desc: "warm Hindi voice, perfect for Indian content" },
  ];

  const speak = () => {
    if (!script) return alert("paste your script first!");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    const allVoices = window.speechSynthesis.getVoices();
    const selected = allVoices.find(v => v.name.includes("UK English Male")) || allVoices[0];
    utterance.voice = selected;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">give your script <span>a voice</span></div>
        <div className="page-sub">pick a voice, paste your script, preview it instantly — free!</div>
      </div>
      <div className="card">
        <div className="card-title">pick your voice</div>
        {voices.map(v => (
          <div key={v.id} className={"voice-option" + (voice === v.id ? " selected" : "")} onClick={() => setVoice(v.id)}>
            <div className="voice-avatar"><i className="ti ti-user"></i></div>
            <div>
              <div className="voice-name">{v.name}</div>
              <div className="voice-desc">{v.desc}</div>
            </div>
            {voice === v.id && <i className="ti ti-check" style={{marginLeft:"auto", color:"#D4A843"}}></i>}
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">paste your script</div>
        <textarea placeholder="paste the script you want to hear..." value={script} onChange={e => setScript(e.target.value)} rows={5} />
        <div style={{display:"flex", gap:"12px"}}>
          <button className="btn" onClick={speak} disabled={speaking}>
            {speaking ? "playing..." : "play voiceover"}
          </button>
          {speaking && <button className="btn-outline" onClick={stop}>stop</button>}
        </div>
        {speaking && <div className="loading"><i className="ti ti-loader"></i> playing your script...</div>}
      </div>
      <div className="card">
        <div className="card-title">pro tip</div>
        <p style={{fontSize:"13px", color:"#555", lineHeight:"1.8"}}>
          Use your browser voiceover to preview how your reel sounds. For professional MP3 downloads, premium TTS APIs like ElevenLabs give the most natural voices.
        </p>
      </div>
    </div>
  );
}