"""Vault filesystem aggregates."""
from __future__ import annotations

import json
from pathlib import Path

from ghostbrain.paths import queue_dir, state_dir, vault_path


def _walk_size(root: Path) -> tuple[int, int]:
    """Returns (markdown_count, total_bytes) for the subtree."""
    md_count = 0
    total_bytes = 0
    for path in root.rglob("*"):
        if path.is_file():
            total_bytes += path.stat().st_size
            if path.suffix == ".md":
                md_count += 1
    return md_count, total_bytes


def _aggregate_state() -> tuple[str | None, int]:
    """Returns (max last_run timestamp, sum of indexed counts) across connectors."""
    state = state_dir()
    if not state.exists():
        return None, 0
    last_runs: list[str] = []
    indexed_sum = 0
    for entry in state.iterdir():
        state_file = entry / "state.json"
        if not state_file.exists():
            continue
        try:
            data = json.loads(state_file.read_text())
        except json.JSONDecodeError:
            continue
        if isinstance(data.get("last_run"), str):
            last_runs.append(data["last_run"])
        if isinstance(data.get("indexed"), int):
            indexed_sum += data["indexed"]
    return (max(last_runs) if last_runs else None), indexed_sum


def get_vault_stats() -> dict:
    vault = vault_path()
    queue = queue_dir() / "pending"
    if vault.exists():
        md_count, total_bytes = _walk_size(vault)
    else:
        md_count, total_bytes = 0, 0
    pending_count = sum(1 for p in queue.iterdir() if p.is_file()) if queue.exists() else 0
    last_sync, indexed = _aggregate_state()
    return {
        "totalNotes": md_count,
        "queuePending": pending_count,
        "vaultSizeBytes": total_bytes,
        "lastSyncAt": last_sync,
        "indexedCount": indexed,
    }
