import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SkillGapAnalysis,
  PreScreeningQuestionsResponse,
  ScreeningEvaluation,
  ResumeParserResponse,
} from '@shared/schemas/ai.schema';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private readonly aiServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>('aiService.url');
  }

  async matchJobs(query: string, jobs: Array<{ id: string; title: string; description: string }>): Promise<Array<{ id: string; score: number }>> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, jobs }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const result = await response.json();
      return result.results;
    } catch (error) {
      this.logger.error(`Failed to call AI Service: ${error.message}`);
      return jobs.map(job => ({ id: job.id, score: 0 }));
    }
  }

  async matchCandidates(jobDescription: string, candidates: Array<{ id: string; skills: string[]; experience: string; bio: string }>): Promise<Array<{ id: string; score: number }>> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/match-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: jobDescription, jobs: candidates }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const result = await response.json();
      return result.results;
    } catch (error) {
      this.logger.error(`Failed to call AI Service for candidate matching: ${error.message}`);
      return candidates.map(c => ({ id: c.id, score: 0 }));
    }
  }

  async getSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/similarity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text1, text2 }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const result = await response.json();
      return result.score;
    } catch (error) {
      this.logger.error(`Failed to call AI Service: ${error.message}`);
      return 0;
    }
  }

  async analyzeSkillGap(candidateSkills: string[], requiredSkills: string[]): Promise<SkillGapAnalysis | null> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidate_skills: candidateSkills, required_skills: requiredSkills }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI Service for skill gap analysis: ${error.message}`);
      return null;
    }
  }

  async generateScreeningQuestions(jobDescription: string, skills: string[]): Promise<PreScreeningQuestionsResponse | null> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/screening/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_description: jobDescription, skills }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI Service for question generation: ${error.message}`);
      return null;
    }
  }

  async evaluateScreeningAnswer(question: string, answer: string, expectedKeywords: string[] = []): Promise<ScreeningEvaluation | null> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/screening/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer, expected_keywords: expectedKeywords }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI Service for answer evaluation: ${error.message}`);
      return null;
    }
  }

  async parseResume(file: Buffer, filename: string): Promise<ResumeParserResponse | null> {
    try {
      const formData = new FormData();
      const blob = new Blob([file]);
      formData.append('file', blob, filename);

      const response = await fetch(`${this.aiServiceUrl}/api/v1/parser`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI Service for resume parsing: ${error.message}`);
      return null;
    }
  }
}
