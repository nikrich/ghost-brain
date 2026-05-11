"""GET /v1/vault/stats returns aggregate vault numbers."""
from pathlib import Path

from fastapi.testclient import TestClient

from ghostbrain.api.tests.conftest import write_note, write_state


def test_empty_vault_returns_zeros(client: TestClient, auth_headers: dict[str, str]):
    res = client.get("/v1/vault/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["totalNotes"] == 0
    assert data["queuePending"] == 0
    assert data["vaultSizeBytes"] == 0
    assert data["lastSyncAt"] is None
    assert data["indexedCount"] == 0


def test_counts_markdown_notes_recursively(
    client: TestClient, auth_headers: dict[str, str], tmp_vault: Path
):
    write_note(tmp_vault, "10-daily/2026-05-11.md")
    write_note(tmp_vault, "20-contexts/personal/gmail/foo.md")
    write_note(tmp_vault, "20-contexts/work/slack/bar.md")
    res = client.get("/v1/vault/stats", headers=auth_headers)
    assert res.json()["totalNotes"] == 3


def test_counts_pending_queue_entries(
    client: TestClient, auth_headers: dict[str, str], tmp_vault: Path
):
    pending = tmp_vault / "90-meta" / "queue" / "pending"
    (pending / "1.json").write_text("{}")
    (pending / "2.json").write_text("{}")
    res = client.get("/v1/vault/stats", headers=auth_headers)
    assert res.json()["queuePending"] == 2


def test_aggregates_last_sync_and_indexed_from_state(
    client: TestClient, auth_headers: dict[str, str], tmp_state_dir: Path
):
    write_state(tmp_state_dir, "github", {"last_run": "2026-05-11T12:00:00Z", "indexed": 100})
    write_state(tmp_state_dir, "slack", {"last_run": "2026-05-11T13:30:00Z", "indexed": 250})
    res = client.get("/v1/vault/stats", headers=auth_headers)
    data = res.json()
    assert data["lastSyncAt"] == "2026-05-11T13:30:00Z"  # max
    assert data["indexedCount"] == 350  # sum
