"""GET /v1/meetings."""
from fastapi import APIRouter, Query

from ghostbrain.api.models.meeting import MeetingsPage
from ghostbrain.api.repo.meetings import list_meetings

router = APIRouter(prefix="/v1/meetings", tags=["meetings"])


@router.get("", response_model=MeetingsPage)
def meetings(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> dict:
    return list_meetings(limit=limit, offset=offset)
