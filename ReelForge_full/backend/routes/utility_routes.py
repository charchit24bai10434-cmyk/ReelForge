from flask import Blueprint, request, jsonify
from ai.client import ask_ai
import json, re

utility_bp = Blueprint("utility", __name__)


# ─── IDEAS (basic) ────────────────────────────────────────────────────────────

@utility_bp.route('/ideas', methods=['POST'])
def ideas():
    d = request.json or {}
    niche = d.get('niche', 'motivation')

    system = "You are a viral short-form content strategist for Instagram Reels and TikTok."
    prompt = f"""Generate 10 highly specific viral content ideas for niche: {niche}
Rules: specific not generic, clear viral angle, trend-aware.
Format exactly: IDEA: ... | SCORE: ..."""

    result = ask_ai(prompt, system)
    lines = [l.strip() for l in result.split('\n') if 'IDEA:' in l]
    out = []
    for line in lines:
        parts = line.split('|')
        idea = parts[0].replace('IDEA:', '').strip()
        score = parts[1].replace('SCORE:', '').strip() if len(parts) > 1 else '85'
        out.append({'idea': idea, 'score': score})
    return jsonify({'ideas': out[:10]})


# ─── ANALYZE HOOK ─────────────────────────────────────────────────────────────

@utility_bp.route('/analyze-hook', methods=['POST'])
def analyze_hook():
    d = request.json or {}
    hook = d.get('hook', '')

    system = """You are a ruthlessly honest hook analyst. Score brutally, identify what fails, rewrite better.
Return ONLY valid JSON, no markdown, no extra text."""

    prompt = f"""Analyze this hook: "{hook}"

Return ONLY valid JSON:
{{
  "score": <0-100>,
  "verdict": "<punchy one-line verdict>",
  "what_works": "<what is good or empty string>",
  "what_fails": "<specific brutal critique>",
  "scroll_reason": "<exactly why people scroll past>",
  "better_hooks": ["<rewrite 1>", "<rewrite 2>", "<rewrite 3>"],
  "pro_tip": "<one actionable insight>"
}}

CRITICAL: Start with {{ end with }}. No markdown."""

    try:
        result = ask_ai(prompt, system, json_mode=True)
        return jsonify({'result': result})
    except Exception as e:
        raw = ask_ai(prompt, system)
        return jsonify({'result': raw, 'raw': True})


# ─── HASHTAGS ─────────────────────────────────────────────────────────────────

@utility_bp.route('/hashtags', methods=['POST'])
def hashtags():
    d = request.json or {}
    topic = d.get('topic', '')

    system = """You are a social media SEO expert for Instagram and TikTok hashtag strategy.
Return ONLY valid JSON, no markdown, no extra text."""

    prompt = f"""Create optimal hashtag strategy for: {topic}

Return ONLY valid JSON:
{{
  "mega": ["tag1", "tag2", "tag3"],
  "macro": ["tag1", "tag2", "tag3", "tag4"],
  "micro": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "niche": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "strategy": "<2-3 sentences on how to use these>",
  "best_combo": ["8-10 best tags for one post"]
}}

No # symbol in values. CRITICAL: Start with {{ end with }}."""

    try:
        result = ask_ai(prompt, system, json_mode=True)
        return jsonify({'result': result})
    except Exception as e:
        raw = ask_ai(prompt, system)
        return jsonify({'result': raw, 'raw': True})


# ─── TRANSLATE ────────────────────────────────────────────────────────────────

@utility_bp.route('/translate', methods=['POST'])
def translate():
    d = request.json or {}
    script = d.get('script', '')
    language = d.get('language', 'Hindi')

    system = f"""You are a native {language} content creator translating short-form video scripts.
Sound completely native. Preserve emotional energy and punchy rhythm. Not word-for-word literal."""

    prompt = f"""Translate this reel script to {language}:

{script}

Return the translated script only. No labels, no explanations."""

    result = ask_ai(prompt, system, temperature=0.4)
    return jsonify({'result': result})


# ─── CALENDAR ─────────────────────────────────────────────────────────────────

@utility_bp.route('/calendar', methods=['POST'])
def calendar():
    d = request.json or {}
    niche = d.get('niche', 'motivation')

    system = """You are a creator growth strategist building viral content calendars.
Each day must be specific and actionable. Mix formats: educational, story, opinion, trending, relatable."""

    prompt = f"""Create a 30-day viral content calendar for: {niche}

Format each day exactly as:
Day N: [FORMAT] — [SPECIFIC IDEA]

Formats: Storytime | Opinion | Tutorial | Trend | BTS | Challenge | Day-in-Life | Hot Take

Rules: specific enough to film tomorrow, vary formats, no vague ideas."""

    result = ask_ai(prompt, system, temperature=0.6, max_tokens=1500)
    return jsonify({'result': result})


# ─── IDEAS SMART ──────────────────────────────────────────────────────────────

@utility_bp.route('/ideas-smart', methods=['POST'])
def ideas_smart():
    d = request.json or {}
    user_input = d.get('input', '')

    # FIX: use JSON array format — mixtral handles this more reliably than --- separators
    system = """You are a viral content strategist. Generate exactly 8 specific viral content ideas.
Return ONLY a valid JSON array. No markdown, no extra text before or after.
Start your response with [ and end with ]."""

    prompt = f"""Creator said: "{user_input}"

Generate exactly 8 highly specific viral content ideas. Be very specific with titles.
Bad: "Share your morning routine" 
Good: "I woke up at 4:30am for 90 days — here's what actually happened to my body"

Return ONLY a JSON array of exactly 8 objects:
[
  {{"title": "specific video title/hook", "why": "why this angle is viral", "format": "Storytime/Tutorial/Opinion/BTS/Challenge/Hot Take", "viral": "High", "trend": "what makes this timely"}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}},
  {{"title": "...", "why": "...", "format": "...", "viral": "High/Medium", "trend": "..."}}
]

CRITICAL: Return ONLY the JSON array. Start with [ and end with ]. No other text."""

    try:
        result = ask_ai(prompt, system, temperature=0.7, max_tokens=1500)

        # Attempt 1: direct parse
        try:
            ideas = json.loads(result.strip())
            if isinstance(ideas, list) and len(ideas) > 0:
                return jsonify({'ideas': ideas[:8]})
        except Exception:
            pass

        # Attempt 2: find [ ... ] block
        try:
            start = result.index('[')
            end = result.rindex(']') + 1
            ideas = json.loads(result[start:end])
            if isinstance(ideas, list) and len(ideas) > 0:
                return jsonify({'ideas': ideas[:8]})
        except Exception:
            pass

        # Attempt 3: fallback --- text parsing
        blocks = result.split('---')
        ideas = []
        for block in blocks:
            if not block.strip():
                continue
            lines = block.strip().split('\n')
            idea = {}
            for line in lines:
                line = line.strip()
                for key in ['title', 'why', 'format', 'viral', 'trend']:
                    if line.lower().startswith(f'{key}:'):
                        idea[key] = line.split(':', 1)[1].strip()
            if idea.get('title'):
                ideas.append(idea)

        return jsonify({'ideas': ideas})

    except Exception as e:
        print(f"IDEAS-SMART ERROR: {e}")
        return jsonify({'ideas': [], 'error': str(e)})


# ─── EXPAND IDEA ──────────────────────────────────────────────────────────────

@utility_bp.route('/expand-idea', methods=['POST'])
def expand_idea():
    d = request.json or {}
    idea = d.get('idea', '')

    system = """You are a creator strategist turning ideas into production briefs.
Be specific and actionable. No generic advice."""

    prompt = f"""Expand this content idea into a full brief:
"{idea}"

Return:

HOOK OPTIONS:
- [hook 1]
- [hook 2]
- [hook 3]

SCRIPT OUTLINE:
[4-6 beat outline]

FILMING SHOTS:
[specific practical shots]

WHY IT'S VIRAL:
[emotional/psychological trigger]

PLATFORM FIT:
[Instagram/TikTok/YouTube Shorts — which and why]

BEST TIME TO POST:
[day and time with reason]"""

    result = ask_ai(prompt, system, temperature=0.6, max_tokens=700)
    return jsonify({'result': result})


# ─── VOICEOVER ────────────────────────────────────────────────────────────────

@utility_bp.route('/voiceover', methods=['POST'])
def voiceover():
    return jsonify({'error': 'Voiceover coming soon!'})