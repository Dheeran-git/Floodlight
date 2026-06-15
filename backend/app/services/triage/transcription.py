"""Voice transcription via ElevenLabs, with graceful no-key degradation."""

import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

_ELEVENLABS_URL = "https://api.elevenlabs.io/v1/speech-to-text"
_TIMEOUT_SECONDS = 60.0


def transcription_available() -> bool:
    """Return True if an ElevenLabs API key is configured."""
    return bool(get_settings().ELEVENLABS_API_KEY)


def transcribe(audio: bytes, filename: str = "audio.webm") -> str | None:
    """Transcribe audio bytes to text using ElevenLabs Speech-to-Text.

    Args:
        audio: Raw audio file bytes.
        filename: Original filename (used to infer content type).

    Returns:
        The transcript, or None if no key is configured or the call fails.
    """
    settings = get_settings()
    if not settings.ELEVENLABS_API_KEY:
        return None
    try:
        response = httpx.post(
            _ELEVENLABS_URL,
            headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
            files={"file": (filename, audio)},
            data={"model_id": "scribe_v2"},
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json().get("text")
    except (httpx.HTTPError, KeyError) as exc:
        logger.warning("ElevenLabs transcription failed: %s", exc)
        return None
