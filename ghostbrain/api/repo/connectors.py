"""Connector enumeration and state."""
from __future__ import annotations

import json
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


def _connectors_root() -> Path:
    """Locate ghostbrain/connectors/ as installed."""
    # Resolve via the existing module — works regardless of install location.
    import ghostbrain.connectors

    return Path(ghostbrain.connectors.__file__).parent


def _list_connector_ids() -> list[str]:
    """Subdirectories of ghostbrain/connectors/ that look like connectors
    (have an __init__.py, not _base, not __pycache__)."""
    root = _connectors_root()
    if not root.exists():
        return []
    ids = []
    for child in root.iterdir():
        if not child.is_dir():
            continue
        if child.name.startswith("_") or child.name == "__pycache__":
            continue
        if not (child / "__init__.py").exists():
            continue
        ids.append(child.name)
    return sorted(ids)


def _read_state(connector_id: str) -> dict:
    state_file = state_dir() / connector_id / "state.json"
    if not state_file.exists():
        return {}
    try:
        return json.loads(state_file.read_text())
    except json.JSONDecodeError:
        return {}


def _connector_record(connector_id: str) -> dict:
    display = _DISPLAY.get(connector_id, {
        "displayName": connector_id,
        "scopes": [],
        "pulls": [],
        "vaultDestination": f"20-contexts/{{ctx}}/{connector_id}/",
    })
    state = _read_state(connector_id)
    has_error = isinstance(state.get("error"), str) and bool(state["error"])
    has_recent_run = isinstance(state.get("last_run"), str) and bool(state["last_run"])
    if has_error:
        run_state = "err"
    elif has_recent_run:
        run_state = "on"
    else:
        run_state = "off"
    return {
        "id": connector_id,
        "displayName": display["displayName"],
        "state": run_state,
        "count": int(state.get("indexed", 0)),
        "lastSyncAt": state.get("last_run"),
        "account": state.get("account"),
        "throughput": state.get("throughput"),
        "error": state.get("error"),
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
