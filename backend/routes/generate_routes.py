from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import Blueprint, request, jsonify
from ai.clarifier import get_clarification
from ai.writer import generate_script, regenerate_script

generate_bp = Blueprint("generate", __name__)
limiter = Limiter(get_remote_address)
VALID_TONES = {"cinematic", "funny", "raw", "educational", "energetic", "emotional", "chill", "inspirational"}
VALID_DURATIONS = {"15", "30", "60", "90"}
VALID_PLATFORMS = {"Instagram Reels", "TikTok", "YouTube Shorts", "LinkedIn"}


def validate_generate_input(d):
    topic = (d.get("topic") or "").strip()
    if not topic or len(topic) < 5:
        return "topic is required", None
    if len(topic) > 2000:
        topic = topic[:2000]

    tone = (d.get("tone") or "cinematic").strip().lower()
    if tone not in VALID_TONES:
        tone = "cinematic"

    duration = str(d.get("duration") or "30").strip()
    if duration not in VALID_DURATIONS:
        duration = "30"

    language = (d.get("language") or "English").strip() or "English"
    platform = (d.get("platform") or "Instagram Reels").strip()
    if platform not in VALID_PLATFORMS:
        platform = "Instagram Reels"

    return None, {
        "topic": topic,
        "tone": tone,
        "duration": duration,
        "language": language,
        "platform": platform,
    }


@generate_bp.route('/generate', methods=['POST'])
@limiter.limit("5 per minute")
def generate():
    try:
        d = request.json or {}

        error, data = validate_generate_input(d)
        if error:
            return jsonify({"error": error}), 400

        topic = data["topic"]
        tone = data["tone"]
        duration = data["duration"]
        language = data["language"]
        platform = data["platform"]

        # Get clarifications if provided
        # FIX: cap each answer at 100 chars to prevent prompt bloat
        clarifications = d.get("clarifications") or []
        extra_context = ""
        if clarifications:
            trimmed = [ans[:100] for ans in clarifications if ans.strip()]
            if trimmed:
                extra_context = "USER DETAILS:\n" + "\n".join(trimmed)

        # Only ask clarification questions on first call (no clarifications yet)
        # and only if topic is vague (clarifier returns GENERATE for detailed topics)
        if not clarifications:
            try:
                clarification = get_clarification(topic, tone, duration, language)
                if clarification and clarification.strip() != "GENERATE":
                    questions = [
                        line.replace("QUESTION:", "").strip()
                        for line in clarification.split("\n")
                        if line.strip().startswith("QUESTION:")
                    ]
                    # Only ask max 2 questions
                    questions = [q for q in questions if q][:2]
                    if questions:
                        return jsonify({
                            "type": "clarify",
                            "questions": questions
                        })
            except Exception as e:
                # If clarifier fails, skip it and generate directly
                print(f"CLARIFIER SKIPPED (error): {e}")

        # Generate script directly
        final_script = generate_script(
            topic,
            tone,
            duration,
            language,
            platform,
            extra_context
        )

        return jsonify({
            "type": "script",
            "result": final_script
        })

    except RuntimeError as e:
        print("GENERATE RUNTIME ERROR:", str(e))
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        print("GENERATE ERROR:", str(e))
        return jsonify({"error": "Something went wrong. Check terminal."}), 500


@generate_bp.route('/regenerate', methods=['POST'])
@limiter.limit("5 per minute")
def regenerate():
    try:
        d = request.json or {}

        script = d.get("script") or {}
        modifier = (d.get("modifier") or "").strip()
        original_topic = (d.get("original_topic") or "").strip()

        if not modifier:
            return jsonify({"error": "modifier is required"}), 400

        tone = (d.get("tone") or "cinematic").strip().lower()
        duration = str(d.get("duration") or "30").strip()
        language = (d.get("language") or "English").strip()
        platform = (d.get("platform") or "Instagram Reels").strip()

        result = regenerate_script(
            script,
            modifier,
            tone,
            duration,
            language,
            platform,
            original_topic
        )

        return jsonify({"result": result})

    except RuntimeError as e:
        print("REGENERATE RUNTIME ERROR:", str(e))
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        print("REGENERATE ERROR:", str(e))
        return jsonify({"error": "Regeneration failed."}), 500