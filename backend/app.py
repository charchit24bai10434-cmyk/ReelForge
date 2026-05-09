from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/")
def home():
    return jsonify({"message": "ReelForge Backend Running"})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    topic = data.get("topic", "")
    niche = data.get("niche", "motivation")
    tone = data.get("tone", "cinematic")
    duration = data.get("duration", "30")
    language = data.get("language", "English")

    prompt = (
        "You are an expert viral social media content creator. "
        "Create a complete reel package for: "
        "Topic: " + topic + ", Niche: " + niche + ", Tone: " + tone +
        ", Duration: " + duration + "s, Language: " + language + ". "
        "Include: 1.HOOK 2.FULL SCRIPT with timestamps "
        "3.STORYBOARD shot by shot 4.CAPTIONS for Instagram and YouTube "
        "5.HASHTAGS 30 trending 6.MUSIC MOOD per scene "
        "7.CAPCUT EDITING TIPS 8.THUMBNAIL IDEA "
        "9.BEST POSTING TIME 10.VIRAL SCORE 0-100 with explanation"
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000
    )

    return jsonify({"result": response.choices[0].message.content})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
