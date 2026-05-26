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

FAST_MODEL = "meta/llama-3.1-8b-instruct"
SMART_MODEL = "meta/llama-3.1-8b-instruct"
FALLBACK_MODEL = "mistralai/mistral-7b-instruct-v0.3"

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
    fallback_used = False

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
            if not fallback_used:
                logger.warning("Switching to fallback model...")
                model = FALLBACK_MODEL
                kwargs["model"] = FALLBACK_MODEL
                fallback_used = True
        except RuntimeError:
            raise
        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            logger.error(f"Attempt {attempt}: unexpected: {e}")

        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY)

    raise RuntimeError(last_error or "AI call failed after 3 attempts. Please try again.")


def _aggressive_json_fix(text):
    try:
        start = text.index("{")
        depth = 0
        end = start
        for i, ch in enumerate(text[start:], start):
            if ch == "{": depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        text = text[start:end + 1]
    except ValueError:
        return text

    # Fix literal newlines inside strings
    result = []
    in_string = False
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '\\' and i + 1 < len(text):
            result.append(ch)
            result.append(text[i + 1])
            i += 2
            continue
        if ch == '"':
            in_string = not in_string
            result.append(ch)
            i += 1
            continue
        if in_string:
            if ch == '\n': result.append('\\n')
            elif ch == '\r': result.append('\\r')
            elif ch == '\t': result.append('\\t')
            else: result.append(ch)
        else:
            result.append(ch)
        i += 1
    text = "".join(result)

    # Fix single quotes → double quotes
    text = re.sub(r"'([^']*)'(\s*:)", r'"\1"\2', text)
    text = re.sub(r"(:\s*)'([^']*)'", r'\1"\2"', text)

    # Remove trailing commas
    text = re.sub(r',\s*([}\]])', r'\1', text)

    return text


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

    # Attempt 3: aggressive fix then parse
    try:
        fixed = _aggressive_json_fix(content)
        return json.loads(fixed)
    except (ValueError, json.JSONDecodeError) as e:
        logger.warning(f"JSON extraction failed. Raw (first 400): {content[:400]}. Error: {e}")

    logger.error("All JSON extraction failed — raw content fallback")
    return {
        "hook": "",
        "script": content,
        "cta": "",
        "caption": "",
        "hashtags": ""
    }