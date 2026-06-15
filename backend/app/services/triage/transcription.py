"""Voice transcription via Whisper, with graceful no-key degradation."""

import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"
_TIMEOUT_SECONDS = 60.0


def transcription_available() -> bool:
    """Return True if a Whisper API key is configured."""
    return bool(get_settings().WHISPER_API_KEY)


def transcribe(audio: bytes, filename: str = "audio.webm") -> str | None:
    """Transcribe audio bytes to text using Whisper.

    Args:
        audio: Raw audio file bytes.
        filename: Original filename (used to infer content type).

    Returns:
        The transcript, or None if no key is configured or the call fails.
    """
    settings = get_settings()
    if not settings.WHISPER_API_KEY:
        return None
    try:
        response = httpx.post(
            _WHISPER_URL,
            headers={"Authorization": f"Bearer {settings.WHISPER_API_KEY}"},
            files={"file": (filename, audio)},
            data={"model": "whisper-1"},
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json().get("text")
    except (httpx.HTTPError, KeyError) as exc:
        logger.warning("Whisper transcription failed: %s", exc)
        return None
