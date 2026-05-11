"""Calendar agenda reader."""
from __future__ import annotations

from pathlib import Path

import frontmatter

from ghostbrain.paths import vault_path


def _walk_calendar(date: str) -> list[Path]:
    vault = vault_path()
    if not vault.exists():
        return []
    # Files for a given date are named with the date prefix.
    return list(vault.glob(f"20-contexts/*/calendar/{date}*.md"))


def _meeting_titles_on(date: str) -> set[str]:
    vault = vault_path()
    if not vault.exists():
        return set()
    out: set[str] = set()
    for path in vault.glob("20-contexts/*/meetings/*.md"):
        try:
            post = frontmatter.load(path)
        except Exception:
            continue
        if str(post.metadata.get("date", "")) == date:
            out.add(str(post.metadata.get("title", "")))
    return out


def _parse_event(path: Path, recorded_titles: set[str]) -> dict | None:
    try:
        post = frontmatter.load(path)
    except Exception:
        return None
    fm = post.metadata
    if not all(k in fm for k in ("title", "time", "duration")):
        return None
    title = str(fm["title"])
    status = "recorded" if title in recorded_titles else "upcoming"
    return {
        "id": path.stem,
        "time": str(fm["time"]),
        "duration": str(fm["duration"]),
        "title": title,
        "with": list(fm.get("with", [])),
        "status": status,
    }


def list_agenda(date: str) -> list[dict]:
    recorded = _meeting_titles_on(date)
    items = [
        e for e in (_parse_event(p, recorded) for p in _walk_calendar(date)) if e is not None
    ]
    items.sort(key=lambda e: e["time"])
    return items
