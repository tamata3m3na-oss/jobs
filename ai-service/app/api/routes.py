from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.services.matching import matching_service
from app.services.parser import parser_service
from app.services.skill_gap import skill_gap_service
from app.services.screening import screening_service

from app.models.matching import MatchRequest, MatchResponse, SimilarityRequest, SimilarityResponse
from app.models.parser import ParserResponse
from app.models.skill_gap import SkillGapRequest, SkillGapResponse
from app.models.screening import QuestionGenerationRequest, QuestionGenerationResponse, EvaluationRequest, EvaluationResponse

from typing import Dict, List, Any

router = APIRouter()

@router.post("/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest) -> MatchResponse:
    results = matching_service.match_jobs(request.query, request.jobs)
    return MatchResponse(results=results)

@router.post("/match-candidates", response_model=MatchResponse)
async def match_candidates(request: MatchRequest) -> MatchResponse:
    # MatchRequest has 'query' and 'jobs', we'll use 'query' as job_description 
    # and 'jobs' as candidate list for reuse of the model
    results = matching_service.match_candidates(request.query, request.jobs)
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

@router.post("/parser", response_model=ParserResponse)
async def parse_resume(file: UploadFile = File(...)) -> ParserResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    contents = await file.read()
    try:
        result = parser_service.parse_resume(contents, file.filename)
        return ParserResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest) -> SkillGapResponse:
    result = skill_gap_service.analyze_gap(request.candidate_skills, request.required_skills)
    return SkillGapResponse(**result)

@router.post("/screening/generate", response_model=QuestionGenerationResponse)
async def generate_questions(request: QuestionGenerationRequest) -> QuestionGenerationResponse:
    questions = screening_service.generate_questions(request.job_description, request.skills)
    return QuestionGenerationResponse(questions=questions)

@router.post("/screening/evaluate", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluationRequest) -> EvaluationResponse:
    result = screening_service.evaluate_answer(request.question, request.answer, request.expected_keywords or [])
    return EvaluationResponse(**result)
