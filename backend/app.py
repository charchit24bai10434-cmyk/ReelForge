from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()
app = Flask(__name__)
CORS(app)
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def ask_ai(prompt):
    r = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[
            {'role':'system','content':'You are a top viral content creator on Instagram and YouTube with 10M+ followers. You write scripts that are real, raw, relatable and actually get used. You never write generic motivational fluff. Every script you write feels like a real human wrote it — casual, punchy, emotional and specific. You understand hooks, pacing, storytelling and what makes people stop scrolling.'},
            {'role':'user','content':prompt}
        ],
        max_tokens=3000,
        temperature=0.85
    )
    return r.choices[0].message.content

@app.route('/')
def home(): return jsonify({'message':'ReelForge Running'})

@app.route('/generate', methods=['POST'])
def generate():
    d = request.json
    topic = d.get('topic','')
    niche = d.get('niche','')
    tone = d.get('tone','cinematic')
    duration = d.get('duration','30')
    language = d.get('language','English')

    prompt = '''Write a complete viral reel script for a real content creator. Be SPECIFIC, not generic.

TOPIC: ''' + topic + '''
NICHE: ''' + niche + '''
TONE: ''' + tone + '''
DURATION: ''' + duration + ''' seconds
LANGUAGE: ''' + language + '''

Rules you MUST follow:
- The hook must be so good that someone stops scrolling in 2 seconds
- Write EXACT words the creator should say — not descriptions
- Make it feel like a real person talking, not a robot
- Use specific details, numbers, real situations
- No generic phrases like "believe in yourself" or "you can do it"
- The script should feel raw, honest and relatable

Format your response EXACTLY like this:

HOOK (first 3 seconds — the exact words to say):
[write the exact hook words here]

FULL SCRIPT (with exact timestamps and words to say):
[0s-3s] [exact words]
[4s-8s] [exact words]
[continue for full duration]

STORYBOARD (what to film for each part):
Shot 1: [exact description of what to film]
Shot 2: [continue]

CAPTION FOR INSTAGRAM:
[write a real caption with personality, not boring]

CAPTION FOR YOUTUBE:
[write a real YouTube description]

HASHTAGS (30 — mix of sizes):
[list all 30 hashtags]

MUSIC MOOD:
[specific music style and song suggestions]

CAPCUT EDITING TIPS:
[3-5 specific tips for this exact video]

THUMBNAIL IDEA:
[specific, detailed thumbnail description]

BEST TIME TO POST:
[specific day and time with reason]

VIRAL SCORE: [X]/100
REASON: [explain specifically why this will or will not go viral]'''

    return jsonify({'result': ask_ai(prompt)})

@app.route('/ideas', methods=['POST'])
def ideas():
    d = request.json
    niche = d.get('niche','motivation')

    prompt = '''You are a viral content strategist. Generate 10 highly specific, trending content ideas for niche: ''' + niche + '''.

Rules:
- Each idea must be specific enough that a creator knows exactly what to make
- No vague ideas like "share your journey" — be SPECIFIC
- Think about what is trending RIGHT NOW in this niche
- Each idea should have a clear angle and hook

Format EXACTLY like this for each idea:
IDEA: [specific content idea with angle]
SCORE: [viral potential score out of 100]

Give all 10 ideas in this format.'''

    result = ask_ai(prompt)
    lines = [l.strip() for l in result.split('\n') if 'IDEA:' in l]
    out = []
    for line in lines:
        parts = line.split('|')
        idea = parts[0].replace('IDEA:','').strip()
        score = parts[1].replace('SCORE:','').strip() if len(parts)>1 else '85'
        out.append({'idea':idea,'score':score})
    if not out:
        raw_lines = [l.strip() for l in result.split('\n') if l.strip() and len(l.strip())>10]
        for i, line in enumerate(raw_lines[:20]):
            if 'IDEA:' in line:
                idea = line.replace('IDEA:','').strip()
                score_line = raw_lines[i+1] if i+1 < len(raw_lines) else 'SCORE: 85'
                score = score_line.replace('SCORE:','').strip()
                out.append({'idea':idea,'score':score})
    return jsonify({'ideas': out[:10]})

@app.route('/analyze-hook', methods=['POST'])
def analyze_hook():
    d = request.json
    hook = d.get('hook','')

    prompt = '''You are the best hook writer on the internet. Analyze this hook brutally and honestly:

HOOK: "''' + hook + '''"

Give me:

SCORE: [X]/100

WHAT WORKS:
[be specific about what is good]

WHAT DOES NOT WORK:
[be brutally honest about weaknesses]

WHY PEOPLE WOULD SCROLL PAST:
[explain the exact psychological reason]

REWRITTEN HOOK (3 versions, each better than the original):
Version 1 (curiosity-based): [write it]
Version 2 (emotion-based): [write it]
Version 3 (controversy-based): [write it]

PRO TIPS FOR BETTER HOOKS:
[3 specific, actionable tips]'''

    return jsonify({'result': ask_ai(prompt)})

@app.route('/hashtags', methods=['POST'])
def hashtags():
    d = request.json
    topic = d.get('topic','')

    prompt = '''You are a social media SEO expert. Generate the perfect hashtag strategy for: ''' + topic + '''

MEGA HASHTAGS (10M+ posts — use max 2-3):
[list 5 hashtags]

MACRO HASHTAGS (1M-10M posts — use 5-8):
[list 8 hashtags]

MICRO HASHTAGS (100K-1M posts — use 10-15):
[list 12 hashtags]

NICHE HASHTAGS (under 100K — use 5-10):
[list 10 hashtags]

TRENDING RIGHT NOW:
[list 5 hashtags that are currently trending for this topic]

HASHTAG STRATEGY:
[explain exactly how to use these hashtags for maximum reach — be specific]

AVOID THESE HASHTAGS:
[list 5 banned or shadowban-risk hashtags to avoid]'''

    return jsonify({'result': ask_ai(prompt)})

@app.route('/translate', methods=['POST'])
def translate():
    d = request.json
    script = d.get('script','')
    language = d.get('language','Hindi')

    prompt = '''You are a native ''' + language + ''' speaking content creator with millions of followers.

Translate this reel script to ''' + language + '''. 

Rules:
- Keep the energy, emotion and punch of the original
- Use natural ''' + language + ''' that real people speak — not textbook language
- Keep any numbers, names or key terms that should stay in English
- The translated script should feel like it was WRITTEN in ''' + language + ''' originally, not translated
- Keep the same timestamp structure

ORIGINAL SCRIPT:
''' + script + '''

TRANSLATED SCRIPT IN ''' + language + ''':'''

    return jsonify({'result': ask_ai(prompt)})

@app.route('/calendar', methods=['POST'])
def calendar():
    d = request.json
    niche = d.get('niche','motivation')

    prompt = '''Create a realistic 30-day content calendar for a creator in the ''' + niche + ''' niche.

Rules:
- Each idea must be SPECIFIC and actionable — no vague ideas
- Mix content types: tutorials, stories, controversies, trends, personal, educational
- Think about real trends and what actually performs well
- Make it varied — not the same type of content every day

Format EXACTLY like this for all 30 days:
Day 1, Content Idea: [specific idea], Posting Time: [best time], Tags: [3 hashtags]
Day 2, Content Idea: [specific idea], Posting Time: [best time], Tags: [3 hashtags]
[continue for all 30 days]'''

    return jsonify({'result': ask_ai(prompt)})


@app.route('/ideas-smart', methods=['POST'])
def ideas_smart():
    d = request.json
    user_input = d.get('input','')
    prompt = 'You are a viral content strategist. A creator said: "' + user_input + '". Generate 8 specific viral content ideas. Format EXACTLY like this for each, separated by ---:\nTITLE: [idea title]\nWHY: [one sentence why it works]\nFORMAT: [Storytime/POV/Tutorial/Voiceover]\nVIRAL: [High/Medium/Low]\nTREND: [trending style]\n---'
    result = ask_ai(prompt)
    blocks = result.split('---')
    ideas = []
    for block in blocks:
        if 'TITLE:' not in block: continue
        lines = block.strip().split('\n')
        idea = {}
        for line in lines:
            if line.startswith('TITLE:'): idea['title'] = line.replace('TITLE:','').strip()
            elif line.startswith('WHY:'): idea['why'] = line.replace('WHY:','').strip()
            elif line.startswith('FORMAT:'): idea['format'] = line.replace('FORMAT:','').strip()
            elif line.startswith('VIRAL:'): idea['viral'] = line.replace('VIRAL:','').strip()
            elif line.startswith('TREND:'): idea['trend'] = line.replace('TREND:','').strip()
        if idea.get('title'): ideas.append(idea)
    return jsonify({'ideas': ideas})

@app.route('/expand-idea', methods=['POST'])
def expand_idea():
    d = request.json
    idea = d.get('idea','')
    prompt = 'A creator wants to make this video: "' + idea + '". Give a complete breakdown with: PERFECT HOOK (exact words), WHAT TO FILM (3-4 shots), EXACT SCRIPT OUTLINE (beat by beat), WHY THIS WILL GO VIRAL, BEST PLATFORM, PRO TIPS (3 specific tips), SIMILAR VIRAL VIDEOS (2-3 examples)'
    return jsonify({'result': ask_ai(prompt)})

@app.route('/voiceover', methods=['POST'])
def voiceover():
    return jsonify({'error': 'Voiceover coming soon!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
