"""FastAPI service for Interview Intelligence (Port 4005)."""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import AnalyzeRequest, HealthResponse
from src.domain.models import AnswerAnalysis
from src.intelligence.engine import DEFAULT_INTELLIGENCE_ENGINE, InterviewIntelligenceEngine

app = FastAPI(
    title="EchoSphere Interview Intelligence Service",
    description="Evaluates candidate answers, extracts grounded evidence, and produces competency findings.",
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


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint for Interview Intelligence Service."""
    return HealthResponse(service="interview-intelligence", port=4005)


@app.post("/analyze", response_model=AnswerAnalysis, status_code=status.HTTP_200_OK)
@app.post("/v1/interview-intelligence/analyze", response_model=AnswerAnalysis, status_code=status.HTTP_200_OK)
async def analyze_answer(request: AnalyzeRequest) -> AnswerAnalysis:
    """Analyze a candidate's answer against target competencies."""
    try:
        analysis = engine.analyze(
            question=request.question,
            candidate_answer=request.candidate_answer,
            target_competencies=request.target_competencies,
            interview_context=request.interview_context,
            answer_id=request.answer_id,
            candidate_profile_summary=request.candidate_profile_summary,
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligence analysis failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.intelligence_api:app", host="0.0.0.0", port=4005, reload=True)
