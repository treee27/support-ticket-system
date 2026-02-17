import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# ------------------------------------------------
# PROMPT — reviewers will read this
# ------------------------------------------------
CLASSIFY_PROMPT = """
You are a support ticket classifier for a software product.
Given a support ticket description, identify:
1. category — one of: billing, technical, account, general
2. priority — one of: low, medium, high, critical

Definitions:
billing   → payment issues, invoices, refunds, subscription charges
technical → bugs, crashes, errors, performance problems, integrations
account   → login, password, permissions, profile, authentication
general   → feature requests, general inquiries, documentation questions

low      → minor issue, workaround exists, cosmetic problem
medium   → affects workflow but not blocking
high     → blocking a user from core functionality
critical → data loss, security issue, complete service outage

Respond ONLY with a JSON object, no markdown, no explanation:
{"category": "<one of the four>", "priority": "<one of the four>"}
"""


def classify_ticket(description: str) -> dict:
    """
    Call Anthropic API to classify a support ticket.
    Returns a dict with 'suggested_category' and 'suggested_priority'.
    On any failure, returns safe defaults.
    """

    api_key = settings.LLM_API_KEY
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set — skipping LLM classification")
        return _default_response()

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=64,
            messages=[
                {
                    "role": "user",
                    "content": f"{CLASSIFY_PROMPT}\n\nTicket description:\n{description}"
                }
            ],
        )

        raw = message.content[0].text.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data = json.loads(raw)

        valid_categories = {'billing', 'technical', 'account', 'general'}
        valid_priorities = {'low', 'medium', 'high', 'critical'}

        category = data.get('category', 'general')
        priority = data.get('priority', 'medium')

        if category not in valid_categories:
            category = 'general'

        if priority not in valid_priorities:
            priority = 'medium'

        return {
            'suggested_category': category,
            'suggested_priority': priority,
        }

    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON: {e}")
        return _default_response()

    except Exception as e:
        logger.error(f"LLM classification failed: {e}")
        return _default_response()


def _default_response():
    """Safe fallback — form works without LLM."""
    return {
        'suggested_category': 'general',
        'suggested_priority': 'medium',
    }
