"""Tests for the Wolfram risk-simulation integration (fallback path).

These run without WOLFRAM_APP_ID, exercising the local logistic model that
mirrors the Wolfram computation.
"""

import pytest

from optimization.engine import wolfram


@pytest.fixture(autouse=True)
def _no_appid(monkeypatch):
    """Ensure the Wolfram App ID is unset for deterministic fallback tests."""
    monkeypatch.delenv("WOLFRAM_APP_ID", raising=False)


def test_wolfram_unavailable_without_appid():
    assert wolfram.wolfram_available() is False


def test_evaluate_returns_none_without_appid():
    assert wolfram.evaluate("2 + 2") is None


def test_available_with_appid(monkeypatch):
    monkeypatch.setenv("WOLFRAM_APP_ID", "demo")
    assert wolfram.wolfram_available() is True


def test_simulate_uses_model_fallback():
    projection = wolfram.simulate_risk_escalation(50.0, 1, 45)
    assert projection.source == "model"
    assert 0.0 <= projection.predicted_risk <= 100.0


def test_risk_escalates_above_current():
    projection = wolfram.simulate_risk_escalation(40.0, 2, 45)
    assert projection.predicted_risk >= 40.0


def test_denser_clusters_escalate_faster():
    sparse = wolfram.simulate_risk_escalation(50.0, 1, 45).predicted_risk
    dense = wolfram.simulate_risk_escalation(50.0, 5, 45).predicted_risk
    assert dense >= sparse


def test_prediction_is_clamped():
    projection = wolfram.simulate_risk_escalation(99.0, 10, 600)
    assert projection.predicted_risk <= 100.0


def test_parse_number_extracts_value():
    assert wolfram._parse_number("about 85.3 units") == pytest.approx(85.3)
    assert wolfram._parse_number("no numbers here") is None
