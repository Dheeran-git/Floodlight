"""Tests for the rule-based command intelligence service."""

from sqlalchemy.orm import Session

from app.models.command_query import CommandQuery
from app.schemas.command import CommandQueryRequest
from app.services.command_service import CommandService


def _ask(db: Session, query: str) -> str:
    return CommandService(db).process_query(CommandQueryRequest(query=query))


def test_highest_risk_query_returns_reasoned_answer(
    seeded_db: Session,
) -> None:
    answer = _ask(seeded_db, "What is the highest-risk area right now?")
    assert answer.strip()
    assert "Reasoning:" in answer
    # The top-priority seeded incident is the Whitefield rooftop rescues (P0/95).
    assert "Whitefield" in answer


def test_shelter_overflow_query_returns_reasoned_answer(
    seeded_db: Session,
) -> None:
    answer = _ask(seeded_db, "Which shelter is closest to overflow capacity?")
    assert answer.strip()
    assert "Reasoning:" in answer
    # Jayanagar is the most full (240/250 = 96%).
    assert "Jayanagar" in answer


def test_unit_load_query_returns_reasoned_answer(seeded_db: Session) -> None:
    answer = _ask(seeded_db, "What is the current rescue unit load?")
    assert answer.strip()
    assert "Reasoning:" in answer
    assert "available" in answer.lower()


def test_unknown_query_returns_overview(seeded_db: Session) -> None:
    answer = _ask(seeded_db, "Tell me something general about operations.")
    assert answer.strip()
    assert "Reasoning:" in answer


def test_highest_risk_with_no_incidents(db_session: Session) -> None:
    answer = _ask(db_session, "What is the highest-risk area?")
    assert "No active incidents" in answer


def test_query_is_logged(seeded_db: Session) -> None:
    _ask(seeded_db, "What is the highest-risk area?")
    logged = seeded_db.query(CommandQuery).all()
    assert len(logged) == 1
    assert logged[0].response.strip()
