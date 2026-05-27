# ReelForge — AI Creator Studio

> Turn your idea into a viral reel script in seconds.

**Live Demo:** [reel-forge-beta.vercel.app](https://reel-forge-beta.vercel.app)

---

## What is ReelForge?

ReelForge is a full-stack AI-powered content creation studio built for short-form creators on Instagram Reels, TikTok, and YouTube Shorts.

It takes a raw idea or story from the creator and generates a complete, platform-ready script — hook, script, CTA, caption, and hashtags — in the creator's own voice.

---

## Features

- **Script Generator** — AI generates viral scripts with hooks, CTAs, captions and hashtags
- **Idea Generator** — Generate 8 specific viral content ideas from a single prompt
- **Hook Analyzer** — Rate, roast, and rewrite your hook with AI feedback
- **30-Day Calendar** — Generate a full month content plan with format color coding and streak tracking
- **Hashtag Research** — Tiered hashtag strategy (mega/macro/micro/niche)
- **Script Translator** — Translate scripts to 8 languages while preserving energy
- **Export** — Download your script as .txt instantly
- **Mobile Responsive** — Full mobile support with slide-in sidebar

---

## Tech Stack

**Frontend**
- React.js
- CSS (custom design system, no UI library)
- Deployed on Vercel

**Backend**
- Python + Flask
- NVIDIA NIM API (Mistral 7B)
- Multi-agent AI pipeline: Clarifier → Writer → Guardian
- Deployed on Render

**AI Architecture**
```
User Input
    ↓
Clarifier (asks for missing details if topic is vague)
    ↓
Writer (generates script with story-mode detection)
    ↓
Guardian (quality review — fixes hooks, CTAs, banned phrases)
    ↓
Output
```

---

## AI Pipeline Design

The script generation uses a 3-agent pipeline:

**1. Clarifier** — Detects if the topic has enough detail. If vague, asks 1-2 targeted questions (max 100 chars each to prevent prompt bloat).

**2. Writer** — Automatically detects STORY MODE vs TOPIC MODE:
- Story Mode: preserves every real detail (times, people, actions) in spoken-word style
- Topic Mode: writes universally relatable content without inventing fake personal details

**3. Guardian** — Reviews output for quality:
- Fixes hooks that reveal the ending
- Removes AI clichés and banned phrases
- Ensures CTA sounds human not robotic
- Preserves real story details vs removing AI hallucinations

---

## Running Locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
# Create .env with NVIDIA_API_KEY=your_key
python app.py
```

**Frontend**
```bash
cd frontend
npm install
# Create .env with REACT_APP_API_URL=http://127.0.0.1:5000
npm start
```

---

## Project Structure

```
ReelForge/
├── backend/
│   ├── ai/
│   │   ├── client.py        # NVIDIA API client with retry + fallback
│   │   ├── clarifier.py     # Detects vague topics, asks questions
│   │   ├── writer.py        # Story/topic mode script generation
│   │   └── guardian.py      # Quality review and improvement
│   ├── routes/
│   │   ├── generate_routes.py   # /generate, /regenerate
│   │   └── utility_routes.py    # /ideas, /hashtags, /translate etc.
│   └── app.py               # Flask app with rate limiting
├── frontend/
│   └── src/
│       ├── pages/           # All page components
│       ├── api.js           # Centralized API client
│       ├── App.js           # Routing and layout
│       └── App.css          # Full design system + mobile breakpoints
```

---

## Key Engineering Decisions

**Why a multi-agent pipeline?**
Single-prompt generation produces generic output. The 3-agent approach separates concerns — clarification, generation, and quality review — producing significantly better results.

**Why story-mode detection?**
The biggest problem with AI script tools is they summarize real stories into vague abstractions. Story-mode detection preserves every specific detail the creator provides, which is what makes content feel authentic.

**Why NVIDIA NIM API?**
Open-source models via NVIDIA's API provide free inference for development. The client includes automatic retry logic, model fallback (tries 3 different models if primary is degraded), and aggressive JSON fixing for malformed responses.

---

## Built By

**Charchit Bari**
B.Tech AIML — VIT Bhopal, 2nd Year

[GitHub](https://github.com/charchit24bai10434-cmyk) · [LinkedIn](https://www.linkedin.com/in/charchit-bari-358364300/)