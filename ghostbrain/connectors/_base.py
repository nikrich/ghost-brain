"""Base class for source connectors. See SPEC §4.1."""

from __future__ import annotations

import json
import re
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path


class Connector(ABC):
    """Base class for all data source connectors."""

    name: str
    version: str = "1.0"

    def __init__(self, config: dict, queue_dir: Path, state_dir: Path) -> None:
        self.config = config
        self.queue_dir = queue_dir
        self.state_dir = state_dir

    @abstractmethod
    def fetch(self, since: datetime) -> list[dict]:
        """Fetch raw events from the source since `since`."""

    @abstractmethod
    def normalize(self, raw: dict) -> dict:
        """Convert source-specific data to the standard event shape (SPEC §4.2)."""

    @abstractmethod
    def health_check(self) -> bool:
        """Verify the connector can reach the source."""

    def run(self) -> int:
        """Standard run loop. Returns count of events queued."""
        since = self._get_last_run()
        raw_events = self.fetch(since)
        for raw in raw_events:
            event = self.normalize(raw)
            self._enqueue(event)
        self._save_last_run()
        return len(raw_events)

    def _enqueue(self, event: dict) -> None:
        event_id = event.get("id") or str(uuid.uuid4())
        timestamp = event.get("timestamp") or _utcnow_iso()
        # Slugify so the filename is safe (event ids may contain `:`, `/`,
        # `#`, etc. — common in github:pr:owner/repo#42 style ids).
        filename = f"{_safe(timestamp)}-{self.name}-{_safe(event_id)}.json"
        path = self.queue_dir / "pending" / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(event, indent=2))

    def _state_file(self) -> Path:
        return self.state_dir / f"{self.name}.last_run"

    def _get_last_run(self) -> datetime:
        f = self._state_file()
        if f.exists():
            return datetime.fromisoformat(f.read_text().strip())
        return datetime.fromtimestamp(0, tz=timezone.utc)

    def _save_last_run(self) -> None:
        f = self._state_file()
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(_utcnow_iso())


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


_FILENAME_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")


def _safe(value: str) -> str:
    """Make `value` filesystem-safe. Collapses runs of unsafe chars into '-'."""
    return _FILENAME_UNSAFE.sub("-", value).strip("-")
