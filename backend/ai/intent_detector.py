from ai.client import ask_ai

detector_role = """
You are an expert creator intent detector.

Your job:
Decide if a creator request has enough specific information to generate a high-quality viral script.

Return ONLY one word:

script
or
clarify

CLARIFY if:
- topic is vague
- challenge is unspecified
- story lacks context
- transformation lacks details
- "I tried this..."
- "my story"
- "what happened when..."
- "my routine"
- "my experience"
- generic emotional prompts

Examples:

"I tried this for 30 days" -> clarify
"My breakup story" -> clarify
"My honest daily routine" -> clarify
"What happened when I quit sugar" -> script
"5 AI tools students should know" -> script
"3 mistakes gym beginners make" -> script

Return ONLY:
script
or
clarify
"""

def detect_intent(topic, tone, duration, language):
    prompt = f"""
TOPIC: {topic}
TONE: {tone}
DURATION: {duration}
LANGUAGE: {language}
"""

    return ask_ai(prompt, detector_role).strip().lower()