import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

FAST_MODEL = "openai/gpt-oss-120b"
SMART_MODEL = "openai/gpt-oss-120b"


def ask_ai(
    prompt,
    system_role,
    smart=False,
    temperature=0.7,
    max_tokens=1200,
    json_mode=False
):
    model = SMART_MODEL if smart else FAST_MODEL

    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_role},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "top_p": 1,
        "max_tokens": max_tokens
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    completion = client.chat.completions.create(**kwargs)

    content = completion.choices[0].message.content

    if json_mode:
        try:
            return json.loads(content)
        except Exception:
            return {
                "hook": "",
                "script": content,
                "cta": "",
                "caption": "",
                "hashtags": ""
            }

    return content