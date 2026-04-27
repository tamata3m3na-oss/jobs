from typing import List, Dict, Union
from app.services.matching import matching_service

# Define specific types for screening
EvaluationResult = Dict[str, Union[float, str, List[str]]]

class ScreeningService:
    def __init__(self) -> None:
        pass

    def generate_questions(self, job_description: str, skills: List[str]) -> List[Dict[str, str]]:
        # In a real-world scenario, we'd use an LLM here.
        # For this implementation, we'll use a template-based approach with semantic context.
        
        questions = []
        
        # Generic questions based on description
        if "react" in job_description.lower():
            questions.append({
                "id": "q1",
                "question": "Explain the difference between useMemo and useCallback in React.",
                "topic": "React"
            })
        
        if "node" in job_description.lower() or "nest" in job_description.lower():
            questions.append({
                "id": "q2",
                "question": "How does Node.js handle concurrency despite being single-threaded?",
                "topic": "Node.js"
            })
            
        for skill in skills[:3]: # Take up to 3 skills
            questions.append({
                "id": f"skill_{skill}",
                "question": f"Describe a challenging project where you used {skill} and how you handled the difficulties.",
                "topic": skill
            })
            
        if not questions:
            questions.append({
                "id": "gen_1",
                "question": "What is your experience with the tech stack mentioned in the job description?",
                "topic": "General"
            })
            
        return questions

    def evaluate_answer(self, question: str, answer: str, expected_keywords: List[str] = []) -> EvaluationResult:
        # Use semantic similarity to evaluate answer against "ideal" context
        # Or just use keywords for now
        
        score = matching_service.calculate_similarity(question, answer)
        
        # Boost score if keywords are present
        found_keywords = [k for k in expected_keywords if k.lower() in answer.lower()]
        if expected_keywords:
            keyword_score = len(found_keywords) / len(expected_keywords)
            score = (score * 0.7) + (keyword_score * 0.3)
            
        return {
            "score": round(score, 2),
            "feedback": "Good answer" if score > 0.6 else "Could be more detailed",
            "found_keywords": found_keywords
        }

screening_service = ScreeningService()
