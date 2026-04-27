import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  SkillGapAnalysis,
  PreScreeningQuestionsResponse,
  ScreeningEvaluation,
} from '@shared/schemas/ai.schema';

@ApiTags('matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Match jobs based on a query string' })
  async matchJobs(
    @Body() data: { query: string; jobs: Array<{ id: string; title: string; description: string }> },
  ): Promise<Array<{ id: string; score: number }>> {
    return this.matchingService.matchJobs(data.query, data.jobs);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Match candidates based on a job description' })
  async matchCandidates(
    @Body() data: { jobDescription: string; candidates: Array<{ id: string; skills: string[]; experience: string; bio: string }> },
  ): Promise<Array<{ id: string; score: number }>> {
    return this.matchingService.matchCandidates(data.jobDescription, data.candidates);
  }

  @Get('similarity')
  @ApiOperation({ summary: 'Calculate similarity between two texts' })
  async getSimilarity(
    @Query('text1') text1: string,
    @Query('text2') text2: string,
  ): Promise<number> {
    return this.matchingService.getSimilarity(text1, text2);
  }

  @Post('skill-gap')
  @ApiOperation({ summary: 'Analyze skill gap between candidate and job' })
  async analyzeSkillGap(
    @Body() data: { candidateSkills: string[]; requiredSkills: string[] },
  ): Promise<SkillGapAnalysis | null> {
    return this.matchingService.analyzeSkillGap(data.candidateSkills, data.requiredSkills);
  }

  @Post('screening/generate')
  @ApiOperation({ summary: 'Generate screening questions' })
  async generateQuestions(
    @Body() data: { jobDescription: string; skills: string[] },
  ): Promise<PreScreeningQuestionsResponse | null> {
    return this.matchingService.generateScreeningQuestions(data.jobDescription, data.skills);
  }

  @Post('screening/evaluate')
  @ApiOperation({ summary: 'Evaluate screening answer' })
  async evaluateAnswer(
    @Body() data: { question: string; answer: string; expectedKeywords?: string[] },
  ): Promise<ScreeningEvaluation | null> {
    return this.matchingService.evaluateScreeningAnswer(data.question, data.answer, data.expectedKeywords);
  }

  @Post('parser')
  @ApiOperation({ summary: 'Parse a resume file (PDF/DOCX)' })
  async parseResume(
    @Body() data: { file: string; filename: string },
  ): Promise<ResumeParserResponse | null> {
    // Note: In a real app, this would use multipart upload. 
    // Here we assume base64 encoded file content for simplicity in this specific endpoint.
    const buffer = Buffer.from(data.file, 'base64');
    return this.matchingService.parseResume(buffer, data.filename);
  }
}
