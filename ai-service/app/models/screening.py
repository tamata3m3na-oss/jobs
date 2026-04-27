from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class QuestionGenerationRequest(BaseModel):
    job_description: str
    skills: List[str]

class Question(BaseModel):
    id: str
    question: str
    topic: str

class QuestionGenerationResponse(BaseModel):
    questions: List[Question]

class EvaluationRequest(BaseModel):
    question: str
    answer: str
    expected_keywords: Optional[List[str]] = []

class EvaluationResponse(BaseModel):
    score: float
    feedback: str
    found_keywords: List[str]
