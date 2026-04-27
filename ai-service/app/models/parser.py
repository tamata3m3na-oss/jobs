from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ParserResponse(BaseModel):
    text: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[str] = []
    experience: List[str] = []
