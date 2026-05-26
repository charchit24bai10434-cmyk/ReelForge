from ai.client import ask_ai

detector_role = """
You are an expert creator intent detector for a short-form video script tool.

Your job:
Decide if a creator request has enough specific information to generate a high-quality viral script.

Return ONLY one word: script OR clarify

KEY DISTINCTION — This is critical:

TYPE A — Vague prompts (need clarification):
These are missing the actual story/content. The writer would have to INVENT details.
- "my morning routine" (which routine? what happens?)
- "I tried this for 30 days" (tried WHAT?)
- "my breakup story" (what happened?)
- "self improvement gets lonely" (no context at all)
- "my fitness journey" (vague)

TYPE B — Detailed personal stories (ready to generate):
These contain REAL events, timeline, people, actions. The writer has everything needed.
- "I woke at 7am, sent my sister out on fake errands, secretly bought her an iPhone, hid it, surprised her when she returned"
- "I quit my 9-5 job on March 3rd after my boss publicly embarrassed me in a meeting. I had no backup plan."
- "I spent 3 months learning to code every night after my kids slept, got hired remote, now work from Bali"

TYPE C — Opinion/list content (ready to generate):
- "5 AI tools students should know"
- "3 mistakes gym beginners make"
- "What happened when I quit sugar for 30 days and tracked energy levels"

RULE:
If the user has provided REAL EVENTS, REAL TIMELINE, REAL PEOPLE, REAL ACTIONS — return: script
Even if it's a personal story. If the details are THERE, generate.

Only return: clarify
If the core story/content is genuinely missing and the writer would need to make things up.

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

Does this contain enough specific real detail to generate a script without inventing facts?
"""

    return ask_ai(prompt, detector_role).strip().lower()