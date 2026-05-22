from ai.client import ask_ai

strategist_role = """
You are an elite viral content strategist.

Your job:
Convert creator intent into a strong creative direction.

Rules:
- Think like a top short-form content strategist
- Respect selected tone
- Respect selected duration
- Respect platform
- Avoid clichés
- Keep output concise

Return EXACTLY:

ANGLE: ...
HOOK_STYLE: ...
EMOTIONAL_DRIVER: ...
PACE: ...
AVOID: ...
"""

def build_strategy(topic, tone, duration, language, platform, extra_context=""):
    prompt = f"""
TOPIC: {topic}
TONE: {tone}
DURATION: {duration}
LANGUAGE: {language}
PLATFORM: {platform}
USER_CONTEXT: {extra_context}
"""

    return ask_ai(
        prompt,
        strategist_role,
        smart=False,
        temperature=0.5,
        max_tokens=400
    )