// src/api.js
// Single place for all backend calls.
// Never write fetch("http://127.0.0.1:5000/...") directly in components.
// Import { generate, regenerate, analyzeHook, ... } from "../api"

const BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

async function post(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    throw new Error("Backend returned invalid response.");
  }

  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }

  return data;
}

export const api = {
  generate: (body) => post("/generate", body),
  regenerate: (body) => post("/regenerate", body),
  analyzeHook: (hook) => post("/analyze-hook", { hook }),
  hashtags: (topic) => post("/hashtags", { topic }),
  translate: (script, language) => post("/translate", { script, language }),
  ideasSmart: (input) => post("/ideas-smart", { input }),
  expandIdea: (idea) => post("/expand-idea", { idea }),
  calendar: (niche) => post("/calendar", { niche }),
};