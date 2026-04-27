import fitz  # PyMuPDF
import docx
import io
from typing import Dict, List, Union
import re

# Define a more specific type for parsed resume data
ParsedResumeData = Dict[str, Union[str, List[str]]]

class ResumeParserService:
    def __init__(self) -> None:
        # We could initialize spacy here if needed
        # import spacy
        # self.nlp = spacy.load("en_core_web_sm")
        pass

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text)

    def parse_resume(self, file_bytes: bytes, filename: str) -> ParsedResumeData:
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_bytes)
        elif filename.lower().endswith('.docx'):
            text = self.extract_text_from_docx(file_bytes)
        else:
            raise ValueError("Unsupported file format")

        # Basic entity extraction using regex and simple logic
        # In a real scenario, we'd use a more sophisticated NLP model
        
        email = self._extract_email(text)
        phone = self._extract_phone(text)
        skills = self._extract_skills(text)
        
        return {
            "text": text,
            "email": email,
            "phone": phone,
            "skills": skills,
            "education": self._extract_education(text),
            "experience": self._extract_experience(text)
        }

    def _extract_email(self, text: str) -> str:
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        match = re.search(email_pattern, text)
        return match.group(0) if match else ""

    def _extract_phone(self, text: str) -> str:
        phone_pattern = r'\+?\d[\d -]{8,}\d'
        match = re.search(phone_pattern, text)
        return match.group(0) if match else ""

    def _extract_skills(self, text: str) -> List[str]:
        # Simple keyword-based skill extraction
        # In practice, this would be a large list or an NLP model
        common_skills = ["python", "javascript", "react", "node.js", "typescript", "java", "c++", "aws", "docker", "sql", "nosql", "nest.js", "next.js", "flutter", "arabic", "english"]
        found_skills = []
        lower_text = text.lower()
        for skill in common_skills:
            if re.search(rf'\b{re.escape(skill)}\b', lower_text):
                found_skills.append(skill)
        return found_skills

    def _extract_education(self, text: str) -> List[str]:
        # Placeholder for education extraction
        education_keywords = ["university", "college", "bachelor", "master", "phd", "degree", "diploma"]
        lines = text.split('\n')
        education = []
        for line in lines:
            if any(keyword in line.lower() for keyword in education_keywords):
                education.append(line.strip())
        return education[:3]  # Limit to first 3 matches

    def _extract_experience(self, text: str) -> List[str]:
        # Placeholder for experience extraction
        experience_keywords = ["experience", "work", "job", "position", "role", "company", "inc", "ltd"]
        lines = text.split('\n')
        experience = []
        for line in lines:
             if any(keyword in line.lower() for keyword in experience_keywords):
                if len(line.strip()) > 10: # avoid short lines
                    experience.append(line.strip())
        return experience[:5] # Limit to first 5 matches

parser_service = ResumeParserService()
