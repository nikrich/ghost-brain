"""FastAPI app factory for the ghostbrain read API."""
from fastapi import FastAPI

from ghostbrain.api.auth import make_auth_middleware

API_VERSION = "1.0.0"


def create_app(token: str) -> FastAPI:
    """Build a FastAPI app with auth wired in. Routers added in later tasks."""
    app = FastAPI(
        title="ghostbrain",
        description="Read-only API for the ghostbrain desktop app.",
        version=API_VERSION,
    )
    app.middleware("http")(make_auth_middleware(token))
    return app
