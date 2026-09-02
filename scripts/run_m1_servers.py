"""Async single-process launcher for both Member 1 services."""

import asyncio
import sys
import uvicorn

from src.api.intelligence_api import app as intel_app
from src.api.orchestrator_api import app as orch_app


async def main():
    config_intel = uvicorn.Config(
        intel_app,
        host="127.0.0.1",
        port=4005,
        log_level="warning",
        access_log=False,
    )
    config_orch = uvicorn.Config(
        orch_app,
        host="127.0.0.1",
        port=4004,
        log_level="warning",
        access_log=False,
    )

    server_intel = uvicorn.Server(config_intel)
    server_orch = uvicorn.Server(config_orch)

    print("Starting M1 Intelligence on :4005 and Meta-Orchestrator on :4004...", flush=True)
    await asyncio.gather(server_intel.serve(), server_orch.serve())


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("M1 Services stopped.", flush=True)
        sys.exit(0)
