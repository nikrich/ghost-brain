"""Meeting schemas."""
from pydantic import BaseModel, ConfigDict


class PastMeeting(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    date: str
    dur: str
    speakers: int
    tags: list[str]


class MeetingsPage(BaseModel):
    total: int
    items: list[PastMeeting]
