from fastapi import APIRouter, Depends
from app.services.matching import matching_service
from app.models.matching import MatchRequest, MatchResponse, SimilarityRequest, SimilarityResponse
from typing import Dict, List

router = APIRouter()

@router.post("/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest) -> MatchResponse:
    results = matching_service.match_jobs(request.query, request.jobs)
    return MatchResponse(results=results)

@router.post("/similarity", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest) -> SimilarityResponse:
    score = matching_service.calculate_similarity(request.text1, request.text2)
    return SimilarityResponse(score=score)

@router.post("/embedding")
async def get_embedding(request: Dict[str, str]) -> Dict[str, List[float]]:
    text = request.get("text", "")
    embedding = matching_service.get_embedding(text)
    return {"embedding": embedding}
