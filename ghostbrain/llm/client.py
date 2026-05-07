"""Thin wrapper around `claude -p` for programmatic LLM calls.

Why subprocess: Jannik runs on Claude Max (OAuth). The Anthropic SDK requires
an API key. Shelling out to the local `claude` binary inherits the OAuth
session — calls bill against Max quota.

Cost-shaping: by default `claude` injects the global CLAUDE.md, all skills,
auto-memory, etc. into every call (~35k tokens of system prompt). We strip
that with ``--system-prompt`` so each call is just our prompt.
"""

from __future__ import annotations

import dataclasses
import json
import logging
import os
import shutil
import subprocess
import time
from typing import Any

log = logging.getLogger("ghostbrain.llm.client")

DEFAULT_TIMEOUT_S = 120
DEFAULT_BUDGET_USD = 0.50  # safety cap per call; raise via env if needed
DEFAULT_MODEL = "haiku"
RETRY_DELAYS_S = (5, 30, 120)

MINIMAL_SYSTEM_PROMPT = (
    "You are an automation assistant for a personal knowledge system. "
    "Follow the user's instructions exactly. When asked for JSON, output "
    "ONLY a single JSON value with no surrounding prose, code fences, or "
    "commentary."
)


class LLMError(RuntimeError):
    """Raised when the `claude` subprocess fails or returns an error."""


class LLMTimeout(LLMError):
    pass


class LLMRateLimit(LLMError):
    pass


@dataclasses.dataclass
class LLMResult:
    text: str
    model: str
    cost_usd: float
    duration_ms: int
    session_id: str
    raw: dict[str, Any]

    def as_json(self) -> Any:
        """Parse ``text`` as JSON. Raises ``LLMError`` on parse failure."""
        try:
            return json.loads(self.text)
        except json.JSONDecodeError as e:
            raise LLMError(
                f"expected JSON output but got: {self.text[:200]!r}"
            ) from e


def run(
    prompt: str,
    *,
    model: str = DEFAULT_MODEL,
    json_schema: dict | None = None,
    system_prompt: str | None = None,
    budget_usd: float | None = None,
    timeout_s: int = DEFAULT_TIMEOUT_S,
) -> LLMResult:
    """Run a single Claude prompt and return the result.

    Parameters
    ----------
    prompt: the user prompt to send.
    model: ``"haiku"`` (default; cheap routing/classification),
        ``"sonnet"`` (extraction/digest), ``"opus"`` (rarely needed).
    json_schema: if provided, passed to ``--json-schema`` for structured
        output validation. Highly recommended for any prompt expecting JSON.
    system_prompt: override the default minimal system prompt.
    budget_usd: hard cap for this call. Defaults to ``DEFAULT_BUDGET_USD``.
    timeout_s: subprocess timeout.
    """
    binary = shutil.which("claude")
    if binary is None:
        raise LLMError(
            "`claude` binary not on PATH. Install Claude Code or adjust PATH "
            "in the launchd plist."
        )

    cmd: list[str] = [
        binary,
        "--print",
        "--output-format", "json",
        "--model", model,
        "--system-prompt", system_prompt or MINIMAL_SYSTEM_PROMPT,
        "--no-session-persistence",
        "--max-budget-usd", f"{budget_usd or DEFAULT_BUDGET_USD:.4f}",
        "--exclude-dynamic-system-prompt-sections",
    ]
    if json_schema is not None:
        cmd.extend(["--json-schema", json.dumps(json_schema)])

    cmd.append(prompt)

    last_err: Exception | None = None
    for attempt, delay in enumerate((0,) + RETRY_DELAYS_S):
        if delay:
            log.warning("LLM retry %d after %ds (last error: %s)",
                        attempt, delay, last_err)
            time.sleep(delay)
        try:
            return _run_once(cmd, timeout_s=timeout_s)
        except LLMRateLimit as e:
            last_err = e
            continue
        except LLMTimeout as e:
            last_err = e
            continue
    raise LLMError(f"LLM call failed after {len(RETRY_DELAYS_S)} retries: {last_err}")


def _run_once(cmd: list[str], *, timeout_s: int) -> LLMResult:
    log.debug("running: %s", _redact(cmd))
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_s,
            env={**os.environ, "CLAUDE_CODE_NO_TELEMETRY": "1"},
        )
    except subprocess.TimeoutExpired as e:
        raise LLMTimeout(f"`claude -p` timed out after {timeout_s}s") from e

    if proc.returncode != 0:
        stderr = (proc.stderr or "").strip()
        if "rate" in stderr.lower() and "limit" in stderr.lower():
            raise LLMRateLimit(stderr)
        raise LLMError(
            f"`claude -p` exited {proc.returncode}: {stderr or proc.stdout[:300]}"
        )

    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        raise LLMError(
            f"could not parse claude -p stdout as JSON: {proc.stdout[:300]!r}"
        ) from e

    if payload.get("is_error"):
        raise LLMError(
            f"claude reported error: {payload.get('result', payload)}"
        )

    return LLMResult(
        text=str(payload.get("result", "")),
        model=_pick_model(payload),
        cost_usd=float(payload.get("total_cost_usd", 0.0)),
        duration_ms=int(payload.get("duration_ms", 0)),
        session_id=str(payload.get("session_id", "")),
        raw=payload,
    )


def _pick_model(payload: dict) -> str:
    usage = payload.get("modelUsage") or {}
    if usage:
        return next(iter(usage.keys()))
    return ""


def _redact(cmd: list[str]) -> list[str]:
    """Trim long arg values for log readability."""
    out: list[str] = []
    for x in cmd:
        out.append(x if len(x) <= 80 else x[:77] + "...")
    return out
