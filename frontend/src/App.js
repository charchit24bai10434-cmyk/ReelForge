import React, { useState } from "react";
import "./App.css";
import ScriptGenerator from "./pages/ScriptGenerator";
import IdeaGenerator from "./pages/IdeaGenerator";
import HookAnalyzer from "./pages/HookAnalyzer";
import HashtagTool from "./pages/HashtagTool";
import Translator from "./pages/Translator";
import Voiceover from "./pages/Voiceover";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";

const navItems = [
  { id: "script", label: "Script Generator", icon: "ti-sparkles", section: "Create" },
  { id: "idea", label: "Idea Generator", icon: "ti-bulb", section: "Create" },
  { id: "voiceover", label: "AI Voiceover", icon: "ti-microphone", section: "Create" },
  { id: "hook", label: "Hook Analyzer", icon: "ti-flame", section: "Create" },
  { id: "calendar", label: "30-Day Calendar", icon: "ti-calendar", section: "Grow" },
  { id: "hashtag", label: "Hashtag Research", icon: "ti-hash", section: "Grow" },
  { id: "translator", label: "Script Translator", icon: "ti-language", section: "Grow" },
  { id: "explore", label: "Explore", icon: "ti-compass", section: "You" },
  { id: "dashboard", label: "My Dashboard", icon: "ti-layout-dashboard", section: "You" },
];

function App() {
  const [active, setActive] = useState("script");
  const [prefilledTopic, setPrefilledTopic] = useState("");

  React.useEffect(() => {
    const handler = (e) => { setPrefilledTopic(e.detail); setActive("script"); };
    window.addEventListener("goToIdeas", (e) => { setPrefilledTopic(e.detail); setActive("idea"); });
    window.addEventListener("useIdea", handler);
    return () => window.removeEventListener("useIdea", handler);
  }, []);

  const pages = {
    script: <ScriptGenerator prefilledTopic={prefilledTopic} />,
    idea: <IdeaGenerator prefilledIdea={prefilledTopic} />,
    voiceover: <Voiceover />,
    hook: <HookAnalyzer />,
    calendar: <Calendar />,
    hashtag: <HashtagTool />,
    translator: <Translator />,
    explore: <Explore prefilledIdea={prefilledTopic} />,
    dashboard: <Dashboard />,
  };

  const sections = ["Create", "Grow", "You"];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-text">ReelForge</div>
          <div className="logo-sub">Creator Studio</div>
        </div>
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section">{section}</div>
            {navItems.filter(i => i.section === section).map(item => (
              <div
                key={item.id}
                className={"nav-item" + (active === item.id ? " active" : "")}
                onClick={() => setActive(item.id)}
              >
                <i className={"ti " + item.icon}></i>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="main">{pages[active]}</div>
    </div>
  );
}

export default App;