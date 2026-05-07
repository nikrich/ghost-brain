"""Tests for ghostbrain.llm.client. Subprocess-free — tests pure parsing logic."""

from __future__ import annotations

import pytest

from ghostbrain.llm.client import LLMError, LLMResult, _parse_json_tolerant


def _result(text: str) -> LLMResult:
    return LLMResult(text=text, structured=None, model="haiku",
                     cost_usd=0.0, duration_ms=0, session_id="s", raw={})


def test_parse_clean_json_object() -> None:
    assert _parse_json_tolerant('{"a": 1}') == {"a": 1}


def test_parse_clean_json_array() -> None:
    assert _parse_json_tolerant('[1, 2, 3]') == [1, 2, 3]


def test_parse_strips_markdown_fence() -> None:
    text = '```json\n{"context": "codeship", "confidence": 0.9}\n```'
    assert _parse_json_tolerant(text) == {"context": "codeship", "confidence": 0.9}


def test_parse_strips_lowercase_fence_without_lang() -> None:
    text = '```\n[]\n```'
    assert _parse_json_tolerant(text) == []


def test_parse_finds_json_after_preamble() -> None:
    text = 'Here is the result:\n\n{"context": "personal", "confidence": 0.85}'
    assert _parse_json_tolerant(text) == {"context": "personal", "confidence": 0.85}


def test_parse_ignores_trailing_chatter() -> None:
    text = '{"a": 1}\n\nLet me know if you need anything else.'
    assert _parse_json_tolerant(text) == {"a": 1}


def test_parse_array_with_preamble_and_trailing() -> None:
    text = "Sure! Here you go:\n\n[{\"x\": 1}, {\"x\": 2}]\n\nThat's all."
    assert _parse_json_tolerant(text) == [{"x": 1}, {"x": 2}]


def test_parse_raises_when_no_json() -> None:
    with pytest.raises(LLMError):
        _parse_json_tolerant("I cannot do that.")


def test_parse_raises_on_empty() -> None:
    with pytest.raises(LLMError):
        _parse_json_tolerant("")


def test_llmresult_as_json_uses_tolerant_parser() -> None:
    r = _result('Done. Result: {"context": "codeship", "confidence": 0.9}')
    assert r.as_json() == {"context": "codeship", "confidence": 0.9}


def test_llmresult_prefers_structured_over_text() -> None:
    """When --json-schema was used, `structured` is already a parsed object."""
    r = LLMResult(
        text="", structured={"context": "sanlam", "confidence": 0.9},
        model="haiku", cost_usd=0.0, duration_ms=0, session_id="s", raw={},
    )
    assert r.as_json() == {"context": "sanlam", "confidence": 0.9}


def test_llmresult_falls_back_to_text_when_no_structured() -> None:
    r = LLMResult(
        text='{"x": 1}', structured=None,
        model="haiku", cost_usd=0.0, duration_ms=0, session_id="s", raw={},
    )
    assert r.as_json() == {"x": 1}
