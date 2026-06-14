"""Report severity classification.

Assigns a P0-P3 severity, credibility score, category, and human-readable
reasoning to a citizen report. Tries Gemini first; falls back to keyword rules.
"""

import logging
from dataclasses import dataclass

from app.services.llm import generate_json

logger = logging.getLogger(__name__)

VALID_SEVERITIES = {"P0", "P1", "P2", "P3"}

# Keyword signals per severity, highest priority first.
_SEVERITY_KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
    (
        "P0",
        ("trapped", "drowning", "drown", "swept", "unconscious", "not breathing",
         "can't breathe", "cannot breathe", "baby", "child", "electrocut",
         "cardiac", "dying", "rooftop", "submerged car"),
    ),
    (
        "P1",
        ("stranded", "rising fast", "rapidly rising", "elderly", "pregnant",
         "injured", "medical", "power line", "needs evacuation", "rescue"),
    ),
    (
        "P2",
        ("blocked", "underpass", "basement", "knee-deep", "vehicles stuck",
         "manhole", "sewage", "fallen tree", "road"),
    ),
    (
        "P3",
        ("waterlogging", "water accumulation", "traffic", "cattle", "minor",
         "slow", "drain"),
    ),
]

_CATEGORY_KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
    ("medical", ("injured", "medical", "pregnant", "unconscious", "cardiac",
                 "not breathing")),
    ("rescue", ("trapped", "stranded", "drowning", "swept", "rescue",
                "rooftop", "evacuation")),
    ("infrastructure", ("power line", "blocked", "underpass", "manhole",
                        "sewage", "fallen tree", "road")),
]

_TRIAGE_SYSTEM = (
    "You are an emergency dispatcher triaging urban flood reports. "
    "Classify severity strictly as one of P0 (immediate life threat: trapped, "
    "drowning, medical emergency), P1 (critical: stranded, rapidly rising "
    "water), P2 (serious: blocked roads, moderate flooding), or P3 "
    "(informational: waterlogging, traffic). Respond ONLY with a JSON object "
    'with keys: severity (P0-P3), credibility (integer 1-5), category '
    '(rescue|medical|infrastructure|information), reasoning (one sentence '
    "explaining the classification)."
)


@dataclass(frozen=True)
class TriageResult:
    """Outcome of triaging a single report."""

    severity: str
    credibility: int
    category: str
    reasoning: str


def classify(text: str) -> TriageResult:
    """Classify a report's severity, returning a structured triage result."""
    result = _classify_with_gemini(text)
    if result is not None:
        return result
    return _classify_with_rules(text)


def _classify_with_gemini(text: str) -> TriageResult | None:
    """Attempt classification via Gemini; return None if unavailable/invalid."""
    data = generate_json(f"Report: {text}", system=_TRIAGE_SYSTEM)
    if not data:
        return None
    severity = str(data.get("severity", "")).upper()
    if severity not in VALID_SEVERITIES:
        return None
    try:
        credibility = int(data.get("credibility", 3))
    except (TypeError, ValueError):
        credibility = 3
    return TriageResult(
        severity=severity,
        credibility=max(1, min(5, credibility)),
        category=str(data.get("category", "information")),
        reasoning=str(data.get("reasoning", "Classified by Gemini.")),
    )


def _classify_with_rules(text: str) -> TriageResult:
    """Deterministic keyword-based classification fallback."""
    lowered = text.lower()
    severity, matched = _match_severity(lowered)
    category = _match_category(lowered)
    credibility = _estimate_credibility(text)
    if matched:
        reasoning = (
            f"Rule-based triage: matched '{matched}' → {severity} "
            f"({category}); credibility {credibility}/5 from report specificity."
        )
    else:
        reasoning = (
            f"Rule-based triage: no high-severity signals → {severity} "
            f"(informational); credibility {credibility}/5."
        )
    return TriageResult(severity, credibility, category, reasoning)


def _match_severity(lowered: str) -> tuple[str, str | None]:
    """Return (severity, matched_keyword) using the keyword tables."""
    for severity, keywords in _SEVERITY_KEYWORDS:
        for keyword in keywords:
            if keyword in lowered:
                return severity, keyword
    return "P3", None


def _match_category(lowered: str) -> str:
    """Classify the report into an operational category."""
    for category, keywords in _CATEGORY_KEYWORDS:
        if any(keyword in lowered for keyword in keywords):
            return category
    return "information"


def _estimate_credibility(text: str) -> int:
    """Estimate credibility (1-5) from report length and specificity."""
    score = 2
    if len(text) > 40:
        score += 1
    if len(text) > 90:
        score += 1
    if any(ch.isdigit() for ch in text):
        score += 1
    return max(1, min(5, score))
