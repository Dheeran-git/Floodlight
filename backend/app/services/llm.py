"""LLM provider abstraction (Google Gemini) with graceful degradation.

When ``GEMINI_API_KEY`` is configured, requests are sent to the Gemini
``generateContent`` REST endpoint. When it is not, callers receive ``None`` and
are expected to fall back to deterministic rule-based logic so the platform
remains fully functional (and demoable) without external API keys.
"""

import json
import logging
import re

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
_TIMEOUT_SECONDS = 20.0


def llm_available() -> bool:
    """Return True if a Gemini API key is configured."""
    return bool(get_settings().GEMINI_API_KEY)


def generate_text(prompt: str, *, system: str | None = None) -> str | None:
    """Send a prompt to Gemini and return the text response.

    Args:
        prompt: The user prompt.
        system: Optional system instruction prepended to the prompt.

    Returns:
        The model's text output, or None if no key is set or the call fails.
    """
    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        return None

    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
    url = _GEMINI_URL.format(model=settings.GEMINI_MODEL)

    try:
        response = httpx.post(
            url,
            params={"key": settings.GEMINI_API_KEY},
            json=payload,
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (httpx.HTTPError, KeyError, IndexError) as exc:
        logger.warning("Gemini request failed, falling back: %s", exc)
        return None


def generate_json(prompt: str, *, system: str | None = None) -> dict | None:
    """Send a prompt to Gemini and parse a JSON object from the response.

    Tolerates responses wrapped in markdown code fences.

    Returns:
        The parsed JSON dict, or None if unavailable or unparseable.
    """
    text = generate_text(prompt, system=system)
    if text is None:
        return None
    return _extract_json(text)


def _extract_json(text: str) -> dict | None:
    """Extract the first JSON object from a text blob (handles code fences)."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None
