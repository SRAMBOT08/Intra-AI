"""Unified CLI launcher to run EchoSphere Member 1 services."""

import argparse
import multiprocessing
import uvicorn


def run_intelligence(port: int = 4005, host: str = "0.0.0.0"):
    """Run Interview Intelligence service."""
    uvicorn.run("src.api.intelligence_api:app", host=host, port=port, reload=False)


def run_orchestrator(port: int = 4004, host: str = "0.0.0.0"):
    """Run Meta-Orchestrator service."""
    uvicorn.run("src.api.orchestrator_api:app", host=host, port=port, reload=False)


def main():
    parser = argparse.ArgumentParser(description="EchoSphere Member 1 Service Launcher")
    parser.add_argument(
        "--service",
        choices=["all", "intelligence", "orchestrator"],
        default="all",
        help="Service to start (default: all)",
    )
    parser.add_argument("--host", default="0.0.0.0", help="Binding host")
    parser.add_argument("--intel-port", type=int, default=4005, help="Interview Intelligence port")
    parser.add_argument("--orch-port", type=int, default=4004, help="Meta-Orchestrator port")
    args = parser.parse_args()

    if args.service == "intelligence":
        run_intelligence(port=args.intel_port, host=args.host)
    elif args.service == "orchestrator":
        run_orchestrator(port=args.orch_port, host=args.host)
    else:
        p1 = multiprocessing.Process(target=run_intelligence, args=(args.intel_port, args.host))
        p2 = multiprocessing.Process(target=run_orchestrator, args=(args.orch_port, args.host))
        p1.start()
        p2.start()
        try:
            p1.join()
            p2.join()
        except KeyboardInterrupt:
            p1.terminate()
            p2.terminate()


if __name__ == "__main__":
    main()
