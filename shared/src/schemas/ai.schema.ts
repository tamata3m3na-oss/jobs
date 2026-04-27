import { z } from 'zod';

export const SkillGapAnalysisSchema = z.object({
  missing_skills: z.array(z.string()),
  matching_skills: z.array(z.string()),
  recommendations: z.array(
    z.object({
      skill: z.string(),
      recommendation: z.string(),
      platform: z.string(),
    })
  ),
  match_percentage: z.number().min(0).max(100),
});

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>;

export const PreScreeningQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  topic: z.string(),
});

export type PreScreeningQuestion = z.infer<typeof PreScreeningQuestionSchema>;

export const PreScreeningQuestionsResponseSchema = z.object({
  questions: z.array(PreScreeningQuestionSchema),
});

export type PreScreeningQuestionsResponse = z.infer<typeof PreScreeningQuestionsResponseSchema>;

export const ScreeningEvaluationSchema = z.object({
  score: z.number().min(0).max(1),
  feedback: z.string(),
  found_keywords: z.array(z.string()),
});

export type ScreeningEvaluation = z.infer<typeof ScreeningEvaluationSchema>;

export const ResumeParserResponseSchema = z.object({
  text: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  skills: z.array(z.string()),
  education: z.array(z.string()),
  experience: z.array(z.string()),
});

export type ResumeParserResponse = z.infer<typeof ResumeParserResponseSchema>;
