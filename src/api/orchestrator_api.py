"""FastAPI service for Meta-Orchestrator (Port 4004)."""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import HealthResponse, NextActionRequest
from src.domain.models import NextAction
from src.orchestrator.graph import decide_next_action

app = FastAPI(
    title="EchoSphere Meta-Orchestrator Service",
    description="Adaptive LangGraph orchestrator deciding the next interview turn and agent handoffs.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint for Meta-Orchestrator Service."""
    return HealthResponse(service="meta-orchestrator", port=4004)


@app.post("/next-action", response_model=NextAction, status_code=status.HTTP_200_OK)
@app.post("/v1/meta-orchestrator/next-action", response_model=NextAction, status_code=status.HTTP_200_OK)
async def get_next_action(request: NextActionRequest) -> NextAction:
    """Evaluate interview context and answer analysis to produce NextAction."""
    try:
        next_action = decide_next_action(
            interview_context=request.interview_context,
            answer_analysis=request.answer_analysis,
            required_competencies=request.required_competencies,
            is_final_round=request.is_final_round,
            current_competency=request.current_competency,
        )
        return next_action
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Meta-orchestrator decision failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.orchestrator_api:app", host="0.0.0.0", port=4004, reload=True)
