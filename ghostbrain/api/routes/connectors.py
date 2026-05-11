"""GET /v1/connectors, GET /v1/connectors/{id}."""
from fastapi import APIRouter, HTTPException

from ghostbrain.api.models.connector import Connector, ConnectorDetail
from ghostbrain.api.repo.connectors import get_connector, list_connectors

router = APIRouter(prefix="/v1/connectors", tags=["connectors"])


@router.get("", response_model=list[Connector])
def connectors() -> list[dict]:
    return list_connectors()


@router.get("/{connector_id}", response_model=ConnectorDetail)
def connector_detail(connector_id: str) -> dict:
    record = get_connector(connector_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Connector not found: {connector_id}")
    return record
