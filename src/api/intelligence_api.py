"""FastAPI service for Interview Intelligence and Knowledge Graph (Port 4005)."""

import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import (
    AnalyzeRequest,
    CVIngestRequest,
    GraphUpdateResponse,
    HealthResponse,
    JDIngestRequest,
)
from src.domain.models import AnswerAnalysis
from src.intelligence.engine import DEFAULT_INTELLIGENCE_ENGINE
from src.intelligence.llm_client import LLMProviderError
from src.knowledge_graph.services.knowledge_graph_service import KnowledgeGraphService
from src.knowledge_graph.types.contracts import (
    CrossRoundContext,
    GraphUpdate,
    GraphVisualizationData,
    RelevantPersistentContext,
)
from src.knowledge_graph.validation.validator import GraphUpdateValidator

logger = logging.getLogger(__name__)

app = FastAPI(
    title="EchoSphere Interview Intelligence & Knowledge Graph Service",
    description="Evaluates candidate answers, extracts grounded evidence, and maintains persistent multi-round Knowledge Graph.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DEFAULT_INTELLIGENCE_ENGINE
kg_service = KnowledgeGraphService()


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint for Interview Intelligence Service."""
    return HealthResponse(service="interview-intelligence", port=4005)


@app.post("/analyze", response_model=AnswerAnalysis, status_code=status.HTTP_200_OK)
@app.post("/v1/interview-intelligence/analyze", response_model=AnswerAnalysis, status_code=status.HTTP_200_OK)
async def analyze_answer(request: AnalyzeRequest) -> AnswerAnalysis:
    """Analyze a candidate's answer against target competencies and update Knowledge Graph."""
    try:
        analysis = engine.analyze(
            question=request.question,
            candidate_answer=request.candidate_answer,
            target_competencies=request.target_competencies,
            interview_context=request.interview_context,
            answer_id=request.answer_id,
            candidate_profile_summary=request.candidate_profile_summary,
        )

        # Update Knowledge Graph asynchronously/safely without breaking response
        candidate_id = (
            request.interview_context.candidate_id
            if request.interview_context
            else "CAND-505"
        )
        round_id = (
            request.interview_context.current_round_id
            if request.interview_context
            else "ROUND-001"
        )

        try:
            await kg_service.process_answer_analysis(
                candidate_id=candidate_id,
                round_id=round_id,
                question_id=f"Q-{request.answer_id}",
                question_text=request.question,
                answer_id=request.answer_id,
                candidate_answer=request.candidate_answer,
                analysis=analysis,
            )
        except Exception as kg_err:
            logger.warning("[IntelligenceAPI] Knowledge graph background update warning: %s", str(kg_err))

        return analysis
    except LLMProviderError as e:
        logger.error("LLM Provider failure for answer_id=%s: %s", request.answer_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Intelligence LLM provider unavailable: {str(e)}",
        )
    except ValueError as e:
        logger.warning("Validation error during analysis for answer_id=%s: %s", request.answer_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid analysis request parameters: {str(e)}",
        )
    except Exception as e:
        logger.error("Unexpected failure during intelligence analysis for answer_id=%s: %s", request.answer_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal intelligence analysis failed.",
        )


# ============================================================
# KNOWLEDGE GRAPH ENDPOINTS
# ============================================================

@app.post("/v1/knowledge-graph/cv", response_model=GraphUpdateResponse, status_code=status.HTTP_200_OK)
async def ingest_cv(request: CVIngestRequest) -> GraphUpdateResponse:
    """Ingest explicit candidate CV facts into Knowledge Graph."""
    success = await kg_service.ingest_cv(
        candidate_id=request.candidate_id,
        cv_text=request.cv_text,
        candidate_name=request.candidate_name,
        round_id=request.round_id,
    )
    return GraphUpdateResponse(
        success=success,
        message="CV facts extracted and ingested into Knowledge Graph",
        candidate_id=request.candidate_id,
    )


@app.post("/v1/knowledge-graph/jd", response_model=GraphUpdateResponse, status_code=status.HTTP_200_OK)
async def ingest_jd(request: JDIngestRequest) -> GraphUpdateResponse:
    """Ingest Job Description requirements into Knowledge Graph."""
    success = await kg_service.ingest_jd(
        job_id=request.job_id,
        job_title=request.job_title,
        job_description=request.job_description,
        required_competencies=request.required_competencies,
    )
    return GraphUpdateResponse(
        success=success,
        message="Job competency requirements ingested into Knowledge Graph",
    )


@app.post("/v1/knowledge-graph/update", response_model=GraphUpdateResponse, status_code=status.HTTP_200_OK)
async def apply_graph_update(update: GraphUpdate) -> GraphUpdateResponse:
    """Apply a validated GraphUpdate payload to the Knowledge Graph."""
    is_valid, errors = GraphUpdateValidator.validate(update)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GraphUpdate: {'; '.join(errors)}",
        )
    success = await kg_service.repo.apply_graph_update(update)
    return GraphUpdateResponse(
        success=success,
        message="GraphUpdate applied successfully",
        candidate_id=update.candidate_id,
    )


@app.get("/v1/knowledge-graph/candidates/{candidate_id}/context", response_model=RelevantPersistentContext)
async def get_candidate_persistent_context(
    candidate_id: str,
    competency_id: Optional[str] = Query(None, description="Optional target competency"),
) -> RelevantPersistentContext:
    """Retrieve compact, targeted candidate knowledge from Knowledge Graph."""
    return await kg_service.get_relevant_context(candidate_id, competency_id)


@app.get("/v1/knowledge-graph/candidates/{candidate_id}/cross-round", response_model=CrossRoundContext)
async def get_cross_round_context(
    candidate_id: str,
    current_competency: Optional[str] = Query(None),
) -> CrossRoundContext:
    """Retrieve prior round technical context for persona handoffs (e.g. Alex -> Jordan)."""
    return await kg_service.get_cross_round_context(candidate_id, current_competency)


@app.get("/v1/knowledge-graph/candidates/{candidate_id}/visualization", response_model=GraphVisualizationData)
async def get_graph_visualization(candidate_id: str) -> GraphVisualizationData:
    """Retrieve read-only node-link graph visualization data for UI visualizer."""
    return await kg_service.get_visualization(candidate_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.intelligence_api:app", host="0.0.0.0", port=4005, reload=True)
