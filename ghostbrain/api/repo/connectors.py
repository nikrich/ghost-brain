"""Connector enumeration and state."""
from __future__ import annotations

from pathlib import Path

from ghostbrain.paths import state_dir

# Static display metadata. Adding a new connector requires adding here too —
# small explicit dev tax in exchange for clean display names.
_DISPLAY: dict[str, dict] = {
    "claude_code": {
        "displayName": "Claude Code",
        "scopes": ["read .claude/projects"],
        "pulls": ["sessions", "tool uses"],
        "vaultDestination": "20-contexts/{ctx}/claude_code/",
    },
    "github": {
        "displayName": "github",
        "scopes": ["repo:read"],
        "pulls": ["issues", "PRs", "commits"],
        "vaultDestination": "20-contexts/{ctx}/github/",
    },
    "jira": {
        "displayName": "jira",
        "scopes": ["read:jira-work"],
        "pulls": ["issues", "comments"],
        "vaultDestination": "20-contexts/{ctx}/jira/",
    },
    "confluence": {
        "displayName": "confluence",
        "scopes": ["read:confluence-content"],
        "pulls": ["pages", "comments"],
        "vaultDestination": "20-contexts/{ctx}/confluence/",
    },
    "calendar": {
        "displayName": "calendar",
        "scopes": ["read events"],
        "pulls": ["events", "attendees"],
        "vaultDestination": "20-contexts/{ctx}/calendar/",
    },
    "atlassian": {
        "displayName": "atlassian",
        "scopes": ["read profile"],
        "pulls": ["account info"],
        "vaultDestination": "20-contexts/{ctx}/atlassian/",
    },
    "slack": {
        "displayName": "slack",
        "scopes": ["channels:history", "users:read"],
        "pulls": ["mentions", "threads"],
        "vaultDestination": "20-contexts/{ctx}/slack/",
    },
    "gmail": {
        "displayName": "gmail",
        "scopes": ["read messages", "read labels"],
        "pulls": ["threads", "attachments"],
        "vaultDestination": "20-contexts/{ctx}/gmail/",
    },
}

# Connector id → state-file key. Most connectors use their id; one exception:
# the calendar connector writes state to macos_calendar.last_run.
_STATE_KEY: dict[str, str] = {
    "calendar": "macos_calendar",
}

# Directories under ghostbrain/connectors/ that look like connectors but
# aren't — shared infrastructure modules (e.g. atlassian provides shared
# Cloud API helpers used by jira + confluence; it has no fetcher of its own).
_HIDDEN: frozenset[str] = frozenset({"atlassian"})

# Connector id → inbox subdirectory name under 00-inbox/raw/. Most match;
# claude_code is captured by the worker as claude-code (hyphenated).
_INBOX_DIR: dict[str, str] = {
    "claude_code": "claude-code",
}


def _connectors_root() -> Path:
    """Locate ghostbrain/connectors/ as installed."""
    # Resolve via the existing module — works regardless of install location.
    import ghostbrain.connectors

    return Path(ghostbrain.connectors.__file__).parent


def _list_connector_ids() -> list[str]:
    """Subdirectories of ghostbrain/connectors/ that look like real
    user-facing connectors (have an __init__.py, not in _HIDDEN, not _base,
    not __pycache__)."""
    root = _connectors_root()
    if not root.exists():
        return []
    ids = []
    for child in root.iterdir():
        if not child.is_dir():
            continue
        if child.name.startswith("_") or child.name == "__pycache__":
            continue
        if child.name in _HIDDEN:
            continue
        if not (child / "__init__.py").exists():
            continue
        ids.append(child.name)
    return sorted(ids)


def _has_inbox_captures(connector_id: str) -> bool:
    """Some connectors (e.g. claude_code) are event-driven, not polling —
    they never write a .last_run file, but their captures land in the inbox
    just the same. Treat presence of inbox files as evidence of liveness."""
    from ghostbrain.paths import vault_path

    dir_name = _INBOX_DIR.get(connector_id, connector_id)
    inbox = vault_path() / "00-inbox" / "raw" / dir_name
    if not inbox.exists():
        return False
    return any(inbox.glob("*.md"))


def _read_last_run(connector_id: str) -> str | None:
    """Read the .last_run file content (ISO timestamp string) or None."""
    key = _STATE_KEY.get(connector_id, connector_id)
    f = state_dir() / f"{key}.last_run"
    if not f.exists():
        return None
    try:
        return f.read_text().strip()
    except OSError:
        return None


def _connector_record(connector_id: str) -> dict:
    display = _DISPLAY.get(connector_id, {
        "displayName": connector_id,
        "scopes": [],
        "pulls": [],
        "vaultDestination": f"20-contexts/{{ctx}}/{connector_id}/",
    })
    # A connector is 'on' if EITHER:
    #   - it has a .last_run file (polling connector that has run successfully), or
    #   - it has captures already in the inbox (event-driven connector like claude_code).
    # Either signal means the connector is configured and producing data. Recency
    # surfaces via lastSyncAt; the UI flags stale runs there.
    last_run = _read_last_run(connector_id)
    has_inbox = _has_inbox_captures(connector_id)
    run_state = "on" if (last_run or has_inbox) else "off"
    return {
        "id": connector_id,
        "displayName": display["displayName"],
        "state": run_state,
        "count": 0,  # not exposed by .last_run; Phase 2 enriches
        "lastSyncAt": last_run,
        "account": None,
        "throughput": None,
        "error": None,
    }


def list_connectors() -> list[dict]:
    return [_connector_record(cid) for cid in _list_connector_ids()]


def get_connector(connector_id: str) -> dict | None:
    if connector_id not in _list_connector_ids():
        return None
    base = _connector_record(connector_id)
    display = _DISPLAY.get(connector_id, {})
    return {
        **base,
        "scopes": display.get("scopes", []),
        "pulls": display.get("pulls", []),
        "vaultDestination": display.get("vaultDestination", f"20-contexts/{{ctx}}/{connector_id}/"),
    }
