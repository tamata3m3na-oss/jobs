from pydantic import BaseModel
from typing import List, Dict, Union

# Define a more specific type for job data
JobDataValue = Union[str, int, float, bool, List[str], None]
JobData = Dict[str, JobDataValue]

class MatchRequest(BaseModel):
    query: str
    jobs: List[Dict[str, Union[str, int, float, bool, List[str], Dict[str, str], None, object]]]

class MatchResult(BaseModel):
    id: str
    score: float

class MatchResponse(BaseModel):
    results: List[MatchResult]

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

class SimilarityResponse(BaseModel):
    score: float
