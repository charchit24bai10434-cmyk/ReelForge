import React, { useState, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName] = useState("Charchit");
  const [tempName, setTempName] = useState("Charchit");

  useEffect(() => {
    const useIdeaHandler = (e) => {
      setPrefilledTopic(e.detail);
      setActive("script");
    };

    const goToIdeasHandler = (e) => {
      setPrefilledTopic(e.detail);
      setActive("idea");
    };

    const closeMenus = () => {
      setShowQuickActions(false);
      setShowNotifications(false);
      setShowProfileMenu(false);
    };

    window.addEventListener("useIdea", useIdeaHandler);
    window.addEventListener("goToIdeas", goToIdeasHandler);
    document.addEventListener("click", closeMenus);

    return () => {
      window.removeEventListener("useIdea", useIdeaHandler);
      window.removeEventListener("goToIdeas", goToIdeasHandler);
      document.removeEventListener("click", closeMenus);
    };
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    if (q.includes("hook")) return setActive("hook");
    if (q.includes("translate")) return setActive("translator");
    if (q.includes("calendar") || q.includes("30 day")) return setActive("calendar");
    if (q.includes("hashtag")) return setActive("hashtag");
    if (q.includes("voice")) return setActive("voiceover");

    if (q.includes("idea") || q.includes("content") || q.includes("viral")) {
      setPrefilledTopic(searchQuery);
      return setActive("idea");
    }

    if (q.includes("script") || q.includes("write") || q.includes("reel")) {
      const cleaned = searchQuery
        .replace(/write script about/i, "")
        .replace(/script about/i, "")
        .trim();

      setPrefilledTopic(cleaned || searchQuery);
      return setActive("script");
    }

    setPrefilledTopic(searchQuery);
    setActive("script");
  };

  const quickAction = (action) => {
    setShowQuickActions(false);

    switch (action) {
      case "ideas":
        setActive("idea");
        break;
      case "hook":
        setActive("hook");
        break;
      case "translate":
        setActive("translator");
        break;
      case "calendar":
        setActive("calendar");
        break;
      case "script":
        setActive("script");
        break;
      default:
        setActive("script");
    }
  };

  const resetApp = () => {
    setActive("script");
    setPrefilledTopic("");
    setSearchQuery("");
    setShowQuickActions(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setShowSettings(false);
  };

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
    <div className="app bg-black min-h-screen text-white">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-text">ReelForge</div>
          <div className="logo-sub">AI Creator Studio</div>
        </div>

        {sections.map((section) => (
          <div key={section}>
            <div className="nav-section">{section}</div>

            {navItems
              .filter((i) => i.section === section)
              .map((item) => (
                <div
                  key={item.id}
                  className={"nav-item" + (active === item.id ? " active" : "")}
                  onClick={() => setActive(item.id)}
                >
                  <i className={"ti " + item.icon}></i>
                  <span>{item.label}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="main-shell">
        <div className="topbar">
          <div className="search-box">
            <i className="ti ti-search"></i>

            <input
              type="text"
              placeholder="Search tools, ideas, scripts..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <div className="topbar-actions">
            <div style={{ position: "relative" }}>
              <button
                className="topbar-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowQuickActions(false);
                  setShowProfileMenu(false);
                }}
              >
                <i className="ti ti-bell"></i>
              </button>

              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "14px",
                  padding: "10px",
                  minWidth: "260px",
                  zIndex: 9999
                }}>
                  <div style={{ padding: "10px", color: "#fff" }}>🔔 No notifications yet</div>
                  <div style={{ padding: "10px", color: "#777", fontSize: "13px" }}>
                    Future AI updates will appear here
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="topbar-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
              >
                <i className="ti ti-sparkles"></i>
              </button>

              {showQuickActions && (
                <div style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "14px",
                  padding: "10px",
                  minWidth: "220px",
                  zIndex: 9999
                }}>
                  {[
                    { label: "🚀 Generate Viral Ideas", action: "ideas" },
                    { label: "🔥 Analyze Hook", action: "hook" },
                    { label: "🌍 Translate Script", action: "translate" },
                    { label: "📅 30-Day Calendar", action: "calendar" },
                    { label: "🎬 New Script", action: "script" },
                  ].map((item) => (
                    <div
                      key={item.action}
                      onClick={() => quickAction(item.action)}
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        color: "#fff"
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <div
                className="profile-chip"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                  setShowQuickActions(false);
                  setShowNotifications(false);
                }}
              >
                <div className="avatar">{displayName.charAt(0)}</div>
                <span>{displayName}</span>
              </div>

              {showProfileMenu && (
                <div style={{
                  position: "absolute",
                  top: "60px",
                  right: 0,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "14px",
                  padding: "10px",
                  minWidth: "220px",
                  zIndex: 9999
                }}>
                  <div
                    style={{ padding: "12px", cursor: "pointer", color: "#fff" }}
                    onClick={() => setActive("dashboard")}
                  >
                    📊 My Dashboard
                  </div>

                  <div
                    style={{ padding: "12px", cursor: "pointer", color: "#fff" }}
                    onClick={() => setActive("explore")}
                  >
                    🧭 Explore
                  </div>

                  <div
                    style={{ padding: "12px", cursor: "pointer", color: "#fff" }}
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowSettings(true);
                    }}
                  >
                    ⚙️ Settings
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="main">
          {pages[active]}
        </div>
      </div>

      {showSettings && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000
        }}>
          <div style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "18px",
            padding: "24px",
            width: "420px"
          }}>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>Settings</h2>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "#888", marginBottom: "8px" }}>Display Name</div>
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "10px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px", color: "#fff" }}>
              API Status: <span style={{ color: "#4ade80" }}>● Connected</span>
            </div>

            <button
              className="btn"
              style={{ width: "100%", marginBottom: "10px" }}
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>

            <button
              className="btn"
              style={{ width: "100%", marginBottom: "10px" }}
              onClick={resetApp}
            >
              Reset App State
            </button>

            <button
              className="btn"
              style={{ width: "100%", marginBottom: "10px" }}
              onClick={() => {
                setDisplayName(tempName || "Charchit");
                setShowSettings(false);
              }}
            >
              Save Settings
            </button>

            <button
              className="btn-outline"
              style={{ width: "100%" }}
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;