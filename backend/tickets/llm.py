import json
import logging
from django.conf import settings
from groq import Groq

logger = logging.getLogger(__name__)

CLASSIFY_PROMPT = """
You are a support ticket classifier for a software product.
Given a support ticket description, identify:
1. category — one of: billing, technical, account, general
2. priority — one of: low, medium, high, critical

Respond ONLY with JSON:
{"category": "...", "priority": "..."}
"""


def classify_ticket(description: str) -> dict:
    api_key = settings.LLM_API_KEY

    if not api_key:
        return _default_response()

    try:
        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": f"{CLASSIFY_PROMPT}\n\n{description}",
                }
            ],
            max_tokens=60,
        )

        raw = completion.choices[0].message.content.strip()

        # Remove markdown if model returns it
        if raw.startswith("```"):
            raw = raw.split("```")[1].replace("json", "").strip()

        data = json.loads(raw)

        return {
            "suggested_category": data.get("category", "general"),
            "suggested_priority": data.get("priority", "medium"),
        }

    except Exception as e:
        logger.error(f"LLM classification failed: {e}")
        return _default_response()


def _default_response():
    return {
        "suggested_category": "general",
        "suggested_priority": "medium",
    }
