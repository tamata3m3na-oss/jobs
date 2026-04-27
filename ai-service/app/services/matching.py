from sentence_transformers import SentenceTransformer, util
import torch
import redis
import json
import hashlib
from app.core.config import settings
from typing import List, Dict, Union, Optional

class MatchingService:
    def __init__(self) -> None:
        self.model = SentenceTransformer(settings.MODEL_NAME)
        # Move to GPU if available
        if torch.cuda.is_available():
            self.model = self.model.to("cuda")
        
        # Initialize Redis
        self.redis_client: Optional[redis.Redis] = None
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")

    def _get_cache_key(self, query: str, job_ids: List[str]) -> str:
        # Create a unique key based on query and job IDs
        job_ids_str = ",".join(sorted(job_ids))
        content = f"{query}:{job_ids_str}"
        return f"match:{hashlib.md5(content.encode()).hexdigest()}"

    def get_embedding(self, text: str) -> List[float]:
        embedding = self.model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    def calculate_similarity(self, text1: str, text2: str) -> float:
        embeddings = self.model.encode([text1, text2], convert_to_tensor=True)
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        return float(similarity.item())

    def match_jobs(self, query: str, jobs: List[Dict[str, Union[str, int, float, bool, None, object]]]) -> List[Dict[str, Union[str, float]]]:
        if not jobs:
            return []
            
        job_ids = [str(j.get("id", "")) for j in jobs]
        cache_key = self._get_cache_key(query, job_ids)
        
        # Try to get from cache
        if self.redis_client:
            try:
                cached_result = self.redis_client.get(cache_key)
                if cached_result and isinstance(cached_result, str):
                    return json.loads(cached_result)
            except Exception as e:
                print(f"Redis get error: {e}")

        job_texts = [f"{str(j.get('title', ''))} {str(j.get('description', ''))}" for j in jobs]
        
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        job_embeddings = self.model.encode(job_texts, convert_to_tensor=True)
        
        cosine_scores = util.cos_sim(query_embedding, job_embeddings)[0]
        
        results: List[Dict[str, Union[str, float]]] = []
        for i, score in enumerate(cosine_scores):
            results.append({
                "job_id": job_ids[i],
                "score": float(score.item())
            })
            
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        # Store in cache (expire in 1 hour)
        if self.redis_client:
            try:
                self.redis_client.setex(
                    cache_key,
                    3600,
                    json.dumps(results)
                )
            except Exception as e:
                print(f"Redis set error: {e}")
            
        return results

matching_service = MatchingService()
