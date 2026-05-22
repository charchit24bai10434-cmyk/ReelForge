from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from ai.client import ask_ai
from ai.intent_detector import detect_intent
from ai.clarifier import get_clarification
from ai.strategist import build_strategy
from ai.writer import generate_script, regenerate_script

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return jsonify({'message': 'ReelForge Running'})


@app.route('/generate', methods=['POST'])
def generate():
    try:
        d = request.json or {}

        topic = d.get('topic', '')
        tone = d.get('tone', 'cinematic')
        duration = d.get('duration', '30')
        language = d.get('language', 'English')
        platform = d.get('platform', 'Instagram Reels')
        clarifications = d.get('clarifications', [])
        extra_context = d.get('extra_context', '')

        clarification = None
        questions = []

        if clarifications:
            extra_context += "\nUSER CLARIFICATIONS:\n" + "\n".join(clarifications)

        # ask clarification questions only on first request
        if not clarifications:
            clarification = get_clarification(topic, tone, duration, language)

            if clarification and clarification.strip() != "GENERATE":
                questions = [
                    line.replace("QUESTION:", "").strip()
                    for line in clarification.split("\n")
                    if line.startswith("QUESTION:")
                ]

                if questions:
                    return jsonify({
                        "type": "clarify",
                        "questions": questions
                    })

        strategy = build_strategy(
            topic,
            tone,
            duration,
            language,
            platform,
            extra_context
        )

        final_script = generate_script(
            topic,
            tone,
            duration,
            language,
            strategy,
            platform,
            extra_context
        )

        return jsonify({
            "type": "script",
            "result": final_script
        })

    except Exception as e:
        print("GENERATE ERROR:", str(e))
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/ideas', methods=['POST'])
def ideas():
    d = request.json or {}
    niche = d.get('niche', 'motivation')

    prompt = f'''
You are a viral content strategist.

Generate 10 highly specific trending content ideas for niche: {niche}

Rules:
- highly specific
- not generic
- trending logic
- clear viral angle

Format:
IDEA: ... | SCORE: ...
'''

    result = ask_ai(prompt, "You are a viral content strategist.")

    lines = [l.strip() for l in result.split('\n') if 'IDEA:' in l]
    out = []

    for line in lines:
        parts = line.split('|')
        idea = parts[0].replace('IDEA:', '').strip()
        score = parts[1].replace('SCORE:', '').strip() if len(parts) > 1 else '85'

        out.append({
            'idea': idea,
            'score': score
        })

    return jsonify({'ideas': out[:10]})


@app.route('/analyze-hook', methods=['POST'])
def analyze_hook():
    d = request.json or {}
    hook = d.get('hook', '')

    prompt = f'''
Analyze this hook brutally:

HOOK: "{hook}"

Return:
SCORE:
WHAT WORKS:
WHAT DOES NOT WORK:
WHY PEOPLE WOULD SCROLL PAST:
3 BETTER HOOKS:
PRO TIPS:
'''

    result = ask_ai(prompt, "You are the best hook writer on the internet.")

    return jsonify({'result': result})


@app.route('/hashtags', methods=['POST'])
def hashtags():
    d = request.json or {}
    topic = d.get('topic', '')

    prompt = f'''
Generate best hashtag strategy for: {topic}

Include:
- mega hashtags
- macro hashtags
- micro hashtags
- niche hashtags
- strategy
'''

    result = ask_ai(prompt, "You are a social media SEO expert.")

    return jsonify({'result': result})


@app.route('/translate', methods=['POST'])
def translate():
    d = request.json or {}
    script = d.get('script', '')
    language = d.get('language', 'Hindi')

    prompt = f'''
Translate naturally into {language}.

Rules:
- native sounding
- preserve energy
- preserve timestamps

SCRIPT:
{script}
'''

    result = ask_ai(prompt, f"You are a native {language} content creator.")

    return jsonify({'result': result})


@app.route('/calendar', methods=['POST'])
def calendar():
    d = request.json or {}
    niche = d.get('niche', 'motivation')

    prompt = f'''
Create a 30-day viral content calendar for {niche} niche.

Specific only.
No vague ideas.
'''

    result = ask_ai(prompt, "You are a creator growth strategist.")

    return jsonify({'result': result})


@app.route('/ideas-smart', methods=['POST'])
def ideas_smart():
    d = request.json or {}
    user_input = d.get('input', '')

    prompt = f'''
Creator said:
"{user_input}"

Generate 8 viral ideas.

Format:
TITLE:
WHY:
FORMAT:
VIRAL:
TREND:
---
'''

    result = ask_ai(prompt, "You are a viral content strategist.")

    blocks = result.split('---')
    ideas = []

    for block in blocks:
        if 'TITLE:' not in block:
            continue

        lines = block.strip().split('\n')
        idea = {}

        for line in lines:
            if line.startswith('TITLE:'):
                idea['title'] = line.replace('TITLE:', '').strip()
            elif line.startswith('WHY:'):
                idea['why'] = line.replace('WHY:', '').strip()
            elif line.startswith('FORMAT:'):
                idea['format'] = line.replace('FORMAT:', '').strip()
            elif line.startswith('VIRAL:'):
                idea['viral'] = line.replace('VIRAL:', '').strip()
            elif line.startswith('TREND:'):
                idea['trend'] = line.replace('TREND:', '').strip()

        if idea.get('title'):
            ideas.append(idea)

    return jsonify({'ideas': ideas})


@app.route('/expand-idea', methods=['POST'])
def expand_idea():
    d = request.json or {}
    idea = d.get('idea', '')

    prompt = f'''
Expand this creator idea:

{idea}

Return:
- hook
- script
- filming shots
- viral reasoning
- platform fit
'''

    result = ask_ai(prompt, "You are a creator strategist.")

    return jsonify({'result': result})


@app.route('/regenerate', methods=['POST'])
def regenerate():
    try:
        d = request.json or {}

        original_script = d.get('script', '')
        modifier = d.get('modifier', '')
        tone = d.get('tone', 'cinematic')
        duration = d.get('duration', '30')
        language = d.get('language', 'English')
        platform = d.get('platform', 'Instagram Reels')

        result = regenerate_script(
            original_script,
            modifier,
            tone,
            duration,
            language,
            platform
        )

        return jsonify({
            'result': result
        })

    except Exception as e:
        print("REGENERATE ERROR:", str(e))
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/voiceover', methods=['POST'])
def voiceover():
    return jsonify({
        'error': 'Voiceover coming soon!'
    })


if __name__ == '__main__':
    
    app.run(debug=True, port=5000)