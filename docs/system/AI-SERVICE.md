# AI Service Documentation

The AI Service is a Python FastAPI application that provides machine learning capabilities to the Smart Job Platform.

## Core Features

### 1. Semantic Matching

Uses **Sentence-Transformers** (SBERT) to calculate semantic similarity between job descriptions and resumes.

- **Model**: `all-MiniLM-L6-v2` (default, lightweight and efficient).
- **Functionality**:
  - Job recommendation for candidates.
  - Candidate ranking for employers.
  - Raw similarity score calculation.

### 2. Resume Parsing

Extracts structured information from unstructured PDF and DOCX files.

- **Tools**: `PyMuPDF` (for PDF), `python-docx` (for DOCX), `spaCy` (for NLP).
- **Extracted Fields**:
  - Personal Information (name, email, phone).
  - Education history.
  - Experience / Work history.
  - Skills (using NLP-based extraction and keyword matching).

### 3. Skill Gap Analysis

Compares a candidate's skill set against job requirements.

- **Logic**: Identifies missing skills and provides suggestions for development.
- **Output**: Categorizes skills as "Matching", "Missing", and "Additional".

### 4. AI Screening

Automates the initial screening process.

- **Generation**: Creates relevant interview questions based on the job description.
- **Evaluation**: Scores candidate answers based on semantic relevance and keyword presence.

## API Endpoints

- `POST /match`: Matches a query (e.g., candidate profile) against a list of jobs.
- `POST /match-candidates`: Matches a job description against a list of candidate profiles.
- `POST /similarity`: Calculates the cosine similarity score between two texts.
- `POST /embedding`: Returns the vector embedding for a given text.
- `POST /parser`: Accepts a resume file and returns structured JSON data.
- `POST /skill-gap`: Analyzes the gap between candidate and required skills.
- `POST /screening/generate`: Generates screening questions.
- `POST /screening/evaluate`: Evaluates an answer to a screening question.

## Architecture

- **FastAPI**: Provides a high-performance, asynchronous web framework.
- **Pydantic**: Used for strict data validation and documentation.
- **Services Layer**: Business logic is encapsulated in service classes (e.g., `MatchingService`, `ParserService`).
- **Caching**: Frequently requested embeddings are cached in Redis to reduce computation time.

## Development Setup

1. **Prerequisites**:
   - Python 3.10+
   - Virtual environment (recommended).
2. **Installation**:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```
3. **Running the Service**:
   ```bash
   uvicorn app.main:app --reload
   ```
