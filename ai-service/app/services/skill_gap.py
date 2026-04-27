from typing import List, Dict, Union
from app.services.matching import matching_service

# Define specific types for skill gap analysis
RecommendationDict = Dict[str, str]
SkillGapAnalysisResult = Dict[str, Union[List[str], List[RecommendationDict], float]]

class SkillGapService:
    def __init__(self) -> None:
        pass

    def analyze_gap(self, candidate_skills: List[str], required_skills: List[str]) -> SkillGapAnalysisResult:
        candidate_skills_lower = [s.lower() for s in candidate_skills]
        required_skills_lower = [s.lower() for s in required_skills]
        
        missing_skills = [s for s in required_skills if s.lower() not in candidate_skills_lower]
        matching_skills = [s for s in required_skills if s.lower() in candidate_skills_lower]
        
        # Simple recommendation engine based on missing skills
        recommendations = []
        for skill in missing_skills:
            recommendations.append({
                "skill": skill,
                "recommendation": f"Take a course on {skill} to improve your profile.",
                "platform": "Coursera / Udemy / LinkedIn Learning"
            })
            
        return {
            "missing_skills": missing_skills,
            "matching_skills": matching_skills,
            "recommendations": recommendations,
            "match_percentage": (len(matching_skills) / len(required_skills) * 100) if required_skills else 100
        }

skill_gap_service = SkillGapService()
