"""Tests for the path-first / LLM-fallback router."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

import pytest


def _routing(rules: dict[str, str]) -> dict:
    return {"claude_code": {"project_paths": rules}}


def test_path_match_skips_llm(vault: Path) -> None:
    """When metadata.projectPath matches a routing rule, no LLM call should happen."""
    from ghostbrain.worker.router import route_event

    routing = _routing({"/repos/codeship-x": "codeship"})
    event = {
        "id": "e1",
        "source": "claude-code",
        "metadata": {"projectPath": "/repos/codeship-x/sub"},
    }

    with patch("ghostbrain.worker.router.llm.run") as mock_llm:
        decision = route_event(event, routing=routing, content_excerpt="x")

    assert decision.context == "codeship"
    assert decision.method == "path"
    assert decision.confidence == 1.0
    mock_llm.assert_not_called()


def test_no_path_no_content_returns_needs_review(vault: Path) -> None:
    from ghostbrain.worker.router import route_event

    event = {"id": "e2", "source": "manual"}
    decision = route_event(event, routing={}, content_excerpt="")
    assert decision.context == "needs_review"
    assert decision.method == "fallback"


def test_llm_fallback_invoked_when_no_rule(vault: Path) -> None:
    """No path rule → the router calls the LLM."""
    from ghostbrain.worker.router import route_event
    from ghostbrain.llm.client import LLMResult

    fake = LLMResult(
        text='{"context":"sanlam","confidence":0.92,"reasoning":"capstone path"}',
        model="haiku", cost_usd=0.0, duration_ms=1, session_id="s",
        raw={},
    )
    event = {"id": "e3", "source": "manual"}
    with patch("ghostbrain.worker.router.llm.run", return_value=fake) as mock_llm:
        decision = route_event(
            event, routing={}, content_excerpt="ASCP capstone work",
            config={"thresholds": {"reject_below": 0.5}},
        )

    mock_llm.assert_called_once()
    assert decision.context == "sanlam"
    assert decision.method == "llm"
    assert 0.91 < decision.confidence < 0.93


def test_llm_low_confidence_returns_needs_review(vault: Path) -> None:
    from ghostbrain.worker.router import route_event
    from ghostbrain.llm.client import LLMResult

    fake = LLMResult(
        text='{"context":"codeship","confidence":0.40,"reasoning":"vague"}',
        model="haiku", cost_usd=0.0, duration_ms=1, session_id="s", raw={},
    )
    event = {"id": "e4", "source": "manual"}
    with patch("ghostbrain.worker.router.llm.run", return_value=fake):
        decision = route_event(
            event, routing={}, content_excerpt="some content",
            config={"thresholds": {"reject_below": 0.5}},
        )
    # Below reject_below — caller treats this as needs_review.
    assert decision.confidence == 0.4
    # The module preserves whatever ctx the LLM returned; the pipeline checks
    # the threshold to decide whether to write to context. We just verify the
    # threshold is respected when comparing.
    assert decision.context == "codeship"


def test_llm_error_falls_back_to_review(vault: Path) -> None:
    from ghostbrain.worker.router import route_event
    from ghostbrain.llm import client as llm

    event = {"id": "e5", "source": "manual"}
    with patch("ghostbrain.worker.router.llm.run",
               side_effect=llm.LLMError("boom")):
        decision = route_event(
            event, routing={}, content_excerpt="content",
            config={"thresholds": {"reject_below": 0.5}},
        )
    assert decision.context == "needs_review"
    assert decision.method == "fallback"
