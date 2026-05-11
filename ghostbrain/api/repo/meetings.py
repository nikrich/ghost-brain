"""Meeting markdown reader.

Reads files matching <vault>/20-contexts/*/meetings/*.md. Frontmatter must
contain at minimum: title, date, dur, speakers, tags.
"""
from __future__ import annotations

from pathlib import Path

import frontmatter

from ghostbrain.paths import vault_path


def _walk_meeting_files() -> list[Path]:
    vault = vault_path()
    if not vault.exists():
        return []
    pattern = "20-contexts/*/meetings/*.md"
    return list(vault.glob(pattern))


def _parse(path: Path) -> dict | None:
    try:
        post = frontmatter.load(path)
    except Exception:
        return None
    fm = post.metadata
    if not all(k in fm for k in ("title", "date", "dur", "speakers")):
        return None
    return {
        "id": path.stem,
        "title": str(fm["title"]),
        "date": str(fm["date"]),
        "dur": str(fm["dur"]),
        "speakers": int(fm["speakers"]),
        "tags": list(fm.get("tags", [])),
    }


def list_meetings(limit: int = 50, offset: int = 0) -> dict:
    items = [m for m in (_parse(p) for p in _walk_meeting_files()) if m is not None]
    items.sort(key=lambda m: m["date"], reverse=True)
    total = len(items)
    return {"total": total, "items": items[offset : offset + limit]}
