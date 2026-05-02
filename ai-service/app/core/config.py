from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Job AI Service"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    MODEL_NAME: str = "paraphrase-multilingual-MiniLM-L12-v2"
    
    class Config:
        case_sensitive = True

settings = Settings()
