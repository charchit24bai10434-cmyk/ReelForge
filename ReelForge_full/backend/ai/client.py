import os
import json
import re
import time
import logging
from openai import OpenAI, APITimeoutError, APIConnectionError, APIStatusError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
    timeout=60.0
)

FAST_MODEL = "mistralai/mistral-7b-instruct-v0.3"
SMART_MODEL = "mistralai/mixtral-8x7b-instruct-v0.1"

MAX_RETRIES = 3
RETRY_DELAY = 1.0


def ask_ai(
    prompt,
    system_role,
    smart=False,
    temperature=0.7,
    max_tokens=1200,
    json_mode=False
):
    model = SMART_MODEL if smart else FAST_MODEL

    actual_prompt = prompt
    if json_mode:
        actual_prompt = prompt + "\n\nCRITICAL: Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Start with { and end with }. Do NOT include literal newlines inside string values — use \\n instead."

    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_role},
            {"role": "user", "content": actual_prompt}
        ],
        "temperature": temperature,
        "top_p": 1,
        "max_tokens": max_tokens
    }

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"AI call attempt {attempt}/{MAX_RETRIES} — model: {model}")
            completion = client.chat.completions.create(**kwargs)
            content = completion.choices[0].message.content

            if not content or not content.strip():
                logger.warning(f"Attempt {attempt}: model returned empty, retrying...")
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY)
                    continue
                else:
                    raise RuntimeError("AI returned empty responses after 3 attempts. Please try again.")

            if json_mode:
                return _extract_json(content)
            return content

        except APITimeoutError:
            last_error = "AI took too long to respond. Please try again."
            logger.error(f"Attempt {attempt}: timeout")
        except APIConnectionError as e:
            last_error = "Could not connect to AI. Check your API key and network."
            logger.error(f"Attempt {attempt}: connection error: {e}")
        except APIStatusError as e:
            last_error = f"AI service error ({e.status_code}). Try again shortly."
            logger.error(f"Attempt {attempt}: status {e.status_code}: {e.message}")
            if e.status_code in (401, 403):
                raise RuntimeError(last_error)
        except RuntimeError:
            raise
        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            logger.error(f"Attempt {attempt}: unexpected: {e}")

        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY)

    raise RuntimeError(last_error or "AI call failed after 3 attempts. Please try again.")


def _clean_json_string(content):
    """
    Fix common issues with model-generated JSON:
    1. Literal newlines inside string values (invalid JSON)
    2. Unescaped control characters
    """
    # Find the JSON object boundaries
    try:
        start = content.index("{")
        end = content.rindex("}") + 1
        raw = content[start:end]
    except ValueError:
        return content

    # Strategy: parse character by character
    # Replace literal newlines inside string values with \n
    result = []
    in_string = False
    escape_next = False

    for char in raw:
        if escape_next:
            result.append(char)
            escape_next = False
            continue

        if char == "\\":
            result.append(char)
            escape_next = True
            continue

        if char == '"' and not escape_next:
            in_string = not in_string
            result.append(char)
            continue

        # Inside a string — replace literal newlines/tabs with escaped versions
        if in_string:
            if char == "\n":
                result.append("\\n")
            elif char == "\r":
                result.append("\\r")
            elif char == "\t":
                result.append("\\t")
            else:
                result.append(char)
        else:
            result.append(char)

    return "".join(result)


def _extract_json(content):
    content = content.strip()

    # Attempt 1: direct parse
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Attempt 2: strip markdown fences
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Attempt 3: find outermost { ... } and try direct parse
    try:
        start = content.index("{")
        end = content.rindex("}") + 1
        extracted = content[start:end]
        return json.loads(extracted)
    except (ValueError, json.JSONDecodeError):
        pass

    # Attempt 4: FIX — clean literal newlines inside strings then parse
    try:
        cleaned = _clean_json_string(content)
        return json.loads(cleaned)
    except (ValueError, json.JSONDecodeError) as e:
        logger.warning(f"JSON extraction failed after cleaning. Raw (first 400): {content[:400]}. Error: {e}")

    # Last resort fallback
    logger.error("All JSON extraction failed — raw content fallback")
    return {
        "hook": "",
        "script": content,
        "cta": "",
        "caption": "",
        "hashtags": ""
    }