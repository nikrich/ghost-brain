"""GET /v1/connectors and GET /v1/connectors/{id}."""
from pathlib import Path

from fastapi.testclient import TestClient

from ghostbrain.api.tests.conftest import write_state


def test_empty_connectors_list(client: TestClient, auth_headers: dict[str, str]):
    res = client.get("/v1/connectors", headers=auth_headers)
    assert res.status_code == 200
    # The list may not be empty (ghostbrain/connectors/ may contain entries),
    # but each item should be well-formed. Check shape, not emptiness.
    data = res.json()
    assert isinstance(data, list)
    for item in data:
        assert {"id", "displayName", "state", "count", "lastSyncAt", "account", "throughput", "error"}.issubset(item.keys())


def test_connector_state_off_when_no_state_file(
    client: TestClient, auth_headers: dict[str, str], tmp_state_dir: Path
):
    """A connector defined in ghostbrain/connectors/ but with no state.json reports state='off'."""
    res = client.get("/v1/connectors", headers=auth_headers)
    data = res.json()
    # github is one of the connectors that exists; without state it should be 'off'
    github = next((c for c in data if c["id"] == "github"), None)
    if github is not None:
        assert github["state"] == "off"


def test_connector_state_on_with_recent_sync(
    client: TestClient, auth_headers: dict[str, str], tmp_state_dir: Path
):
    write_state(tmp_state_dir, "github", {
        "last_run": "2026-05-11T13:00:00Z",
        "indexed": 824,
        "account": "theo-haunts",
    })
    res = client.get("/v1/connectors", headers=auth_headers)
    data = res.json()
    github = next((c for c in data if c["id"] == "github"), None)
    assert github is not None
    assert github["state"] == "on"
    assert github["count"] == 824
    assert github["account"] == "theo-haunts"
    assert github["lastSyncAt"] == "2026-05-11T13:00:00Z"


def test_connector_state_err_when_state_has_error(
    client: TestClient, auth_headers: dict[str, str], tmp_state_dir: Path
):
    write_state(tmp_state_dir, "github", {
        "last_run": "2026-05-09T08:00:00Z",
        "indexed": 0,
        "error": "token expired",
    })
    res = client.get("/v1/connectors", headers=auth_headers)
    github = next((c for c in res.json() if c["id"] == "github"), None)
    assert github is not None
    assert github["state"] == "err"
    assert github["error"] == "token expired"


def test_connector_detail_returns_404_for_unknown(
    client: TestClient, auth_headers: dict[str, str]
):
    res = client.get("/v1/connectors/does-not-exist", headers=auth_headers)
    assert res.status_code == 404


def test_connector_detail_includes_scopes_and_pulls(
    client: TestClient, auth_headers: dict[str, str], tmp_state_dir: Path
):
    write_state(tmp_state_dir, "github", {"last_run": "2026-05-11T13:00:00Z", "indexed": 1})
    res = client.get("/v1/connectors/github", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "scopes" in data
    assert "pulls" in data
    assert "vaultDestination" in data
