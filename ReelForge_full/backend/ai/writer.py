from ai.client import ask_ai
import json
from ai.guardian import improve_script


writer_role = """You are an elite viral short-form video script writer.
 
STORY MODE: If creator gave real events/people/timeline — use EVERY specific detail. Write as spoken word, not prose. Short punchy sentences 3-8 words each.
 
TOPIC MODE: If creator gave a theme — stay universally relatable. Don't invent fake personal details.
 
HOOK RULES:
- Never reveal the outcome in the hook
- Use tension, stakes, or the lie — not the result
- Max 12 words, one punchy idea
- Good: "I lied to my sister for 4 hours."
- Bad: "I surprised my sister with a new iPhone."
 
SCRIPT STYLE (spoken word):
- Short sentences, natural pauses
- Fragments are fine
- NOT flowing prose paragraphs
 
CTA: Sound human. Not "share your story in the comments."
 
CAPTION: 1-2 lines, short and punchy.
 
HASHTAGS: 6-10 relevant ones.
 
Return ONLY valid JSON:
{"hook": "...", "script": "...", "cta": "...", "caption": "...", "hashtags": "..."}"""


def _detect_story_mode(topic):
    topic_lower = topic.lower()

    strong_story_signals = [
        "i woke", "i bought", "i told", "i sent", "i lied",
        "my sister", "my brother", "my friend", "my mom", "my dad",
        "walked in", "came back", "surprised"
    ]

    weak_story_signals = [
        "7am", "8am", "hours", "minutes", "then i", "after that", "when she", "when he"
    ]

    strong = sum(1 for s in strong_story_signals if s in topic_lower)
    weak = sum(1 for s in weak_story_signals if s in topic_lower)

    return strong >= 1 or (strong == 0 and weak >= 3)

def _max_tokens(duration):
    token_map = {
        "15": 350,
        "30": 500,
        "60": 800,
        "90": 1200
    }
    return token_map.get(str(duration), 1000)

def _word_target(duration):
    targets = {"15": "35", "30": "70", "60": "130", "90": "200"}
    return targets.get(str(duration), "130")


def generate_script(topic, tone, duration, language, platform, extra_context=""):
    """
    Generate directly from topic — no strategist in the path.
    Strategist compresses real story details before writer sees them.
    """
    is_story = _detect_story_mode(topic)

    if is_story:
        mode_block = f"""
MODE: STORY MODE — ACTIVATED

This creator gave real events with specific details.
Your job: turn their story into a SPOKEN-WORD short-form script.

CRITICAL OBLIGATIONS:
1. Preserve every real detail (times, people, actions, outcomes)
2. Write in SHORT punchy sentences — 3 to 8 words each
3. NOT as flowing prose — as natural spoken camera talk
4. Hook must tease the tension/lie/stakes — NOT reveal the outcome
5. Build toward the emotional peak at the end

CREATOR'S STORY (use ALL of this detail):
{topic[:600]}
"""
    else:
        mode_block = f"""
MODE: TOPIC MODE — ACTIVATED

Creator gave a theme or topic without detailed personal events.
Write with universally relatable experiences.
Do NOT invent fake personal details, routines, or memories.

TOPIC:
{topic[:600]}
"""
    
    tone_rules = {
    "cinematic": "dramatic, emotional tension, vivid storytelling, premium feel",
    "funny": "humorous, witty, playful, relatable comedy, punchy timing",
    "raw": "honest, unfiltered, direct, natural spoken language",
    "educational": "clear, informative, high-retention, easy to understand",
    "energetic": "fast-paced, hype, exciting, high momentum",
    "emotional": "heartfelt, emotionally resonant, human vulnerability",
    "chill": "casual, relaxed, effortless conversational tone",
    "inspirational": "uplifting, motivating, emotionally strong"
}

    selected_tone_rule = tone_rules.get(tone.lower(), "natural creator-native delivery")

    prompt = f"""
{mode_block}

SELECTED TONE:
{tone}

TONE BEHAVIOR RULE:
{selected_tone_rule}

DURATION:
{duration} seconds (target word count: {_word_target(duration)} words)

LANGUAGE:
{language}

PLATFORM:
{platform}

{f"ADDITIONAL CONTEXT: {extra_context}" if extra_context else ""}

CRITICAL:
The script MUST strongly reflect the selected tone.

Write the final creator-ready script now.
Return ONLY valid JSON.
"""

    draft = ask_ai(
        prompt,
        writer_role,
        smart=True,
        temperature=0.58,
        max_tokens=_max_tokens(duration),
        json_mode=True
    )

    return improve_script(draft, topic)


def regenerate_script(original_script, modifier, tone, duration, language, platform, original_topic=""):
    """
    Remix an existing script while preserving all real story details.
    """
    prompt = f"""
ORIGINAL SCRIPT:
{original_script}

MODIFICATION REQUEST:
{modifier}

TONE: {tone}
DURATION: {duration} seconds (target: {_word_target(duration)} words)
LANGUAGE: {language}
PLATFORM: {platform}

{f"ORIGINAL STORY FOR CONTEXT (preserve these real details): {original_topic}" if original_topic else ""}

RULES:
- Apply the modification to style, energy, and delivery
- Keep ALL specific real details from the original story
- Keep the spoken-word style — short punchy lines, not prose paragraphs
- Hook must NOT reveal the outcome — create tension instead
- CTA must sound like a real human, not an AI template
- Return ONLY valid JSON
"""

    draft = ask_ai(
        prompt,
        writer_role,
        smart=True,
        temperature=0.58,
        max_tokens=_max_tokens(duration)
    ,
        json_mode=True
    )

    return improve_script(draft, original_topic or str(original_script))