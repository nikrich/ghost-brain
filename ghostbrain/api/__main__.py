"""Run the ghostbrain read API as a subprocess from Electron main.

Picks a random free port on 127.0.0.1, generates a random 256-bit hex token,
prints the READY banner to stdout BEFORE handing off to uvicorn (so the parent
process can capture port + token from a single line), then runs the server.
"""
from __future__ import annotations

import secrets
import socket
import sys

import uvicorn

from ghostbrain.api.main import create_app


def _pick_port() -> int:
    """Bind a transient socket to an OS-assigned port, then close. Race-y but
    fine for the local-only sidecar; uvicorn re-binds the same port immediately."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main() -> int:
    token = secrets.token_hex(32)
    port = _pick_port()
    app = create_app(token=token)

    # Print the READY banner BEFORE uvicorn takes over output. Parent process
    # parses this single line to capture port + token.
    print(f"READY port={port} token={token}", flush=True)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="info",
        access_log=False,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
