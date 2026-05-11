"""GET /v1/vault/stats."""
from fastapi import APIRouter

from ghostbrain.api.models.vault import VaultStats
from ghostbrain.api.repo.vault import get_vault_stats

router = APIRouter(prefix="/v1/vault", tags=["vault"])


@router.get("/stats", response_model=VaultStats)
def vault_stats() -> dict:
    return get_vault_stats()
