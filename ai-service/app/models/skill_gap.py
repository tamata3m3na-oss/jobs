from pydantic import BaseModel
from typing import List, Dict, Any

class SkillGapRequest(BaseModel):
    candidate_skills: List[str]
    required_skills: List[str]

class Recommendation(BaseModel):
    skill: str
    recommendation: str
    platform: str

class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    matching_skills: List[str]
    recommendations: List[Recommendation]
    match_percentage: float
