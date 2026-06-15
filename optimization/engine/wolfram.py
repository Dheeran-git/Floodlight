"""Wolfram integration for risk simulation and decision support.

Per the project rules (docs/claude.md §Wolfram), Wolfram is used for graph
analysis, risk scoring, shelter balancing, and simulations — never for UI, API
orchestration, or storage.

This module wraps the Wolfram|Alpha Short Answers API (stdlib HTTP only, so the
optimization package keeps its lean dependency set). When ``WOLFRAM_APP_ID`` is
configured, risk-escalation values are evaluated by Wolfram; otherwise the same
logistic-growth model is computed locally, so behaviour is identical and fully
functional without an API key. Every public function returns the value plus the
source ("wolfram" or "model") for transparency.
"""

import math
import os
import re
import urllib.parse
import urllib.request
from dataclasses import dataclass

_SHORT_ANSWERS_URL = "https://api.wolframalpha.com/v1/result"
_TIMEOUT_SECONDS = 10.0
_CARRYING_CAPACITY = 100.0


@dataclass(frozen=True)
class RiskProjection:
    """A forecasted risk value and the engine that produced it."""

    predicted_risk: float
    source: str  # "wolfram" or "model"


def wolfram_available() -> bool:
    """Return True if a Wolfram App ID is configured."""
    return bool(os.environ.get("WOLFRAM_APP_ID"))


def evaluate(query: str) -> float | None:
    """Evaluate a natural-language/math query via Wolfram Short Answers.

    Args:
        query: The expression or question to evaluate.

    Returns:
        The first numeric value in Wolfram's answer, or None if no App ID is
        set or the request/parse fails.
    """
    appid = os.environ.get("WOLFRAM_APP_ID")
    if not appid:
        return None
    params = urllib.parse.urlencode({"appid": appid, "i": query})
    url = f"{_SHORT_ANSWERS_URL}?{params}"
    try:
        with urllib.request.urlopen(url, timeout=_TIMEOUT_SECONDS) as response:  # noqa: S310
            text = response.read().decode("utf-8", errors="ignore")
        return _parse_number(text)
    except Exception:
        return None


def simulate_risk_escalation(
    current_risk: float,
    incident_count: int,
    horizon_minutes: int,
) -> RiskProjection:
    """Project how a zone's risk score escalates over a time horizon.

    Models risk as logistic growth toward a carrying capacity of 100, with a
    growth rate that increases with incident density. Uses Wolfram to evaluate
    the logistic value when available, falling back to a local computation.

    Args:
        current_risk: Current risk score (0-100).
        incident_count: Number of incidents driving the zone.
        horizon_minutes: Forecast horizon in minutes.

    Returns:
        A RiskProjection with the predicted risk (0-100) and its source.
    """
    rate = _growth_rate(incident_count)
    hours = horizon_minutes / 60.0
    current = _clamp(current_risk, 0.1, _CARRYING_CAPACITY)

    if wolfram_available():
        query = (
            f"value of {_CARRYING_CAPACITY} / "
            f"(1 + (({_CARRYING_CAPACITY} - {current})/{current}) "
            f"* e^(-{rate} * {hours}))"
        )
        value = evaluate(query)
        if value is not None:
            return RiskProjection(_clamp(value, 0.0, 100.0), "wolfram")

    local = _logistic(current, rate, hours)
    return RiskProjection(_clamp(local, 0.0, 100.0), "model")


def _growth_rate(incident_count: int) -> float:
    """Logistic growth rate; denser incident clusters escalate faster."""
    return 0.4 + 0.2 * max(incident_count - 1, 0)


def _logistic(current: float, rate: float, hours: float) -> float:
    """Closed-form logistic growth value toward the carrying capacity."""
    k = _CARRYING_CAPACITY
    ratio = (k - current) / current
    return k / (1.0 + ratio * math.exp(-rate * hours))


def _parse_number(text: str) -> float | None:
    """Extract the first numeric value from a Wolfram answer string."""
    match = re.search(r"-?\d+(?:\.\d+)?", text.replace(",", ""))
    return float(match.group(0)) if match else None


def _clamp(value: float, low: float, high: float) -> float:
    """Clamp value into the inclusive [low, high] range."""
    return max(low, min(high, value))
