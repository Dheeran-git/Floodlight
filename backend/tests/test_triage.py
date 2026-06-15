"""Unit tests for the rule-based triage classifier.

No GEMINI_API_KEY is set during tests, so the deterministic keyword path runs.
"""

import pytest

from app.services.triage.classifier import (
    VALID_SEVERITIES,
    TriageResult,
    classify,
)


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("Family trapped on rooftop, water rising fast.", "P0"),
        ("A child is drowning in the floodwater near the bridge.", "P0"),
        ("Two people on a submerged car roof on Main Road.", "P0"),
        ("Elderly man stranded, water rising fast on the stairs.", "P1"),
        ("Pregnant woman needs evacuation, road cut off.", "P1"),
        ("Underpass fully flooded, vehicles stuck.", "P2"),
        ("Road blocked by a fallen tree and water.", "P2"),
        ("Minor waterlogging near the flyover, traffic slow.", "P3"),
        ("Water accumulation near the park, drain overflow.", "P3"),
    ],
)
def test_classify_assigns_expected_severity(text: str, expected: str) -> None:
    result = classify(text)
    assert result.severity == expected


def test_classify_returns_triage_result_type() -> None:
    result = classify("Family trapped on rooftop.")
    assert isinstance(result, TriageResult)
    assert result.severity in VALID_SEVERITIES


def test_classify_no_signal_defaults_to_p3() -> None:
    result = classify("Just checking in, everything looks calm here today.")
    assert result.severity == "P3"


def test_classify_credibility_within_bounds() -> None:
    short = classify("flood")
    long_detailed = classify(
        "Family of 4 trapped on rooftop at 12 Main Road since 3pm, "
        "water rising fast and now at the second floor windows."
    )
    for result in (short, long_detailed):
        assert 1 <= result.credibility <= 5


def test_classify_longer_specific_report_is_more_credible() -> None:
    short = classify("trapped")
    detailed = classify(
        "Family trapped on the rooftop of building 42, water rising fast "
        "and already 3 meters deep across the whole street."
    )
    assert detailed.credibility > short.credibility


def test_classify_digits_increase_credibility() -> None:
    without = classify("waterlogging spreading across the lane near market")
    with_digits = classify("waterlogging spreading across 5 lanes near market")
    assert with_digits.credibility >= without.credibility


def test_classify_reasoning_is_non_empty_string() -> None:
    result = classify("Family trapped on rooftop, water rising fast.")
    assert isinstance(result.reasoning, str)
    assert result.reasoning.strip()


@pytest.mark.parametrize(
    ("text", "expected_category"),
    [
        ("Injured person needs medical help urgently.", "medical"),
        ("Family trapped on rooftop, needs rescue.", "rescue"),
        ("Power line down in the flooded underpass.", "infrastructure"),
        ("Traffic is slow due to minor waterlogging.", "information"),
    ],
)
def test_classify_assigns_category(text: str, expected_category: str) -> None:
    assert classify(text).category == expected_category


def test_p0_keyword_outranks_lower_severity_keywords() -> None:
    # Contains both a P3 ("traffic") and a P0 ("trapped") signal; P0 wins.
    result = classify("Traffic stopped because a family is trapped on a roof.")
    assert result.severity == "P0"
